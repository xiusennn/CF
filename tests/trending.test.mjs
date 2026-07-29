// Build-time Trending snapshot: parser correctness, relevance filter, and the
// guarantee that the Worker no longer parses HTML on the request path.
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { parseTrending } from "../build/sync-trending.mjs"

let pass = 0
const ok = (name, condition) => {
	if (!condition) throw new Error(`FAIL ${name}`)
	pass++
}

const row = (name, desc, lang, weekly) =>
	`<article class="Box-row"><h2><a href="/${name}">x</a></h2><p>${desc}</p>` +
	`<span itemprop="programmingLanguage">${lang}</span><span>${weekly} stars this week</span></article>`

const html =
	"<html><body>" +
	row("acme/llm-agent", "An LLM agent framework", "Python", "1,234") +
	row("someone/css-reset", "A tiny stylesheet", "CSS", "90") +
	row("other/mcp-tools", "MCP servers &amp; <b>skills</b>", "TypeScript", "77") +
	"</body></html>"

const items = parseTrending(html)
ok("trending.filters-irrelevant", items.every((i) => i.fullName !== "someone/css-reset"))
ok("trending.keeps-relevant", items.length === 2)
ok("trending.full-name", items[0].fullName === "acme/llm-agent")
ok("trending.absolute-url", items[0].url === "https://github.com/acme/llm-agent")
ok("trending.language", items[0].language === "Python")
ok("trending.weekly-stars", items[0].weeklyStars === "1234")
ok("trending.decodes-entities", items[1].description === "MCP servers & skills")
ok("trending.strips-tags", !items[1].description.includes("<"))
ok("trending.caps-items", parseTrending("<html>" + row("a/ai-1", "ai", "Go", "1").repeat(40)).length <= 12)
ok("trending.empty-input", parseTrending("<html></html>").length === 0)

// The snapshot must exist after a build: the homepage and the Worker route both
// read it instead of parsing github.com at request time.
const snapshotPath = new URL("../public/assets/data/trending.json", import.meta.url)
ok("trending.snapshot-exists", existsSync(snapshotPath))
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"))
ok("trending.snapshot-items", Array.isArray(snapshot.items) && snapshot.items.length > 0)
ok("trending.snapshot-fetched-at", !Number.isNaN(Date.parse(snapshot.fetchedAt)))
ok("trending.snapshot-shape", snapshot.items.every((i) => i.fullName && i.url))

// Guard against a regression back into the 10 ms CPU danger zone.
const worker = await readFile(new URL("../src/index.js", import.meta.url), "utf8")
ok("worker.no-html-parse", !worker.includes("Box-row"))
ok("worker.serves-snapshot", worker.includes("/assets/data/trending.json"))

const hub = await readFile(new URL("../public/assets/js/live-hub.js", import.meta.url), "utf8")
ok("client.reads-static-snapshot", hub.includes('request("/assets/data/trending.json")'))

console.log(`TRENDING TESTS: ${pass} passed`)
