// Automated unit tests for every pure tool function. Run: node tests/core.test.mjs
// This proves the LOGIC of each tool works — no manual clicking required.
import * as C from "../public/assets/js/core.js";

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) { pass++; } else { fail++; fails.push(`${name} (got: ${JSON.stringify(got)})`); } }
function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b), a); }
function approx(name, a, b, eps = 0.01) { ok(name, Math.abs(a - b) < eps, a); }

// wordCount
const wc = C.wordCount("Hello world. This is ToolHub!");
ok("wordCount.words", wc.words === 5, wc.words);
ok("wordCount.sentences", wc.sentences === 2, wc.sentences);
ok("wordCount.chars", wc.chars === 29, wc.chars);

// changeCase
eq("case.upper", C.changeCase("aB c", "upper"), "AB C");
eq("case.title", C.changeCase("hello world", "title"), "Hello World");
eq("case.camel", C.changeCase("hello world foo", "camel"), "helloWorldFoo");
eq("case.snake", C.changeCase("Hello World", "snake"), "hello_world");
eq("case.kebab", C.changeCase("Hello World", "kebab"), "hello-world");
eq("case.constant", C.changeCase("hello world", "constant"), "HELLO_WORLD");

// JSON
const jf = C.formatJson('{"b":1,"a":[1,2]}', 2);
ok("json.ok", jf.ok && jf.output.includes("\n  \"b\""), jf.output);
ok("json.invalid", C.formatJson("{bad}").ok === false, null);
eq("json.minify", C.minifyJson('{ "a": 1 }').output, '{"a":1}');

// Base64 (unicode)
eq("b64.roundtrip", C.base64Decode(C.base64Encode("Hello \u4F60\u597D \uD83D\uDE80")), "Hello \u4F60\u597D \uD83D\uDE80");
eq("b64.encode", C.base64Encode("abc"), "YWJj");

// URL
eq("url.enc", C.urlEncode("a b&c"), "a%20b%26c");
eq("url.dec", C.urlDecode("a%20b%26c"), "a b&c");

// uuid
const id = C.uuidV4();
ok("uuid.format", /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id), id);
ok("uuid.unique", C.uuidV4() !== C.uuidV4(), null);

// slugify
eq("slug", C.slugify("My Awesome Blog Post!"), "my-awesome-blog-post");

// dedupe / sort
eq("dedupe", C.removeDuplicateLines("a\nb\na\n b "), "a\nb");
eq("sort", C.sortLines("b\na\nc"), "a\nb\nc");

// lorem
ok("lorem", C.loremIpsum(2, 10).split("\n\n").length === 2, null);

// password
ok("pwd.length", C.passwordGenerate({ length: 20 }).length === 20, null);
ok("pwd.digitsOnly", /^[0-9]+$/.test(C.passwordGenerate({ length: 12, upper: false, lower: false, digits: true, symbols: false })), null);

// color
eq("hexToRgb", C.hexToRgb("#6d5efc"), { r: 109, g: 94, b: 252 });
eq("rgbToHex", C.rgbToHex(109, 94, 252), "#6d5efc");
ok("hexToRgb.invalid", C.hexToRgb("nope") === null, null);
const hsl = C.rgbToHsl(109, 94, 252);
ok("rgbToHsl", hsl.h >= 246 && hsl.h <= 250, hsl);
ok("palette.10", C.generatePalette("#6d5efc").length === 10, null);
approx("contrast.wb", C.contrastRatio("#ffffff", "#000000"), 21, 0.1);

// calculators
const pm = C.profitMargin({ cost: 60, price: 100 });
eq("profit", [pm.profit, pm.marginPct, pm.markupPct], [40, 40, 66.67]);
const rs = C.roas({ revenue: 5000, adSpend: 1000 });
eq("roas", [rs.roas, rs.acos], [5, 20]);
const be = C.breakEven({ fixedCosts: 10000, pricePerUnit: 50, variableCostPerUnit: 30 });
eq("breakEven", [be.units, be.revenue], [500, 25000]);
const ln = C.loanPayment({ principal: 200000, annualRatePct: 6, months: 360 });
approx("loan.monthly", ln.monthly, 1199.10, 1);
eq("percentOf", C.percentOf(15, 200), 30);
eq("whatPercent", C.whatPercent(50, 200), 25);
eq("percentChange", C.percentChange(200, 250), 25);
const pf = C.platformFee({ price: 100, feePct: 15, fixedFee: 0.3 });
eq("platformFee", [pf.fee, pf.net], [15.3, 84.7]);

// UTM
const utm = C.buildUtm({ url: "https://x.com/p", source: "nl", medium: "email", campaign: "launch" });
ok("utm", utm.includes("utm_source=nl") && utm.includes("utm_medium=email") && utm.includes("utm_campaign=launch"), utm);
ok("utm.invalidUrl", C.buildUtm({ url: "not a url", source: "x" }) === "", null);

// timestamp
ok("ts.toISO", C.timestampToISO(0, "s") === "1970-01-01T00:00:00.000Z", C.timestampToISO(0));
eq("ts.roundtrip", C.isoToTimestamp("1970-01-01T00:00:00Z", "s"), 0);

// hash (async)
const h = await C.hashText("abc", "SHA-256");
ok("hash.sha256", h === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", h);

// diff
const d = C.lineDiff("a\nb\nc", "a\nx\nc");
ok("diff.add", d.some((x) => x.type === "add" && x.value === "x"), d);
ok("diff.remove", d.some((x) => x.type === "remove" && x.value === "b"), d);
ok("diff.equal", d.filter((x) => x.type === "equal").length === 2, d);

console.log(`\nUNIT TESTS: ${pass} passed, ${fail} failed`);
if (fail) { console.log("FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
else console.log("ALL UNIT TESTS PASSED \u2713");
