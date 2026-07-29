import { chromium } from "playwright";
const BASE = "http://localhost:8787";
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || "/usr/local/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage();
let pass = 0, fail = 0; const fails = [];
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
const ck = (n, c) => { if (c) pass++; else { fail++; fails.push(n); } };
async function go(p) { errs.length = 0; await page.goto(BASE + p, { waitUntil: "networkidle" }); await page.waitForTimeout(100); ck(p + " no-js-error", errs.length === 0); ck(p + " mounted", (await page.locator("#tool-mount *").count()) > 0); }

await go("/tools/md5-hash.html");
await page.fill("#tool-mount textarea", "abc"); await page.waitForTimeout(80);
ck("md5 output", (await page.locator("#tool-mount textarea").nth(1).inputValue()) === "900150983cd24fb0d6963f7d28e17f72");

await go("/tools/html-to-markdown.html");
await page.fill("#tool-mount textarea", "<h1>Hi</h1>"); await page.waitForTimeout(80);
ck("html2md output", (await page.locator("#tool-mount textarea").nth(1).inputValue()).includes("# Hi"));

await go("/tools/markdown-to-html.html");
await page.fill("#tool-mount textarea", "# Hi"); await page.waitForTimeout(80);
ck("md2html preview", (await page.locator("#tool-mount .panel").innerHTML()).includes("<h1>Hi</h1>"));

await go("/tools/json-repair.html");
await page.fill("#tool-mount textarea", "{a:1,}"); await page.locator("#tool-mount button.primary").click(); await page.waitForTimeout(80);
ck("json-repair output", (await page.locator("#tool-mount textarea").nth(1).inputValue()).includes('"a": 1'));

await go("/tools/string-validator.html");
await page.fill("#tool-mount input", "a@b.com"); await page.waitForTimeout(80);
ck("validator email tick", (await page.locator("#tool-mount .result-meta").innerText()).includes("Email"));

await go("/tools/fake-data.html");
await page.locator("#tool-mount button.primary").click(); await page.waitForTimeout(80);
ck("fake-data output", (await page.locator("#tool-mount textarea").inputValue()).includes("@"));

await go("/tools/image-cropper.html");

console.log(`SMOKE v4: ${pass} passed, ${fail} failed`);
if (fail) console.log(fails.join("\n"));
await browser.close();
process.exit(fail ? 1 : 0);
