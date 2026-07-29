// Unit tests for v4 tools. Run: node tests/core.v4.test.mjs
import * as C from "../public/assets/js/core.js";

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(`${name} (got: ${JSON.stringify(got)})`); } }
function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b), a); }

// md5 — known vectors
eq("md5.empty", C.md5(""), "d41d8cd98f00b204e9800998ecf8427e");
eq("md5.abc", C.md5("abc"), "900150983cd24fb0d6963f7d28e17f72");
eq("md5.fox", C.md5("The quick brown fox jumps over the lazy dog"), "9e107d9d372bb6826bd81d3542a419d6");
eq("md5.utf8", C.md5("\u4f60\u597d"), "7eca689f0d3389d9dea66ae112e5cfd7");

// markdownToHtml
ok("md2html.h1", C.markdownToHtml("# Hi").includes("<h1>Hi</h1>"), C.markdownToHtml("# Hi"));
ok("md2html.bold", C.markdownToHtml("a **b** c").includes("<strong>b</strong>"), null);
ok("md2html.link", C.markdownToHtml("[x](https://y.com)").includes('<a href="https://y.com">x</a>'), null);
ok("md2html.ul", C.markdownToHtml("- one\n- two").includes("<ul><li>one</li><li>two</li></ul>"), C.markdownToHtml("- one\n- two"));
ok("md2html.code", C.markdownToHtml("```\nx=1\n```").includes("<pre><code>x=1</code></pre>"), C.markdownToHtml("```\nx=1\n```"));

// htmlToMarkdown
eq("html2md.h1", C.htmlToMarkdown("<h1>Hello</h1>"), "# Hello");
ok("html2md.bold", C.htmlToMarkdown("<p>a <strong>b</strong></p>").includes("a **b**"), C.htmlToMarkdown("<p>a <strong>b</strong></p>"));
ok("html2md.link", C.htmlToMarkdown('<a href="https://y.com">x</a>').includes("[x](https://y.com)"), null);
ok("html2md.li", C.htmlToMarkdown("<ul><li>one</li><li>two</li></ul>").includes("- one"), C.htmlToMarkdown("<ul><li>one</li><li>two</li></ul>"));

// validateString
const ve = C.validateString("a@b.com"); ok("validate.email", ve.isEmail === true, ve);
const vc = C.validateString("4111 1111 1111 1111"); ok("validate.cc", vc.isCreditCard === true, vc);
const vu = C.validateString("https://toolhub.example"); ok("validate.url", vu.isURL === true, vu);
const vip = C.validateString("192.168.0.1"); ok("validate.ipv4", vip.isIPv4 === true, vip);
const vbad = C.validateString("not-an-email"); ok("validate.notEmail", vbad.isEmail === false, vbad);

// repairJson
const r1 = C.repairJson("{a:1, b:'x',}"); ok("repair.ok", r1.ok === true, r1);
ok("repair.parses", JSON.stringify(JSON.parse(r1.output)) === '{"a":1,"b":"x"}', r1.output);
const r2 = C.repairJson('{"good": true}'); ok("repair.valid", r2.ok === true && r2.changes.includes("Already valid JSON"), r2);
const r3 = C.repairJson("{x: None}"); ok("repair.python", r3.ok === true && JSON.parse(r3.output).x === null, r3);

// fakeData — deterministic with seed
const f1 = C.fakeData(3, 42); const f2 = C.fakeData(3, 42);
ok("fake.count", f1.length === 3, f1.length);
eq("fake.deterministic", f1, f2);
ok("fake.email", /@/.test(f1[0].email), f1[0].email);
ok("fake.uuid", /^[0-9a-f-]{36}$/.test(f1[0].uuid), f1[0].uuid);

// rowsToCsv
ok("csv.header", C.rowsToCsv([{ a: 1, b: 2 }]).split("\n")[0] === "a,b", null);
ok("csv.quote", C.rowsToCsv([{ a: "x,y" }]).includes('"x,y"'), null);

console.log(`v4 tests: ${pass} passed, ${fail} failed`);
if (fail) { console.log(fails.join("\n")); process.exit(1); }
