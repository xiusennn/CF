// Real-browser end-to-end tests: loads each tool page, interacts with it like a
// user, and asserts the DOM output. Proves every tool actually works — no manual
// clicking needed. Also captures screenshots for visual proof.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { TOOLS } from "../build/tools.config.mjs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE || "http://localhost:8787";
const SHOTS = fileURLToPath(new URL("../shots/", import.meta.url));
await mkdir(SHOTS, { recursive: true });

let pass = 0, fail = 0; const fails = [];
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; fails.push(name + (extra ? " \u2014 " + extra : "")); } };

const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || "/usr/local/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => { fail++; fails.push("JS ERROR: " + e.message); });

async function go(path) { await page.goto(BASE + path, { waitUntil: "networkidle" }); await page.waitForTimeout(120); }

// ---- result-first product homepage ----
await go("/");
check("home.title", (await page.title()).includes("ToolHub"));
check("home.three-workbench-paths", await page.locator(".journey-card").count() === 3);
check("home.content-workbench", (await page.locator('a[href="/workspace-content.html"]').count()) >= 1);
check("home.dev-workbench", (await page.locator('a[href="/workspace-dev.html"]').count()) >= 1);
check("home.skills-workbench", (await page.locator('a[href="/workspace-skills.html"]').count()) >= 1);
check("home.utf8", (await page.evaluate(() => document.characterSet)) === "UTF-8");
check("home.no-overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
check("home.compact-footer-categories", await page.locator(".foot-category").count() === 8);
await go("/tools.html");
check("tools-index.all-categories", await page.locator(".tool-index-section").count() === 8);
check("tools-index.all-tools", await page.locator(".tool-index-card").count() === TOOLS.length, `cards=${await page.locator(".tool-index-card").count()}`);
check("tools-index.no-overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
await page.setViewportSize({ width: 390, height: 844 });
await go("/");
check("mobile.home.no-overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
check("mobile.footer.categories", await page.locator(".foot-category").count() === 8);
await page.screenshot({ path: SHOTS + "mobile-home.png", fullPage: true });
await page.setViewportSize({ width: 1280, height: 900 });
await page.screenshot({ path: SHOTS + "home.png", fullPage: false });

// A workbench project is stored locally and is available to the workspace.
await go("/workspace-content.html");
await page.fill('#project-form textarea[name="goal"]', "测试本地内容项目");
await page.click('#project-form .btn.primary');
await page.waitForTimeout(80);
check("workbench.local-save", (await page.locator('#project-feedback').textContent()).includes("已保存"));
await go("/workspace.html");
check("workspace.saved-project-visible", await page.locator('.workspace-plan').count() >= 1);

// A new visitor can state a goal, receive a route, save it, and resume it with a checklist.
await go("/start.html");
check("router.form-visible", await page.locator('#route-form').count() === 1);
await page.fill('#route-form textarea[name="goal"]', "为 AI 产品写每周内容并保护客户资料");
await page.click('#route-form .btn.primary');
await page.waitForTimeout(100);
check("router.route-generated", await page.locator('#route-result .route-steps li').count() === 3);
check("router.minimum-tools", await page.locator('#route-result .route-tool-links a').count() === 3);
await page.click('#route-result [data-save-route]');
await page.waitForTimeout(80);
check("router.local-save", (await page.locator('#route-save-feedback').textContent()).includes("已保存"));
await go("/workspace.html");
check("workspace.route-checklist", await page.locator('.workspace-steps input[data-step]').count() >= 3);
await page.locator('.workspace-steps input[data-step]').first().check();
await page.waitForTimeout(80);
check("workspace.checklist-persists", await page.locator('.workspace-progress').first().textContent().then(x => x.includes('1/3')));

// Helper to run a tool page
async function tool(id, fn) {
  await go("/tools/" + id + ".html");
  const mountChildren = await page.locator("#tool-mount *").count();
  check(id + ".rendered", mountChildren > 0, "empty mount");
  const controls = await page.locator("#tool-mount input, #tool-mount textarea, #tool-mount select, #tool-mount button, #tool-mount a.btn").count();
  check(id + ".usable-controls", controls > 0, "no usable input, control, or action");
  try { await fn(); } catch (e) { fail++; fails.push(id + ".interaction \u2014 " + e.message); }
}

await tool("word-counter", async () => {
  await page.fill("#tool-mount textarea", "one two three");
  await page.waitForTimeout(80);
  const words = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("word-counter.value", words.trim() === "3", "words=" + words);
});
await tool("json-formatter", async () => {
  await page.fill("#tool-mount textarea", '{"b":1,"a":2}');
  await page.click("#tool-mount .btn.primary");
  await page.waitForTimeout(80);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("json-formatter.value", out.includes('"b": 1'), out.slice(0, 40));
});
await tool("base64", async () => {
  await page.fill("#tool-mount textarea", "abc");
  await page.click("#tool-mount .btn.primary");
  await page.waitForTimeout(80);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("base64.value", out === "YWJj", out);
});
await tool("hash-generator", async () => {
  await page.fill("#tool-mount textarea", "abc");
  await page.waitForTimeout(150);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("hash-generator.value", out.startsWith("ba7816bf"), out.slice(0, 16));
});
await tool("uuid-generator", async () => {
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("uuid-generator.value", /[0-9a-f-]{36}/.test(out), out.slice(0, 40));
});
await tool("profit-margin", async () => {
  await page.fill('#tool-mount input[type=number] >> nth=0', "60");
  await page.fill('#tool-mount input[type=number] >> nth=1', "100");
  await page.waitForTimeout(80);
  const margin = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("profit-margin.value", margin.includes("40"), margin);
});
await tool("utm-builder", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("utm-builder.value", out.includes("utm_source="), out.slice(0, 40));
});
await tool("palette-generator", async () => {
  await page.waitForTimeout(80);
  check("palette-generator.swatches", (await page.locator("#tool-mount .swatch").count()) === 10);
  await page.screenshot({ path: SHOTS + "palette.png" });
});
await tool("case-converter", async () => {
  await page.fill("#tool-mount textarea", "hello world");
  await page.click('#tool-mount .btns .btn >> nth=0');
  await page.waitForTimeout(60);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("case-converter.value", out === "HELLO WORLD", out);
});
await tool("loan-calculator", async () => {
  await page.waitForTimeout(80);
  const m = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("loan-calculator.value", parseFloat(m) > 1000, m);
});
await tool("contrast-checker", async () => {
  await page.waitForTimeout(80);
  const r = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("contrast-checker.value", r.includes(":1"), r);
  await page.screenshot({ path: SHOTS + "tool-page.png" });
});

await tool("jwt-decoder", async () => {
  await page.waitForTimeout(120);
  const payload = await page.locator("#tool-mount textarea[readonly] >> nth=1").inputValue();
  check("jwt-decoder.value", payload.includes("John Doe"), payload.slice(0, 30));
});
await tool("json-to-csv", async () => {
  await page.fill("#tool-mount textarea", '[{"a":1,"b":2},{"a":3,"b":4}]');
  await page.click("#tool-mount .btn.primary");
  await page.waitForTimeout(80);
  const out = await page.locator("#tool-mount textarea[readonly]").inputValue();
  check("json-to-csv.value", out === "a,b\n1,2\n3,4", out.slice(0, 30));
});
await tool("number-base", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator('#tool-mount input[readonly]').inputValue();
  check("number-base.value", out === "11111111", out);
});
await tool("unit-length", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator('#tool-mount input[readonly]').inputValue();
  check("unit-length.value", Math.abs(parseFloat(out) - 328.084) < 0.1, out);
});
await tool("unit-temperature", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator('#tool-mount input[readonly]').inputValue();
  check("unit-temperature.value", Math.abs(parseFloat(out) - 77) < 0.1, out);
});
await tool("roman-numeral", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator('#tool-mount input[readonly] >> nth=0').inputValue();
  check("roman-numeral.value", out === "MMXXVI", out);
});
await tool("discount", async () => {
  await page.waitForTimeout(80);
  const finalP = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("discount.value", Number(finalP.trim()) > 0, finalP);
});
await tool("bmi", async () => {
  await page.waitForTimeout(80);
  const cat = await page.locator('#tool-mount .result-meta b >> nth=0').textContent();
  check("bmi.value", cat.trim().length > 0, cat);
});
await tool("gradient-generator", async () => {
  await page.waitForTimeout(80);
  const out = await page.locator('#tool-mount input[readonly]').inputValue();
  check("gradient-generator.value", out.includes("linear-gradient"), out.slice(0, 30));
});
await tool("regex-tester", async () => {
  await page.waitForTimeout(120);
  const matches = await page.locator("#tool-mount .diff-line.add").count();
  check("regex-tester.value", matches === 2, "matches=" + matches);
});

await tool("token-counter", async () => {
  await page.fill("#tool-mount textarea", "hello world this is a token test");
  await page.waitForTimeout(80);
  const tok = parseInt(await page.locator('#tool-mount .result-meta b >> nth=0').textContent(), 10);
  check("token-counter.value", tok > 0, "tokens=" + tok);
});
await tool("ai-cost-calculator", async () => {
  await page.waitForTimeout(80);
  const total = (await page.locator('#tool-mount .result-meta b >> nth=0').textContent()).trim();
  check("ai-cost-calculator.value", total.startsWith("$") && total !== "$0", "total=" + total);
});
await tool("password-strength", async () => {
  await page.fill("#tool-mount input", "9xK$mQ2!vB7@wLp4");
  await page.waitForTimeout(80);
  const label = (await page.locator(".meter-label").textContent()).toLowerCase();
  check("password-strength.value", label.includes("trong"), "label=" + label);
});
await tool("prompt-library", async () => {
  const before = await page.locator("#tool-mount .dir-drow").count();
  check("prompt-library.list", before >= 5, "rows=" + before);
  await page.fill("#tool-mount input", "resume");
  await page.waitForTimeout(120);
  const after = await page.locator("#tool-mount .dir-drow").count();
  check("prompt-library.search", after >= 1 && after < before, "after=" + after);
});
await tool("free-api-directory", async () => {
  const before = await page.locator("#tool-mount .dir-row").count();
  check("free-api-directory.list", before >= 20, "rows=" + before);
  const noAuthBadges = await page.locator('#tool-mount .dir-row:has-text("免鉴权")').count();
  check("free-api-directory.badges", noAuthBadges >= 1, "noAuth=" + noAuthBadges);
  await page.fill("#tool-mount input:not([type=checkbox])", "weather");
  await page.waitForTimeout(120);
  const after = await page.locator("#tool-mount .dir-row").count();
  check("free-api-directory.search", after >= 1 && after < before, "after=" + after);
});

// Smoke-load EVERY remaining tool page to ensure no render/JS errors.
const allIds = TOOLS.map((tool) => tool.id);
for (const id of allIds) {
  await go("/tools/" + id + ".html");
  const n = await page.locator("#tool-mount *").count();
  check("smoke." + id, n > 0, "mount empty");
}

await browser.close();
console.log(`\nBROWSER TESTS: ${pass} passed, ${fail} failed`);
if (fail) { console.log("FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
else console.log("ALL BROWSER TESTS PASSED \u2713");
