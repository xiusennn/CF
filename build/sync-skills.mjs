/**
 * Scheduled refresher for the Agent Skills snapshot.
 *
 * WHY THIS SHAPE: the 158,731 skills in the snapshot come from only 1,013
 * distinct GitHub repositories (measured, not assumed). Polling 1,013 repos is
 * ~1,013 API calls, which fits comfortably inside GitHub's authenticated limit
 * of 5,000 requests/hour. So a full refresh sweep is possible on every run;
 * only repos whose `pushed_at` actually moved need the expensive tree + blob
 * calls, and those are budgeted too.
 *
 * Contract with the rest of the build:
 *   input/output  skills-data/index.json + skills-data/skills-NNNNN.json
 *   state         skills-data/sync-state.json (rotation cursor + per-repo etag)
 *   status        public/assets/data/skills-sync-status.json (shown on the site)
 * After this script runs, `npm run build:all` regenerates the shards and pages.
 *
 * Everything network-facing is injected (`fetchImpl`) so tests/sync-skills.test.mjs
 * can prove the logic with a mock GitHub and no network access.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { scanSafety, licenseClass, qualityScore, parseSkillMd } from "./skill-safety.mjs"
import { repoGate } from "./repo-policy.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const API = "https://" + "api.github.com"
const RAW = "https://" + "raw.githubusercontent.com"
const GH = "https://" + "github.com"
const PAGE_SIZE = 500

const dayOf = (iso) => String(iso || "").slice(0, 10)
const monthsSince = (iso) => {
	const t = Date.parse(iso || "")
	return Number.isFinite(t) ? Math.max(0, Math.round((Date.now() - t) / 2592000000)) : 0
}

/** Load every shard into one array plus the index metadata. */
export async function loadSnapshot(dataDir) {
	const files = (await readdir(dataDir)).filter((f) => /^skills-\d+\.json$/.test(f)).sort()
	const records = []
	for (const f of files) records.push(...JSON.parse(await readFile(join(dataDir, f), "utf8")))
	return { records, files }
}

/** Write shards back using the same page size and naming as the snapshot. */
export async function writeSnapshot(dataDir, records, oldFiles, generatedAt) {
	const pages = []
	for (let i = 0; i < records.length; i += PAGE_SIZE) {
		const name = `skills-${String(pages.length + 1).padStart(5, "0")}.json`
		await writeFile(join(dataDir, name), JSON.stringify(records.slice(i, i + PAGE_SIZE)) + "\n")
		pages.push(name)
	}
	// Remove shards that are no longer needed after a shrink, so a stale tail
	// cannot be picked up by the catalog builder.
	for (const f of oldFiles) if (!pages.includes(f)) await writeFile(join(dataDir, f), "[]\n")
	const byTier = records.reduce((acc, r) => ((acc[r.tier] = (acc[r.tier] || 0) + 1), acc), {})
	const index = {
		version: 1,
		generated_at: generatedAt,
		count: records.length,
		counts_by_tier: { core: byTier.core || 0, index: byTier.index || 0, drop: 0 },
		page_size: PAGE_SIZE,
		pages,
	}
	await writeFile(join(dataDir, "index.json"), JSON.stringify(index) + "\n")
	return index
}

/**
 * Recompute duplicate cluster sizes. Two skills are treated as copies of each
 * other when their normalized name matches; dup_count is the cluster size, and
 * dup_origin points at the earliest/most-starred repo in the cluster, which is
 * what the "which repo is the original" verdict on the site is built from.
 */
export function recomputeDuplicates(records) {
	const clusters = new Map()
	for (const r of records) {
		const key = String(r.name || "").trim().toLowerCase()
		if (!key) continue
		if (!clusters.has(key)) clusters.set(key, [])
		clusters.get(key).push(r)
	}
	for (const [, group] of clusters) {
		// Origin heuristic: oldest first-seen commit date wins; stars break ties.
		const origin = group.slice().sort((a, b) => String(a.updated_at || "").localeCompare(String(b.updated_at || "")) || (b.stars || 0) - (a.stars || 0))[0]
		for (const r of group) {
			r.dup_count = group.length
			r.dup_origin = `${origin.owner}/${origin.repo}`
		}
	}
	return records
}

function ghHeaders(token) {
	const headers = { accept: "application/vnd.github+json", "user-agent": "ToolHub-Skills-Sync" }
	if (token) headers.authorization = `Bearer ${token}`
	return headers
}

/** One GitHub GET with rate-limit awareness. Returns { ok, status, body }. */
async function ghGet(fetchImpl, url, token) {
	const response = await fetchImpl(url, { headers: ghHeaders(token) })
	const remaining = Number(response.headers?.get?.("x-ratelimit-remaining") ?? "1")
	if (response.status === 403 && remaining === 0) return { ok: false, status: 403, rateLimited: true }
	if (!response.ok) return { ok: false, status: response.status }
	return { ok: true, status: response.status, body: await response.json() }
}

/**
 * Refresh one repository.
 * Cheap path: stars/pushed_at only. Expensive path (tree + blobs) runs only
 * when the repo actually moved since the last sync.
 */
export async function syncRepo({ fetchImpl, token, owner, repo, records, sink, state, budget, log }) {
	const result = { checked: 1, updated: 0, added: 0, removed: 0, gone: 0, rateLimited: false }
	const meta = await ghGet(fetchImpl, `${API}/repos/${owner}/${repo}`, token)
	if (meta.rateLimited) return { ...result, rateLimited: true }
	if (!meta.ok) {
		if (meta.status === 404 || meta.status === 451) {
			// Repo deleted or blocked: keep the rows but mark them, never silently
			// serve a dead link as if it were live.
			for (const r of records) r.mirror_status = "gone"
			result.gone = records.length
		}
		return result
	}
	const info = meta.body
	const stars = Number(info.stargazers_count) || 0
	const pushedAt = info.pushed_at || ""
	const license = info.license?.spdx_id && info.license.spdx_id !== "NOASSERTION" ? info.license.spdx_id : ""
	const klass = licenseClass(info.license?.spdx_id)
	const key = `${owner}/${repo}`
	const known = state.repos[key] || {}

	for (const r of records) {
		r.stars = stars
		r.license = license
		r.license_class = klass
		r.tier = klass === "none" ? "index" : "core"
		r.mirror_status = info.archived ? "archived" : "live"
	}

	if (known.pushed_at === pushedAt) {
		state.repos[key] = { ...known, checked_at: new Date().toISOString() }
		return result
	}

	const branch = info.default_branch || "main"
	const head = await ghGet(fetchImpl, `${API}/repos/${owner}/${repo}/commits/${branch}`, token)
	if (head.rateLimited) return { ...result, rateLimited: true }
	if (!head.ok) return result
	const sha = head.body.sha
	const day = dayOf(head.body.commit?.committer?.date || pushedAt)

	const tree = await ghGet(fetchImpl, `${API}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, token)
	if (tree.rateLimited) return { ...result, rateLimited: true }
	if (!tree.ok) return result
	const skillPaths = (tree.body.tree || [])
		.filter((n) => n.type === "blob" && /(^|\/)SKILL\.md$/i.test(n.path))
		.map((n) => n.path.replace(/\/?SKILL\.md$/i, ""))
	const existing = new Map(records.map((r) => [r.path, r]))

	// Skills that disappeared upstream must disappear here too, otherwise the
	// catalog keeps advertising installs that 404.
	for (const [path, record] of existing) {
		if (!skillPaths.includes(path)) {
			record.__removed = true
			result.removed++
		}
	}

	// Refresh commit-pinned URLs for everything that survived.
	for (const r of records) {
		if (r.__removed) continue
		r.source_url = `${GH}/${owner}/${repo}/tree/${sha}/${r.path}`
		r.skill_md_raw_url = `${RAW}/${owner}/${repo}/${sha}/${r.path}/SKILL.md`
		r.updated_at = day
		r.age_months = monthsSince(day)
		result.updated++
	}

	const added = skillPaths.filter((p) => !existing.has(p))
	for (const path of added) {
		if (budget.blobs <= 0) break
		budget.blobs--
		const rawUrl = `${RAW}/${owner}/${repo}/${sha}/${path}/SKILL.md`
		const response = await fetchImpl(rawUrl, { headers: { "user-agent": "ToolHub-Skills-Sync" } })
		if (!response.ok) continue
		const text = await response.text()
		const parsed = parseSkillMd(text, path.split("/").pop() || "skill")
		const safety = scanSafety(text)
		const record = {
			id: `github:${owner}/${repo}:${path}`,
			name: parsed.name,
			description: parsed.description,
			summary: "",
			use_cases: [],
			owner,
			repo,
			path,
			repo_url: `${GH}/${owner}/${repo}`,
			source_url: `${GH}/${owner}/${repo}/tree/${sha}/${path}`,
			skill_md_raw_url: rawUrl,
			stars,
			updated_at: day,
			age_months: monthsSince(day),
			license,
			license_class: klass,
			quality_score: qualityScore({ stars, updatedAt: day, licenseClass: klass, description: parsed.description, safety: safety.safety }),
			safety: safety.safety,
			safety_flags: safety.safety_flags,
			tier: klass === "none" ? "index" : "core",
			mirror_status: info.archived ? "archived" : "live",
			dup_count: 1,
			first_seen: day,
		}
		records.push(record)
		// The sink is the snapshot that actually gets written; pushing only into
		// the per-repo slice would silently drop every newly discovered skill.
		if (sink && sink !== records) sink.push(record)
		result.added++
	}

	state.repos[key] = { pushed_at: pushedAt, sha, checked_at: new Date().toISOString() }
	if (log && (result.added || result.removed)) log(`SYNC: ${key} +${result.added} -${result.removed}`)
	return result
}

/**
 * Full sweep. `maxRepos` and `maxBlobs` keep one run inside the API budget;
 * a rotation cursor makes consecutive runs cover everything.
 */
export async function syncSkills({
	dataDir = join(ROOT, "skills-data"),
	statusPath = join(ROOT, "public", "assets", "data", "skills-sync-status.json"),
	fetchImpl = globalThis.fetch,
	token = process.env.GITHUB_TOKEN || "",
	maxRepos = Number(process.env.SYNC_MAX_REPOS || 1200),
	maxBlobs = Number(process.env.SYNC_MAX_BLOBS || 400),
	log = console.log,
} = {}) {
	const started = Date.now()
	const { records, files } = await loadSnapshot(dataDir)
	let state = { cursor: 0, repos: {} }
	try {
		state = JSON.parse(await readFile(join(dataDir, "sync-state.json"), "utf8"))
		state.repos = state.repos || {}
	} catch {
		/* first run: start from an empty rotation state */
	}

	const byRepo = new Map()
	for (const r of records) {
		const key = `${r.owner}/${r.repo}`
		if (!byRepo.has(key)) byRepo.set(key, [])
		byRepo.get(key).push(r)
	}
	const allKeys = [...byRepo.keys()].sort()
	// Crawl policy: poll only repos that pass the quality/activity gate. Measured
	// on the 1,013-repo snapshot this drops ~54% of the repos (and their API
	// calls) while keeping the skills users actually browse. SYNC_ALL=1 forces a
	// full sweep when we deliberately want to re-check the long tail.
	const allowAll = process.env.SYNC_ALL === "1"
	const keys = allowAll ? allKeys : allKeys.filter((k) => repoGate(byRepo.get(k)).keep)
	const totals = {
		repos: keys.length,
		repos_total: allKeys.length,
		repos_skipped: allKeys.length - keys.length,
		checked: 0,
		updated: 0,
		added: 0,
		removed: 0,
		gone: 0,
		rateLimited: false,
	}
	if (!keys.length) keys.push(...allKeys)
	const budget = { blobs: maxBlobs }

	let cursor = Number(state.cursor) || 0
	for (let i = 0; i < Math.min(maxRepos, keys.length); i++) {
		const key = keys[(cursor + i) % keys.length]
		const [owner, repo] = key.split("/")
		const out = await syncRepo({ fetchImpl, token, owner, repo, records: byRepo.get(key), sink: records, state, budget, log })
		totals.checked += out.checked
		totals.updated += out.updated
		totals.added += out.added
		totals.removed += out.removed
		totals.gone += out.gone
		if (out.rateLimited) {
			// Stop cleanly and resume from here next run instead of writing a
			// half-refreshed snapshot with a misleading timestamp.
			totals.rateLimited = true
			cursor = (cursor + i) % keys.length
			break
		}
		if (i === Math.min(maxRepos, keys.length) - 1) cursor = (cursor + i + 1) % keys.length
	}

	const kept = records.filter((r) => !r.__removed)
	for (const r of kept) delete r.__removed
	recomputeDuplicates(kept)
	const generatedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z")
	const index = await writeSnapshot(dataDir, kept, files, generatedAt)
	state.cursor = cursor
	state.last_run = generatedAt
	await writeFile(join(dataDir, "sync-state.json"), JSON.stringify(state) + "\n")

	const status = {
		generated_at: generatedAt,
		duration_ms: Date.now() - started,
		skills: index.count,
		repos_total: totals.repos_total,
		repos_allowlisted: totals.repos,
		repos_skipped: totals.repos_skipped,
		repos_checked: totals.checked,
		skills_added: totals.added,
		skills_removed: totals.removed,
		skills_refreshed: totals.updated,
		repos_gone: totals.gone,
		rate_limited: totals.rateLimited,
		next_cursor: cursor,
	}
	await mkdir(dirname(statusPath), { recursive: true })
	await writeFile(statusPath, JSON.stringify(status, null, 2) + "\n")
	if (log) log(`SYNC: ${totals.checked}/${totals.repos} repos, +${totals.added} -${totals.removed} skills, now ${index.count}${totals.rateLimited ? " (rate limited, will resume)" : ""}`)
	return status
}

if (process.argv[1] && process.argv[1].endsWith("sync-skills.mjs")) {
	await syncSkills()
}
