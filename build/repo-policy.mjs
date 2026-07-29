/**
 * Curation policy: which repos we crawl, and what survives into the catalog.
 *
 * WHY THESE NUMBERS (measured on the 2026-07-28 snapshot, not guessed):
 *   1,013 repos / 158,731 skills
 *   repo stars      max 164,182 | p50 88 | 478 repos have >= 100 stars
 *   skills per repo max 23,589  | p50 5  | 357 repos contain a single skill
 *   stars >= 20 AND pushed <= 180d  ->  ~760 repos / ~94k skills
 *   name clusters with copies       ->  17,995 clusters / 61,815 skills
 * A handful of dump repos (Klotzkette 23,589, majiayu000 13,903,
 * modbender 10,199 with 12 stars) produce a quarter of the catalog, so a
 * per-repo cap matters more than any star threshold.
 *
 * Three independent gates, in this order:
 *   A. repoGate()   - is the repo worth crawling at all (quality + activity)
 *   B. capRepo()    - no single repo may flood the catalog
 *   C. dedupe()     - one canonical record per duplicate cluster, copies folded
 */

export const POLICY = {
	MIN_STARS: 100, // grid-tested: 474 repos / 14,112 skills / avg quality 0.845
	FRESH_DAYS: 180, // "actively maintained": pushed within half a year
	FAMOUS_STARS: 500, // famous repos stay even if they move slowly
	HARD_STALE_DAYS: 730, // nothing untouched for 2 years survives
	MAX_PER_REPO: 300, // anti-flood cap, keeps the biggest dumps in check
	MIN_DESC: 12, // records with no real description are noise
}

export const CF_FREE = {
	MAX_FILES: 20000, // Cloudflare Workers static assets: file count limit
	MAX_FILE_BYTES: 25 * 1024 * 1024, // per-asset size limit
	BUDGET_FILES: 18000, // our own ceiling: 90% of the limit, leaves room
}

const DAY = 86400000

export function daysOld(iso, now = Date.now()) {
	const t = Date.parse(String(iso || "").slice(0, 10))
	return Number.isFinite(t) ? Math.max(0, Math.round((now - t) / DAY)) : Infinity
}

/**
 * A. Should we crawl / keep this repo?
 * @returns {{keep: boolean, reason: string, stars: number, days: number}}
 */
export function repoGate(records, now = Date.now()) {
	const stars = Math.max(0, ...records.map((r) => Number(r.stars) || 0))
	const days = Math.min(...records.map((r) => daysOld(r.updated_at, now)))
	if (days > POLICY.HARD_STALE_DAYS) return { keep: false, reason: "stale", stars, days }
	if (stars >= POLICY.FAMOUS_STARS) return { keep: true, reason: "famous", stars, days }
	if (stars < POLICY.MIN_STARS) return { keep: false, reason: "low-stars", stars, days }
	if (days > POLICY.FRESH_DAYS) return { keep: false, reason: "inactive", stars, days }
	return { keep: true, reason: "quality", stars, days }
}

/** Sort key for "best first" inside one repo: quality, then stars, then fresh. */
function betterFirst(a, b) {
	return (
		(Number(b.quality_score) || 0) - (Number(a.quality_score) || 0) ||
		(Number(b.stars) || 0) - (Number(a.stars) || 0) ||
		String(b.updated_at || "").localeCompare(String(a.updated_at || ""))
	)
}

/** B. Cap one repo's contribution, keeping its best records. */
export function capRepo(records, max = POLICY.MAX_PER_REPO) {
	if (records.length <= max) return { kept: records, dropped: [] }
	const sorted = [...records].sort(betterFirst)
	return { kept: sorted.slice(0, max), dropped: sorted.slice(max) }
}

/** Normalised clustering key: same skill name published in many repos. */
export function clusterKey(r) {
	return String(r.name || r.path || "")
		.toLowerCase()
		.replace(/[\s_]+/g, "-")
		.replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

/**
 * C. Collapse duplicate clusters to one canonical record.
 * Canonical = earliest updated_at (the origin), stars break ties. Copies are
 * not deleted from the data - they are folded into the canonical record as
 * `dup_count` / `dup_origin` / `dup_repos` so the site can still show
 * "source repo X, N copies elsewhere".
 */
export function dedupe(records) {
	const clusters = new Map()
	for (const r of records) {
		const k = clusterKey(r)
		if (!k) continue
		if (!clusters.has(k)) clusters.set(k, [])
		clusters.get(k).push(r)
	}
	const canonical = []
	let folded = 0
	for (const group of clusters.values()) {
		group.sort(
			(a, b) =>
				String(a.updated_at || "").localeCompare(String(b.updated_at || "")) ||
				(Number(b.stars) || 0) - (Number(a.stars) || 0),
		)
		const origin = group[0]
		const originKey = `${origin.owner}/${origin.repo}`
		const repos = [...new Set(group.map((r) => `${r.owner}/${r.repo}`))]
		for (const r of group) {
			r.dup_count = group.length
			r.dup_origin = originKey
		}
		origin.dup_repos = repos.slice(0, 12)
		origin.is_canonical = true
		canonical.push(origin)
		folded += group.length - 1
	}
	return { canonical, folded, clusters: clusters.size }
}

/**
 * Full pipeline used by both the crawler (to pick repos) and the catalog
 * builder (to pick records). Pure function, so tests can prove it.
 */
export function curate(records, { now = Date.now(), maxPerRepo = POLICY.MAX_PER_REPO, collapse = true } = {}) {
	const byRepo = new Map()
	for (const r of records) {
		const key = `${r.owner}/${r.repo}`
		if (!byRepo.has(key)) byRepo.set(key, [])
		byRepo.get(key).push(r)
	}
	const stats = {
		reposIn: byRepo.size,
		reposKept: 0,
		skillsIn: records.length,
		dropped: { stale: 0, "low-stars": 0, inactive: 0, capped: 0, thin: 0, folded: 0 },
		allowlist: [],
	}
	let kept = []
	for (const [key, group] of byRepo) {
		const gate = repoGate(group, now)
		if (!gate.keep) {
			stats.dropped[gate.reason] += group.length
			continue
		}
		const thin = group.filter((r) => String(r.description || "").trim().length >= POLICY.MIN_DESC)
		stats.dropped.thin += group.length - thin.length
		if (!thin.length) continue
		const { kept: capped, dropped } = capRepo(thin, maxPerRepo)
		stats.dropped.capped += dropped.length
		stats.reposKept++
		stats.allowlist.push({ repo: key, stars: gate.stars, days: gate.days, skills: capped.length })
		kept = kept.concat(capped)
	}
	if (collapse) {
		const { canonical, folded, clusters } = dedupe(kept)
		stats.dropped.folded = folded
		stats.clusters = clusters
		kept = canonical
	}
	stats.skillsOut = kept.length
	stats.allowlist.sort((a, b) => b.stars - a.stars)
	return { records: kept, stats }
}

/** Cloudflare free-tier guard, used by the release check. */
export function checkCloudflareBudget({ files, largestBytes }) {
	const problems = []
	if (files > CF_FREE.MAX_FILES) problems.push(`asset count ${files} exceeds Cloudflare limit ${CF_FREE.MAX_FILES}`)
	else if (files > CF_FREE.BUDGET_FILES) problems.push(`asset count ${files} exceeds our own budget ${CF_FREE.BUDGET_FILES}`)
	if (largestBytes > CF_FREE.MAX_FILE_BYTES) problems.push(`largest asset ${largestBytes}B exceeds 25 MiB per-file limit`)
	return { ok: problems.length === 0, problems, files, largestBytes, headroom: CF_FREE.MAX_FILES - files }
}
