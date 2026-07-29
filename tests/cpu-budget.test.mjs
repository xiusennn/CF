/**
 * Cloudflare FREE plan CPU budget gate.
 *
 * The free plan allows 10 ms of CPU per invocation. Time spent waiting on
 * upstream fetches does not count, but parsing, serialising and re-wrapping
 * responses does. This harness runs the real Worker against mocked upstreams
 * and fails the build if any route drifts back toward the limit.
 *
 * Gating on a single worst-case sample is unusable: a GC pause in this process
 * gets attributed to whichever request happens to be running, and it once
 * reported 6.11 ms for /healthz, a route that only serialises two fields. So we
 * take many samples and gate on the median (typical cost) and p90 (tail cost),
 * and print a measured noise floor so a red build can be judged in context.
 */
import { readFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

const BUDGET_MS = 5 // median must stay at half the free-plan limit
const TAIL_MS = 8 // p90 must still leave headroom below the hard limit
const LIMIT_MS = 10 // Cloudflare free plan: 10 ms CPU per invocation

// ---------------------------------------------------------------- mocked edge
const store = new Map()
globalThis.caches = {
	default: {
		async match(request) {
			const hit = store.get(typeof request === "string" ? request : request.url)
			return hit ? new Response(hit.body, { headers: hit.headers }) : undefined
		},
		async put(request, response) {
			const key = typeof request === "string" ? request : request.url
			store.set(key, { body: await response.text(), headers: response.headers })
		},
	},
}

const resp = (body, type = "text/html; charset=utf-8") =>
	new Response(body, { status: 200, headers: { "content-type": type } })

// A realistic Trending page: ~600 KB with 25 rows of markup filler.
const TRENDING_HTML =
	"<html><body>" +
	Array.from(
		{ length: 25 },
		(_, i) =>
			`<article class="Box-row"><h2><a href="/owner${i}/llm-agent-${i}">x</a></h2>` +
			`<p>An AI agent framework ${"padding ".repeat(40)}</p>` +
			`<span itemprop="programmingLanguage">TypeScript</span>` +
			`<span>1,234 stars this week</span>${"<div>filler</div>".repeat(300)}</article>`
	).join("") +
	"</body></html>"

const SEARCH_JSON = JSON.stringify({
	items: Array.from({ length: 12 }, (_, i) => ({
		full_name: `owner/repo${i}`,
		html_url: "https://example.test/" + i,
		description: "d".repeat(200),
		stargazers_count: 1234,
		language: "Python",
		updated_at: "2026-07-01T00:00:00Z",
		topics: ["ai", "llm", "agents"],
	})),
})

const HN_JSON = JSON.stringify({
	hits: Array.from({ length: 12 }, (_, i) => ({
		objectID: String(i),
		title: "t".repeat(80),
		url: "https://example.test/news/" + i,
		points: 100,
		num_comments: 20,
		created_at: "2026-07-20T00:00:00Z",
	})),
})

const SKILL_MD = "# Skill\n" + "line of documentation content\n".repeat(8000)

globalThis.fetch = async (input) => {
	const url = String(input && input.url ? input.url : input)
	if (url.includes("github.com/trending")) return resp(TRENDING_HTML)
	if (url.includes("api.github.com")) return resp(SEARCH_JSON, "application/json")
	if (url.includes("algolia")) return resp(HN_JSON, "application/json")
	if (url.includes("raw.githubusercontent.com")) return resp(SKILL_MD, "text/plain")
	return new Response("not found", { status: 404 })
}

const ASSET_HTML = await readFile(join(ROOT, "public", "index.html"), "utf8")
const TRENDING_SNAPSHOT = JSON.stringify({
	source: "GitHub Trending",
	fetchedAt: new Date().toISOString(),
	items: Array.from({ length: 12 }, (_, i) => ({
		fullName: `owner/repo${i}`,
		url: "https://example.test/" + i,
		description: "d".repeat(200),
		language: "Python",
		weeklyStars: "1234",
		stars: "5678",
	})),
})
const env = {
	RELEASE_ID: "test",
	ASSETS: {
		fetch: async (input) =>
			String(input && input.url ? input.url : input).includes("trending.json")
				? resp(TRENDING_SNAPSHOT, "application/json")
				: resp(ASSET_HTML),
	},
}
const worker = (await import(join(ROOT, "src", "index.js"))).default

// ------------------------------------------------------------------ measuring
const failures = []
let pass = 0

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]

async function sample(runs, fn) {
	const values = []
	for (let i = 0; i < runs; i++) {
		const before = process.cpuUsage()
		await fn()
		const used = process.cpuUsage(before)
		values.push((used.user + used.system) / 1000)
	}
	return values.sort((a, b) => a - b)
}

const noise = await sample(30, async () => {})
console.log(
	`  measurement noise floor: p50 ${pct(noise, 0.5).toFixed(2)} ms, ` +
		`p90 ${pct(noise, 0.9).toFixed(2)} ms, max ${noise[noise.length - 1].toFixed(2)} ms`
)

async function budget(label, path, { cold = true, runs = 25 } = {}) {
	const url = "https://tool.cnagt.com" + path
	await worker.fetch(new Request(url), env) // warm the JIT
	const values = await sample(runs, async () => {
		if (cold) store.clear()
		const r = await worker.fetch(new Request(url), env)
		await r.arrayBuffer()
	})
	const p50 = pct(values, 0.5)
	const p90 = pct(values, 0.9)
	const line =
		`${label} p50 ${p50.toFixed(2)} ms, p90 ${p90.toFixed(2)} ms ` +
		`(budget p50 ${BUDGET_MS} / p90 ${TAIL_MS} ms, CF limit ${LIMIT_MS} ms)`
	if (p50 > BUDGET_MS || p90 > TAIL_MS) failures.push(line)
	else {
		pass++
		console.log("  OK " + line)
	}
}

await budget("/healthz", "/healthz")
await budget("static asset", "/index.html")
await budget("/tools/<id> redirect", "/tools/json-formatter")
await budget("/api/github/trending MISS", "/api/github/trending")
await budget("/api/github/trending HIT", "/api/github/trending", { cold: false })
await budget("/api/github/search MISS", "/api/github/search?q=agent")
await budget("/api/ai-news MISS", "/api/ai-news")
await budget(
	"/api/skill-md MISS (250 KB)",
	"/api/skill-md?u=" + encodeURIComponent("https://raw.githubusercontent.com/a/b/main/SKILL.md")
)
await budget(
	"/api/skill-md HIT",
	"/api/skill-md?u=" + encodeURIComponent("https://raw.githubusercontent.com/a/b/main/SKILL.md"),
	{ cold: false }
)
await budget("404 fallthrough", "/definitely-missing")

// Structural guards: these are what kept the CPU cost off the request path.
const workerSrc = await readFile(join(ROOT, "src", "index.js"), "utf8")
const guards = [
	["worker does not parse Trending HTML at request time", !workerSrc.includes("Box-row")],
	["worker serves the prebuilt trending snapshot", workerSrc.includes("/assets/data/trending.json")],
	["worker returns static assets without re-wrapping them", workerSrc.includes("return asset;")],
	["worker caches without cloning the response stream", !workerSrc.includes("response.clone()")],
]
const headersFile = await readFile(join(ROOT, "public", "_headers"), "utf8")
guards.push([
	"security headers are applied at the edge via _headers",
	headersFile.includes("X-Frame-Options: SAMEORIGIN") && headersFile.includes("Content-Security-Policy:"),
])
for (const [label, okay] of guards) {
	if (okay) {
		pass++
		console.log("  OK " + label)
	} else failures.push(label)
}

if (failures.length) {
	console.error("CPU BUDGET FAILED:")
	for (const f of failures) console.error("- " + f)
	process.exit(1)
}
console.log(
	`CPU BUDGET: ${pass} checks passed, median CPU under ${BUDGET_MS} ms and ` +
		`p90 under ${TAIL_MS} ms of the ${LIMIT_MS} ms free-plan limit`
)
