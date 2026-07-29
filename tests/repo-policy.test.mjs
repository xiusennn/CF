/**
 * Proves the curation policy: crawl gate, per-repo cap, duplicate collapse and
 * the Cloudflare free-tier budget guard. Pure functions, no network.
 */
import { repoGate, capRepo, dedupe, curate, clusterKey, checkCloudflareBudget, POLICY, CF_FREE } from "../build/repo-policy.mjs"

let passed = 0
const eq = (actual, expected, label) => {
	const a = JSON.stringify(actual)
	const b = JSON.stringify(expected)
	if (a !== b) throw new Error(`FAIL ${label}: got ${a}, want ${b}`)
	passed++
}
const yes = (cond, label) => {
	if (!cond) throw new Error(`FAIL ${label}`)
	passed++
}

const NOW = Date.parse("2026-07-29T00:00:00Z")
const day = (n) => new Date(NOW - n * 86400000).toISOString().slice(0, 10)
const skill = (o, r, extra = {}) => ({
	id: `github:${o}/${r}:skills/${extra.name || "a"}`,
	owner: o,
	repo: r,
	name: extra.name || "a",
	path: `skills/${extra.name || "a"}`,
	description: extra.description ?? "a description long enough to pass",
	stars: extra.stars ?? 500,
	updated_at: extra.updated_at ?? day(3),
	quality_score: extra.quality_score ?? 0.8,
	...extra,
})

// --- A. crawl gate -----------------------------------------------------------
eq(repoGate([skill("a", "good", { stars: 900, updated_at: day(3) })], NOW).reason, "famous", "gate.famous")
eq(repoGate([skill("a", "ok", { stars: 150, updated_at: day(30) })], NOW).reason, "quality", "gate.quality")
eq(repoGate([skill("a", "tiny", { stars: 3, updated_at: day(1) })], NOW).keep, false, "gate.low-stars")
eq(repoGate([skill("a", "tiny", { stars: 3, updated_at: day(1) })], NOW).reason, "low-stars", "gate.low-stars-reason")
eq(repoGate([skill("a", "old", { stars: 150, updated_at: day(300) })], NOW).reason, "inactive", "gate.inactive")
// A famous but abandoned repo is still dropped once it crosses the hard limit.
eq(repoGate([skill("a", "dead", { stars: 9000, updated_at: day(900) })], NOW).reason, "stale", "gate.hard-stale")
// The freshest skill in the repo decides activity, not the oldest.
eq(
	repoGate([skill("a", "mixed", { stars: 150, updated_at: day(700) }), skill("a", "mixed", { name: "b", stars: 150, updated_at: day(2) })], NOW).keep,
	true,
	"gate.freshest-wins",
)

// --- B. per-repo cap ---------------------------------------------------------
const flood = Array.from({ length: 500 }, (_, i) => skill("dump", "repo", { name: `s${i}`, quality_score: i / 1000 }))
const capped = capRepo(flood, 10)
eq(capped.kept.length, 10, "cap.size")
eq(capped.dropped.length, 490, "cap.dropped")
yes(
	capped.kept.every((r) => r.quality_score >= Math.max(...capped.dropped.map((d) => d.quality_score))),
	"cap.keeps-best",
)
eq(capRepo(flood.slice(0, 5), 10).kept.length, 5, "cap.under-limit-untouched")

// --- C. duplicate collapse ---------------------------------------------------
eq(clusterKey({ name: "Deep  Research" }), "deep-research", "cluster.normalises-spaces")
eq(clusterKey({ name: "deep_research" }), "deep-research", "cluster.normalises-underscore")
eq(clusterKey({ name: "Deep-Research!" }), "deep-research", "cluster.strips-punctuation")

const copies = [
	skill("forker", "one", { name: "deep-research", updated_at: day(10), stars: 900 }),
	skill("origin", "src", { name: "deep-research", updated_at: day(400), stars: 100 }),
	skill("forker", "two", { name: "deep-research", updated_at: day(5), stars: 50 }),
	skill("solo", "repo", { name: "unique-skill" }),
]
const { canonical, folded, clusters } = dedupe(copies)
eq(clusters, 2, "dedupe.clusters")
eq(folded, 2, "dedupe.folded")
eq(canonical.length, 2, "dedupe.canonical-count")
const origin = canonical.find((r) => r.name === "deep-research")
eq(`${origin.owner}/${origin.repo}`, "origin/src", "dedupe.oldest-is-origin")
eq(origin.dup_count, 3, "dedupe.count-includes-self")
yes(copies.every((r) => (r.name === "deep-research" ? r.dup_origin === "origin/src" : true)), "dedupe.copies-know-origin")
eq(canonical.find((r) => r.name === "unique-skill").dup_count, 1, "dedupe.singleton-count-is-one")

// --- D. full pipeline --------------------------------------------------------
const corpus = [
	...Array.from({ length: 400 }, (_, i) => skill("big", "dump", { name: `x${i}`, stars: 800, quality_score: i / 1000 })),
	...Array.from({ length: 5 }, (_, i) => skill("tiny", "scratch", { name: `y${i}`, stars: 4 })),
	...Array.from({ length: 5 }, (_, i) => skill("old", "archive", { name: `z${i}`, stars: 300, updated_at: day(400) })),
	skill("thin", "repo", { name: "no-desc", description: "", stars: 300 }),
	skill("good", "repo", { name: "solid", stars: 300 }),
]
const { records, stats } = curate(corpus, { now: NOW, maxPerRepo: 50 })
eq(stats.reposIn, 5, "curate.repos-in")
eq(stats.dropped["low-stars"], 5, "curate.drops-scratch-repo")
eq(stats.dropped.inactive, 5, "curate.drops-inactive-repo")
eq(stats.dropped.thin, 1, "curate.drops-empty-description")
eq(stats.dropped.capped, 350, "curate.caps-the-dump")
eq(stats.reposKept, 2, "curate.repos-kept")
eq(records.length, 51, "curate.output-size")
yes(!records.some((r) => r.owner === "tiny" || r.owner === "old"), "curate.no-junk-survives")
yes(records.some((r) => r.name === "solid"), "curate.keeps-small-good-repo")
// Curation must be deterministic: same input, same output.
eq(curate(corpus, { now: NOW, maxPerRepo: 50 }).records.map((r) => r.id), records.map((r) => r.id), "curate.deterministic")

// --- E. Cloudflare free-tier guard -------------------------------------------
yes(checkCloudflareBudget({ files: 4000, largestBytes: 1_500_000 }).ok, "cf.small-build-passes")
eq(checkCloudflareBudget({ files: 4000, largestBytes: 1_500_000 }).headroom, CF_FREE.MAX_FILES - 4000, "cf.headroom")
eq(checkCloudflareBudget({ files: 19_000, largestBytes: 10 }).ok, false, "cf.own-budget-trips-first")
eq(checkCloudflareBudget({ files: 21_000, largestBytes: 10 }).problems.length, 1, "cf.file-count-limit")
eq(checkCloudflareBudget({ files: 100, largestBytes: 26 * 1024 * 1024 }).problems.length, 1, "cf.per-file-limit")
eq(checkCloudflareBudget({ files: 25_000, largestBytes: 30 * 1024 * 1024 }).problems.length, 2, "cf.both-limits")
yes(POLICY.MIN_STARS >= 20 && POLICY.MAX_PER_REPO > 0, "policy.sane-constants")

console.log(`POLICY TESTS: ${passed} passed`)
