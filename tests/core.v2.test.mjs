// Unit tests for the v2 expansion functions. Run: node tests/core.v2.test.mjs
import * as C from "../public/assets/js/core.js";
let pass = 0, fail = 0; const fails = [];
const eq = (n, a, b) => { if (JSON.stringify(a) === JSON.stringify(b)) pass++; else { fail++; fails.push(`${n} (got ${JSON.stringify(a)})`); } };
const ok = (n, c, got) => { if (c) pass++; else { fail++; fails.push(`${n} (got ${JSON.stringify(got)})`); } };
const approx = (n, a, b, e = 0.01) => ok(n, Math.abs(a - b) < e, a);

// Text
eq("reverse.chars", C.reverseText("abc", "chars"), "cba");
eq("reverse.words", C.reverseText("one two three", "words"), "three two one");
eq("reverse.lines", C.reverseText("a\nb\nc", "lines"), "c\nb\na");
const fr = C.findReplace("the cat the dog", "the", "THE");
eq("findReplace", [fr.output, fr.count], ["THE cat THE dog", 2]);
ok("findReplace.regex", C.findReplace("a1b2c3", "[0-9]", "#", { regex: true }).output === "a#b#c#");
eq("whitespace", C.removeWhitespace("  a   b  \n\n  c ", { trimLines: true, collapseSpaces: true, removeBlankLines: true }), "a b\nc");
eq("whitespace.all", C.removeWhitespace("a b\tc", { removeAllSpaces: true }), "abc");
eq("repeat", C.repeatText("ab", 3, "-"), "ab-ab-ab");
const wf = C.wordFrequency("the cat the dog the");
eq("wordFreq", [wf[0].word, wf[0].count], ["the", 3]);
eq("rot13", C.rot13("Hello"), "Uryyb");
eq("rot13.roundtrip", C.rot13(C.rot13("Hello, World!")), "Hello, World!");
eq("caesar", C.caesarShift("abc", 1), "bcd");

// Dev
const j2c = C.jsonToCsv('[{"a":1,"b":2},{"a":3,"b":4}]');
eq("jsonToCsv", j2c.output, "a,b\n1,2\n3,4");
ok("jsonToCsv.quote", C.jsonToCsv('[{"a":"x,y"}]').output === 'a\n"x,y"');
const c2j = C.csvToJson("a,b\n1,2\n3,4");
eq("csvToJson", JSON.parse(c2j.output), [{ a: "1", b: "2" }, { a: "3", b: "4" }]);
eq("csvToJson.quoted", JSON.parse(C.csvToJson('name,note\n"Doe, J","a""b"').output), [{ name: "Doe, J", note: 'a"b' }]);
eq("htmlEnc", C.htmlEntitiesEncode('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
eq("htmlDec", C.htmlEntitiesDecode("&lt;b&gt;&amp;&#39;&#x41;"), "<b>&'A");
const jwt = C.jwtDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.abc");
ok("jwt.header", jwt.ok && jwt.header.alg === "HS256", jwt);
ok("jwt.payload", jwt.payload.name === "John Doe" && jwt.payload.sub === "1234567890", jwt.payload);
ok("jwt.invalid", C.jwtDecode("nope").ok === false);
const nb = C.numberBaseConvert("255", 10, 16);
eq("numberBase", nb.output, "FF");
eq("numberBase.bin", C.numberBaseConvert("FF", 16, 2).output, "11111111");
ok("numberBase.invalid", C.numberBaseConvert("2", 2, 10).ok === false);
eq("queryParse", C.parseQueryString("https://x.com?a=1&b=2&a=3"), { a: ["1", "3"], b: "2" });
const rx = C.regexTest("\\d+", "g", "a12b345");
eq("regex", rx.matches.map((m) => m.match), ["12", "345"]);
ok("regex.invalid", C.regexTest("(", "", "x").ok === false);

// Converters
approx("len.m2ft", C.convertLength(1, "m", "ft"), 3.28084, 0.001);
approx("len.km2mi", C.convertLength(1, "km", "mi"), 0.621371, 0.001);
approx("wt.kg2lb", C.convertWeight(1, "kg", "lb"), 2.20462, 0.001);
approx("temp.c2f", C.convertTemperature(100, "C", "F"), 212, 0.001);
approx("temp.f2c", C.convertTemperature(32, "F", "C"), 0, 0.001);
approx("temp.c2k", C.convertTemperature(0, "C", "K"), 273.15, 0.001);
eq("data.mb2kb", C.convertDataSize(1, "MB", "KB"), 1024);
eq("roman.toRoman", C.intToRoman(2026), "MMXXVI");
eq("roman.toInt", C.romanToInt("MMXXVI"), 2026);
eq("roman.4", C.intToRoman(4), "IV");
ok("roman.invalid", C.romanToInt("IIII") === null);
eq("aspect", C.aspectRatio(1920, 1080).ratio, "16:9");

// Color/design
eq("gradient", C.cssGradient({ angle: 45, stops: [{ color: "#000", pos: 0 }, { color: "#fff", pos: 100 }] }), "linear-gradient(45deg, #000 0%, #fff 100%)");
eq("boxShadow", C.cssBoxShadow({ x: 0, y: 4, blur: 8, spread: 0, color: "#000" }), "0px 4px 8px 0px #000");
eq("borderRadius", C.cssBorderRadius({ tl: 1, tr: 2, br: 3, bl: 4 }), "1px 2px 3px 4px");

// SEO
ok("meta", C.metaTags({ title: "T", description: "D", url: "https://x.com" }).includes('og:title" content="T"'));
eq("robots", C.robotsTxt({ disallow: ["/admin", ""], sitemap: "https://x.com/s.xml" }), "User-agent: *\nDisallow: /admin\nSitemap: https://x.com/s.xml");
eq("robots.allowAll", C.robotsTxt({ disallow: [] }), "User-agent: *\nAllow: /");
ok("randomString", C.randomString({ length: 30 }).length === 30);
ok("randomNumbers.range", C.randomNumbers({ min: 1, max: 6, count: 100 }).every((n) => n >= 1 && n <= 6));
ok("randomNumbers.unique", new Set(C.randomNumbers({ min: 1, max: 10, count: 10, unique: true })).size === 10);

// Calculators
eq("discount", (() => { const r = C.discount({ price: 100, percentOff: 25 }); return [r.saved, r.final]; })(), [25, 75]);
eq("tip", (() => { const r = C.tip({ bill: 100, tipPct: 20, people: 4 }); return [r.tip, r.total, r.perPerson]; })(), [20, 120, 30]);
eq("bmi", (() => { const r = C.bmi({ weightKg: 70, heightCm: 175 }); return [r.bmi, r.category]; })(), [22.86, "Normal"]);
eq("salesTax", (() => { const r = C.salesTax({ amount: 200, taxPct: 10 }); return [r.tax, r.total]; })(), [20, 220]);
const age = C.ageBetween("2000-01-01", "2026-07-12");
eq("age", [age.years, age.months, age.days], [26, 6, 11]);
eq("dateDiff", C.dateDiff("2026-01-01", "2026-01-15").days, 14);
const ci = C.compoundInterest({ principal: 1000, annualRatePct: 0, years: 1, timesPerYear: 12, contribution: 0 });
eq("compound.zeroRate", ci.finalBalance, 1000);
const ci2 = C.compoundInterest({ principal: 1000, annualRatePct: 12, years: 1, timesPerYear: 12, contribution: 0 });
approx("compound.growth", ci2.finalBalance, 1126.83, 0.5);

console.log(`\nV2 UNIT TESTS: ${pass} passed, ${fail} failed`);
if (fail) { console.log("FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
else console.log("ALL V2 UNIT TESTS PASSED \u2713");
