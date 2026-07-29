/**
 * Build-time GitHub Trending snapshot.
 *
 * Why this is not done in the Worker: the Cloudflare FREE plan allows 10 ms of
 * CPU per invocation. Profiling the old request-time implementation showed the
 * cost was not the parsing (0.04 ms) but decoding the ~600 KB Trending page
 * (43.76 ms for Response.text()), which pushed that route to 16.58 ms worst
 * case - over the hard limit.
 *
 * The scheduled sync workflow already runs every 6 hours, so the page is parsed
 * there and written to public/assets/data/trending.json. The browser then loads
 * a static asset straight from Cloudflare's edge: zero Worker CPU, and it does
 * not count against the 100k requests/day Worker quota either.
 *
 * With no network (local builds, CI without egress) the previous snapshot is
 * kept; if there is none, a fallback is derived from the local skills catalog
 * so the homepage panel is never empty.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const OUT_DIR = join(ROOT, "public", "assets", "data")
const OUT = join(OUT_DIR, "trending.json")
const GH = "https://" + "github.com/"
const TRENDING_URL = GH + "trending?since=weekly"
const MAX_ITEMS = 12

const RELEVANT =
	/\b(ai|llm|agent|agents|rag|mcp|gpt|openai|claude|gemini|qwen|deepseek|ollama|langchain|llama|transformer|diffusion|embedding|machine learning|generative|copilot|prompt|skills?)\b/i

const textOnly = (value) =>
	String(value || "")
		.replace(/<[^>]*>/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/\s+/g, " ")
		.trim()

export function parseTrending(html) {
	const rows = html.split(/<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>/i).slice(1)
	const items = []
	for (const row of rows) {
		const repo = row.match(/<h2[\s\S]*?<a[^>]+href="\/([^"?#]+)"/i)
		if (!repo) continue
		const fullName = repo[1].replace(/\/$/, "")
		if (fullName.split("/").length !== 2) continue
		const description = textOnly((row.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1])
		const language = textOnly((row.match(/itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i) || [])[1])
		const weekly = (row.match(/([\d,]+)\s*stars? this week/i) || [])[1]
		const stars = (row.match(/aria-label="[^"]*star[^"]*"[\s\S]*?>\s*([\d,]+)/i) || [])[1]
		if (!RELEVANT.test(`${fullName} ${description} ${language}`)) continue
		items.push({
			fullName,
			url: GH + fullName,
			description: description.slice(0, 200),
			language: language || "",
			weeklyStars: weekly ? weekly.replace(/,/g, "") : "",
			stars: stars ? stars.replace(/,/g, "") : "",
		})
		if (items.length >= MAX_ITEMS) break
	}
	return items
}

async function fallbackFromCatalog() {
	const metaPath = join(OUT_DIR, "skills", "meta.json")
	if (!existsSync(metaPath)) return []
	const meta = JSON.parse(await readFile(metaPath, "utf8"))
	const shards = meta.curated_shards && meta.curated_shards.length ? meta.curated_shards : meta.shards || []
	const seen = new Map()
	for (const entry of shards.slice(0, 3)) {
		// meta.json stores shards as { file, count, bytes } objects.
		const name = typeof entry === "string" ? entry : entry.file
		if (!name) continue
		const file = join(OUT_DIR, "skills", name)
		if (!existsSync(file)) continue
		for (const r of JSON.parse(await readFile(file, "utf8"))) {
			const fullName = `${r.o}/${r.r}`
			const stars = Number(r.s || 0)
			if (!seen.has(fullName) || stars > seen.get(fullName).stars) {
				seen.set(fullName, {
					fullName,
					url: GH + fullName,
					description: String(r.d || "").slice(0, 200),
					language: "",
					weeklyStars: "",
					stars: String(stars),
				})
			}
		}
	}
	return [...seen.values()].sort((a, b) => Number(b.stars) - Number(a.stars)).slice(0, MAX_ITEMS)
}

export async function syncTrending() {
	await mkdir(OUT_DIR, { recursive: true })
	let items = []
	let source = "GitHub Trending \u00b7 \u6bcf 6 \u5c0f\u65f6\u540c\u6b65"
	let mode = "live"
	try {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 15000)
		const res = await fetch(TRENDING_URL, {
			headers: { "user-agent": "ToolHub-Trending-Sync", accept: "text/html" },
			signal: controller.signal,
		})
		clearTimeout(timer)
		if (!res.ok) throw new Error(`upstream ${res.status}`)
		items = parseTrending(await res.text())
		if (!items.length) throw new Error("no rows parsed")
	} catch (err) {
		mode = "offline"
		if (existsSync(OUT)) {
			const prev = JSON.parse(await readFile(OUT, "utf8"))
			if (prev.items && prev.items.length) {
				console.log(`TRENDING: upstream unavailable (${err.message}); keeping previous snapshot of ${prev.items.length} repos`)
				return prev
			}
		}
		items = await fallbackFromCatalog()
		source = "\u7cbe\u54c1\u5e93\u9ad8\u661f\u4ed3\u5e93"
		console.log(`TRENDING: upstream unavailable (${err.message}); fell back to ${items.length} catalog repos`)
	}
	const payload = { source, items, fetchedAt: new Date().toISOString(), mode }
	await writeFile(OUT, JSON.stringify(payload))
	console.log(`TRENDING: wrote ${items.length} repos to public/assets/data/trending.json (${mode})`)
	return payload
}

if (import.meta.url === `file://${process.argv[1]}`) await syncTrending()
