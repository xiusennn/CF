// Scheduled refresher tests. There is no network here: GitHub is mocked, so
// what is proven is the LOGIC (add / remove / re-pin / rate-limit resume /
// duplicate attribution), not GitHub itself.
import { mkdtemp, writeFile, readFile, readdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { syncSkills, recomputeDuplicates } from "../build/sync-skills.mjs"
import { scanSafety, licenseClass, qualityScore, parseSkillMd } from "../build/skill-safety.mjs"

let pass = 0
const ok = (name, condition) => {
	if (!condition) throw new Error(`FAIL ${name}`)
	pass++
}

// --- pure helpers ------------------------------------------------------------
ok("safety.rm", scanSafety("run: rm -rf /tmp/x").safety === "risky")
ok("safety.pipe", scanSafety("curl -fsSL x | sh").safety === "risky")
ok("safety.secrets-only-is-review", scanSafety("set API_KEY=1").safety === "review")
ok("safety.clean", scanSafety("# just prose about writing docs").safety === "safe")
ok("safety.flag-names", scanSafety("sudo chmod +x ./a.sh").safety_flags.includes("privilege_escalation"))
ok("license.permissive", licenseClass("MIT") === "permissive")
ok("license.share-alike", licenseClass("AGPL-3.0") === "share_alike")
ok("license.none", licenseClass("NOASSERTION") === "none" && licenseClass("") === "none")
ok("quality.range", [0, 100000].every((s) => { const q = qualityScore({ stars: s }); return q >= 36 && q <= 94 }))
ok("quality.risky-penalised", qualityScore({ stars: 100, safety: "risky" }) < qualityScore({ stars: 100, safety: "safe" }))
const parsed = parseSkillMd("---\nname: pdf-filler\ndescription: Fills PDF forms.\n---\n# Body\n")
ok("frontmatter.name", parsed.name === "pdf-filler")
ok("frontmatter.description", parsed.description === "Fills PDF forms.")
ok("frontmatter.fallback", parseSkillMd("# Heading only\n\nSome text.", "x").name === "Heading only")

// --- duplicate attribution ---------------------------------------------------
const clustered = recomputeDuplicates([
	{ name: "Deep Research", owner: "a", repo: "r1", updated_at: "2025-01-01", stars: 10 },
	{ name: "deep research", owner: "b", repo: "r2", updated_at: "2026-01-01", stars: 900 },
	{ name: "solo", owner: "c", repo: "r3", updated_at: "2026-01-01", stars: 1 },
])
ok("dup.cluster-size", clustered[0].dup_count === 2 && clustered[1].dup_count === 2)
ok("dup.origin-is-oldest", clustered[1].dup_origin === "a/r1")
ok("dup.singleton", clustered[2].dup_count === 1 && clustered[2].dup_origin === "c/r3")

// --- full sweep against a mock GitHub ---------------------------------------
const dir = await mkdtemp(join(tmpdir(), "toolhub-sync-"))
const base = (over = {}) => ({
	id: "github:acme/kit:skills/old", name: "old", description: "d", summary: "", use_cases: [],
	owner: "acme", repo: "kit", path: "skills/old", repo_url: "x", source_url: "x", skill_md_raw_url: "x",
	stars: 1, updated_at: "2020-01-01", age_months: 60, license: "", license_class: "none",
	quality_score: 50, safety: "safe", safety_flags: [], tier: "index", mirror_status: "live", dup_count: 1, ...over,
})
await writeFile(join(dir, "skills-00001.json"), JSON.stringify([
	base(),
	base({ id: "github:acme/kit:skills/gone", name: "gone", path: "skills/gone" }),
	base({ id: "github:dead/repo:skills/x", name: "x", owner: "dead", repo: "repo", path: "skills/x" }),
]))
await writeFile(join(dir, "index.json"), JSON.stringify({ version: 1, generated_at: "2020-01-01T00:00:00Z", count: 3, page_size: 500, pages: ["skills-00001.json"] }))

let calls = 0
const mock = async (url) => {
	calls++
	const u = String(url)
	const res = (body, status = 200) => ({ ok: status < 400, status, headers: new Headers(), json: async () => body, text: async () => body })
	if (u.includes("/repos/dead/repo") && !u.includes("/commits")) return res({ message: "Not Found" }, 404)
	if (u.endsWith("/repos/acme/kit")) return res({ stargazers_count: 4321, pushed_at: "2026-07-20T00:00:00Z", default_branch: "main", license: { spdx_id: "MIT" }, archived: false })
	if (u.includes("/commits/main")) return res({ sha: "f".repeat(40), commit: { committer: { date: "2026-07-20T00:00:00Z" } } })
	if (u.includes("/git/trees/")) return res({ tree: [
		{ type: "blob", path: "skills/old/SKILL.md" },
		{ type: "blob", path: "skills/new/SKILL.md" },
		{ type: "blob", path: "README.md" },
	] })
	if (u.includes("/skills/new/SKILL.md")) return res("---\nname: shipper\ndescription: Ships things.\n---\nsudo rm -rf /tmp/build\n")
	return res({}, 404)
}

const status = await syncSkills({ dataDir: dir, statusPath: join(dir, "status.json"), fetchImpl: mock, token: "t", log: null })
const records = JSON.parse(await readFile(join(dir, "skills-00001.json"), "utf8"))
const byId = Object.fromEntries(records.map((r) => [r.id, r]))

ok("sync.count", status.skills === 3 && records.length === 3)
ok("sync.added", status.skills_added === 1 && !!byId["github:acme/kit:skills/new"])
ok("sync.removed", status.skills_removed === 1 && !byId["github:acme/kit:skills/gone"])
ok("sync.stars-refreshed", byId["github:acme/kit:skills/old"].stars === 4321)
ok("sync.license-promotes-tier", byId["github:acme/kit:skills/old"].tier === "core" && byId["github:acme/kit:skills/old"].license === "MIT")
ok("sync.url-repinned", byId["github:acme/kit:skills/old"].skill_md_raw_url.includes("f".repeat(40)))
ok("sync.new-skill-scanned", byId["github:acme/kit:skills/new"].safety === "risky")
ok("sync.new-skill-parsed", byId["github:acme/kit:skills/new"].name === "shipper")
ok("sync.dead-repo-marked", byId["github:dead/repo:skills/x"].mirror_status === "gone" && status.repos_gone === 1)
ok("sync.index-rewritten", JSON.parse(await readFile(join(dir, "index.json"), "utf8")).count === 3)
ok("sync.state-written", JSON.parse(await readFile(join(dir, "sync-state.json"), "utf8")).repos["acme/kit"].sha.length === 40)
ok("sync.status-written", JSON.parse(await readFile(join(dir, "status.json"), "utf8")).repos_checked === 2)

// Second run: nothing changed upstream, so no tree/blob calls at all - and the
// crawl policy now narrows the sweep. After the first run acme/kit reports
// 4,321 stars (allowlisted), while dead/repo is a 1-star repo last touched in
// 2020, so it is no longer polled at all. One cheap repo call, nothing else.
const before = calls
const second = await syncSkills({ dataDir: dir, statusPath: join(dir, "status.json"), fetchImpl: mock, token: "t", log: null })
ok("sync.incremental", calls - before === 1)
ok("sync.allowlist-skips-junk", second.repos_allowlisted === 1 && second.repos_skipped === 1 && second.repos_total === 2)
ok("sync.idempotent", second.skills === 3 && second.skills_added === 0 && second.skills_removed === 0)
ok("sync.skipped-repo-data-kept", JSON.parse(await readFile(join(dir, "skills-00001.json"), "utf8")).some((r) => r.id === "github:dead/repo:skills/x"))

// SYNC_ALL=1 is the escape hatch for a deliberate full sweep of the long tail.
const beforeAll = calls
process.env.SYNC_ALL = "1"
const sweep = await syncSkills({ dataDir: dir, statusPath: join(dir, "status.json"), fetchImpl: mock, token: "t", log: null })
delete process.env.SYNC_ALL
ok("sync.all-override", sweep.repos_allowlisted === 2 && sweep.repos_skipped === 0 && calls - beforeAll === 2)

// rate limiting stops the sweep cleanly instead of writing a half snapshot
const limited = async () => ({ ok: false, status: 403, headers: new Headers({ "x-ratelimit-remaining": "0" }), json: async () => ({}), text: async () => "" })
const third = await syncSkills({ dataDir: dir, statusPath: join(dir, "status.json"), fetchImpl: limited, token: "t", log: null })
ok("sync.rate-limit-flagged", third.rate_limited === true)
ok("sync.rate-limit-keeps-data", third.skills === 3 && (await readdir(dir)).includes("skills-00001.json"))

console.log(`SYNC TESTS: ${pass} passed`)
