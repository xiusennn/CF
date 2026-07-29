// One-shot QA: in-process static server + Playwright homepage interaction checks
// + real-CSS screenshots. Self-contained so no orphan processes survive.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const PUB = join(fileURLToPath(new URL("../public", import.meta.url)));
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    let fp = join(PUB, p);
    if (!existsSync(fp) && existsSync(fp + ".html")) fp += ".html";
    const body = await readFile(fp);
    res.writeHead(200, { "content-type": TYPES[extname(fp)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise((r) => server.listen(8799, r));
const BASE = "http://localhost:8799";

let pass = 0, fail = 0; const fails = [];
const check = (n, c, x = "") => { if (c) pass++; else { fail++; fails.push(n + (x ? " \u2014 " + x : "")); } };

const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || "/usr/local/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => { fail++; fails.push("JS ERROR: " + e.message); });
const go = async (p) => { await page.goto(BASE + p, { waitUntil: "networkidle" }); await page.waitForTimeout(150); };

// Browse view
await go("/");
check("home.cards>=64", (await page.locator(".card").count()) >= 64);
check("browse.visible", await page.locator("#browse").isVisible());
check("results.hidden", !(await page.locator("#results").isVisible()));
check("taskRoutes=4", (await page.locator(".task-route").count()) === 4);
check("workbench.search", await page.locator(".workbench-search").isVisible());
await page.screenshot({ path: "/data/qa-home.png", fullPage: true });

// Quick task query from the search-first workbench
await page.click('[data-query="api"]');
await page.waitForTimeout(250);
check("query.results", await page.locator("#results").isVisible());
check("query.browseHidden", !(await page.locator("#browse").isVisible()));
const apiVisible = await page.locator(".card:visible").count();
check("query.apiMatches", apiVisible >= 1, "visible=" + apiVisible);
await page.screenshot({ path: "/data/qa-query.png", fullPage: true });

// Back to browse
await page.click("#back-btn");
await page.waitForTimeout(200);
check("back.browse", await page.locator("#browse").isVisible());

// Search json
await page.fill("#tool-search", "json");
await page.waitForTimeout(200);
const vis = await page.locator(".card:visible").count();
check("search.range", vis >= 1 && vis < 64, "visible=" + vis);
await page.screenshot({ path: "/data/qa-search.png", fullPage: false });

// Tool page
await go("/tools/json-formatter.html");
check("tool.mount", (await page.locator("#tool-mount *").count()) > 0);
await page.screenshot({ path: "/data/qa-tool.png", fullPage: true });

await browser.close();
server.close();
console.log(`PASS=${pass} FAIL=${fail}`);
if (fails.length) console.log("FAILS:\n - " + fails.join("\n - "));
process.exit(fail ? 1 : 0);
