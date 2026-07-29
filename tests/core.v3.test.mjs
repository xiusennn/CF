// Unit tests for the v3 AI-expansion functions. Run: node tests/core.v3.test.mjs
import * as C from "../public/assets/js/core.js";
import { AI_MODELS, APIS, PROMPTS, AI_TOOLS } from "../public/assets/js/data.js";
let pass = 0, fail = 0; const fails = [];
const eq = (n, a, b) => { if (JSON.stringify(a) === JSON.stringify(b)) pass++; else { fail++; fails.push(`${n} (got ${JSON.stringify(a)})`); } };
const ok = (n, c, got) => { if (c) pass++; else { fail++; fails.push(`${n} (got ${JSON.stringify(got)})`); } };
const approx = (n, a, b, e = 0.0001) => ok(n, Math.abs(a - b) < e, a);

// estimateTokens
const t1 = C.estimateTokens("hello world this is a test"); // 26 chars
eq("tokens.chars", t1.chars, 26);
eq("tokens.words", t1.words, 6);
ok("tokens.count", t1.tokens === Math.ceil(26 / 4), t1);
const t2 = C.estimateTokens("\u4f60\u597d\u4e16\u754c"); // 4 CJK chars
eq("tokens.cjk", t2.cjk, 4);
ok("tokens.cjkCount", t2.tokens === Math.ceil(4 * 1.5), t2);
eq("tokens.empty", C.estimateTokens("").tokens, 0);

// aiCost
const c1 = C.aiCost({ inputTokens: 1000, outputTokens: 500, inPricePerM: 2.5, outPricePerM: 10, requests: 1000 });
approx("cost.input", c1.inputCost, 2.5);   // 1000/1e6*2.5*1000 = 2.5
approx("cost.output", c1.outputCost, 5.0); // 500/1e6*10*1000 = 5.0
approx("cost.total", c1.total, 7.5);
approx("cost.perReq", c1.perRequest, 0.0075);
eq("cost.zero", C.aiCost({ inputTokens: 0, outputTokens: 0, inPricePerM: 5, outPricePerM: 5, requests: 10 }).total, 0);

// passwordStrength
ok("pw.empty", C.passwordStrength("").score === 0);
ok("pw.common", C.passwordStrength("password").score <= 1, C.passwordStrength("password"));
ok("pw.commonWarn", C.passwordStrength("123456").warnings.length > 0);
ok("pw.strong", C.passwordStrength("9xK$mQ2!vB7@wLp4").score >= 3, C.passwordStrength("9xK$mQ2!vB7@wLp4"));
ok("pw.entropyOrder", C.passwordStrength("aaaaaaaa").entropyBits < C.passwordStrength("9xK$mQ2!vB7@wLp4").entropyBits);
ok("pw.seq", C.passwordStrength("abcd1234").warnings.some((w) => /sequence/i.test(w)));
ok("pw.crackText", typeof C.passwordStrength("hunter2").crackTime === "string");

// searchItems
const list = [{ a: "Weather API", b: "forecast" }, { a: "Crypto", b: "bitcoin prices" }];
eq("search.hit", C.searchItems(list, "weather", ["a", "b"]).length, 1);
eq("search.field", C.searchItems(list, "bitcoin", ["a", "b"]).length, 1);
eq("search.empty", C.searchItems(list, "", ["a"]).length, 2);
eq("search.miss", C.searchItems(list, "zzz", ["a", "b"]).length, 0);

// data integrity
ok("data.models", AI_MODELS.length >= 10 && AI_MODELS.every((m) => m.id && m.name && m.in >= 0 && m.out >= 0));
ok("data.apis", APIS.length >= 40 && APIS.every((a) => a.name && a.cat && a.desc && a.url.startsWith("http") && ["No", "apiKey", "OAuth"].includes(a.auth)));
ok("data.noauth", APIS.filter((a) => a.auth === "No").length >= 20, APIS.filter((a) => a.auth === "No").length);
ok("data.prompts", PROMPTS.length >= 20 && PROMPTS.every((p) => p.title && p.cat && p.text));
ok("data.promptPlaceholders", PROMPTS.some((p) => /\[[^\]]+\]/.test(p.text)));
ok("data.noBraces", PROMPTS.every((p) => !p.text.includes("{" + "{")), "stray double-brace placeholder");

// AI Tools Directory data integrity
ok("data.aiTools", AI_TOOLS.length >= 100 && AI_TOOLS.every((a) => a.name && a.cat && a.desc && a.url.startsWith("http") && typeof a.open === "boolean"));
ok("data.aiTools.openSome", AI_TOOLS.filter((a) => a.open).length >= 20, AI_TOOLS.filter((a) => a.open).length);
ok("data.aiTools.noBraces", AI_TOOLS.every((a) => !a.url.includes("{" + "{")), "stray placeholder in url");
ok("data.aiTools.uniqueUrls", new Set(AI_TOOLS.map((a) => a.url)).size === AI_TOOLS.length, "duplicate url");
ok("data.aiTools.uniqueNames", new Set(AI_TOOLS.map((a) => a.name)).size === AI_TOOLS.length, "duplicate name");

console.log(`\nV3 UNIT TESTS: ${pass} passed, ${fail} failed`);
if (fail) { console.log("FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
else console.log("ALL V3 UNIT TESTS PASSED \u2713");
