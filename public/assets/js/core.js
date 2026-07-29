// core.js — pure, framework-free logic for every tool.
// Imported by both the browser UI (ui.js) and the Node test suite.

// ---------- Text / data ----------
export function wordCount(text) {
  const t = String(text ?? "");
  const words = (t.trim().match(/\S+/g) || []).length;
  const chars = t.length;
  const charsNoSpaces = t.replace(/\s/g, "").length;
  const lines = t === "" ? 0 : t.split(/\r\n|\r|\n/).length;
  const sentences = (t.match(/[^.!?\u3002\uFF01\uFF1F]+[.!?\u3002\uFF01\uFF1F]+/g) || []).length || (t.trim() ? 1 : 0);
  const paragraphs = t.trim() ? t.trim().split(/\n\s*\n/).length : 0;
  const readingTimeMin = Math.max(0, Math.round((words / 200) * 10) / 10);
  return { words, chars, charsNoSpaces, lines, sentences, paragraphs, readingTimeMin };
}

export function changeCase(text, mode) {
  const t = String(text ?? "");
  switch (mode) {
    case "upper": return t.toUpperCase();
    case "lower": return t.toLowerCase();
    case "title": return t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence": return t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case "camel": { const p = t.toLowerCase().match(/[a-z0-9]+/gi) || []; return p.map((x, i) => i === 0 ? x : x.charAt(0).toUpperCase() + x.slice(1)).join(""); }
    case "pascal": { const p = t.toLowerCase().match(/[a-z0-9]+/gi) || []; return p.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(""); }
    case "snake": return (t.match(/[a-z0-9]+/gi) || []).join("_").toLowerCase();
    case "kebab": return (t.match(/[a-z0-9]+/gi) || []).join("-").toLowerCase();
    case "constant": return (t.match(/[a-z0-9]+/gi) || []).join("_").toUpperCase();
    default: return t;
  }
}

export function formatJson(text, indent = 2) {
  try { return { ok: true, output: JSON.stringify(JSON.parse(text), null, indent), error: null }; }
  catch (e) { return { ok: false, output: "", error: e.message }; }
}
export function minifyJson(text) {
  try { return { ok: true, output: JSON.stringify(JSON.parse(text)), error: null }; }
  catch (e) { return { ok: false, output: "", error: e.message }; }
}

export function base64Encode(text) {
  const bytes = new TextEncoder().encode(String(text ?? ""));
  let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
  return typeof btoa === "function" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64");
}
export function base64Decode(b64) {
  const s = String(b64 ?? "").trim();
  const bin = typeof atob === "function" ? atob(s) : Buffer.from(s, "base64").toString("binary");
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function urlEncode(text, component = true) { return component ? encodeURIComponent(String(text ?? "")) : encodeURI(String(text ?? "")); }
export function urlDecode(text) { return decodeURIComponent(String(text ?? "").replace(/\+/g, " ")); }

export function uuidV4() {
  const c = globalThis.crypto;
  if (c && c.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16); c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export function slugify(text) {
  return String(text ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function removeDuplicateLines(text, { trim = true, caseInsensitive = false } = {}) {
  const seen = new Set(); const out = [];
  for (const raw of String(text ?? "").split(/\r\n|\r|\n/)) {
    let key = trim ? raw.trim() : raw; if (caseInsensitive) key = key.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(raw); }
  }
  return out.join("\n");
}
export function sortLines(text, { order = "asc", numeric = false, caseInsensitive = false } = {}) {
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  lines.sort((a, b) => {
    if (numeric) return (parseFloat(a) || 0) - (parseFloat(b) || 0);
    let x = a, y = b; if (caseInsensitive) { x = a.toLowerCase(); y = b.toLowerCase(); }
    return x < y ? -1 : x > y ? 1 : 0;
  });
  if (order === "desc") lines.reverse();
  return lines.join("\n");
}

const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function loremIpsum(paragraphs = 3, wordsPerPara = 40) {
  const out = [];
  for (let p = 0; p < paragraphs; p++) {
    const words = []; for (let i = 0; i < wordsPerPara; i++) words.push(LOREM[(p * wordsPerPara + i) % LOREM.length]);
    let s = words.join(" "); out.push(s.charAt(0).toUpperCase() + s.slice(1) + ".");
  }
  return out.join("\n\n");
}

export function passwordGenerate({ length = 16, upper = true, lower = true, digits = true, symbols = true } = {}) {
  let pool = "";
  if (lower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (digits) pool += "0123456789";
  if (symbols) pool += "!@#$%^&*()-_=+[]{};:,.<>?";
  if (!pool) pool = "abcdefghijklmnopqrstuvwxyz";
  const rnd = new Uint32Array(length); globalThis.crypto.getRandomValues(rnd);
  let out = ""; for (let i = 0; i < length; i++) out += pool[rnd[i] % pool.length];
  return out;
}

// ---------- Color ----------
export function hexToRgb(hex) {
  let h = String(hex).replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
export function rgbToHex(r, g, b) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
export function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  const hue = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue(p, q, h + 1/3); g = hue(p, q, h); b = hue(p, q, h - 1/3); }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
export function generatePalette(hex) {
  const rgb = hexToRgb(hex); if (!rgb) return null;
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b); const shades = [];
  for (const l of [95, 85, 72, 60, 50, 42, 34, 26, 18, 10]) { const c = hslToRgb(h, s, l); shades.push(rgbToHex(c.r, c.g, c.b)); }
  return shades;
}
export function contrastRatio(hex1, hex2) {
  const lum = (hex) => { const c = hexToRgb(hex); if (!c) return null; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const l1 = lum(hex1), l2 = lum(hex2); if (l1 == null || l2 == null) return null;
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

// ---------- Calculators ----------
export function percentOf(percent, value) { return (percent / 100) * value; }
export function whatPercent(part, whole) { return whole === 0 ? 0 : (part / whole) * 100; }
export function percentChange(from, to) { return from === 0 ? 0 : ((to - from) / Math.abs(from)) * 100; }
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
export function profitMargin({ cost, price }) {
  cost = Number(cost); price = Number(price); const profit = price - cost;
  return { profit: round2(profit), marginPct: round2(price === 0 ? 0 : (profit / price) * 100), markupPct: round2(cost === 0 ? 0 : (profit / cost) * 100) };
}
export function roas({ revenue, adSpend }) {
  revenue = Number(revenue); adSpend = Number(adSpend);
  return { roas: round2(adSpend === 0 ? 0 : revenue / adSpend), acos: round2(revenue === 0 ? 0 : (adSpend / revenue) * 100) };
}
export function breakEven({ fixedCosts, pricePerUnit, variableCostPerUnit }) {
  fixedCosts = Number(fixedCosts); pricePerUnit = Number(pricePerUnit); variableCostPerUnit = Number(variableCostPerUnit);
  const margin = pricePerUnit - variableCostPerUnit;
  const units = margin <= 0 ? Infinity : fixedCosts / margin;
  return { units: units === Infinity ? Infinity : Math.ceil(units), revenue: units === Infinity ? Infinity : round2(Math.ceil(units) * pricePerUnit) };
}
export function loanPayment({ principal, annualRatePct, months }) {
  principal = Number(principal); const r = Number(annualRatePct) / 100 / 12; months = Number(months);
  const monthly = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
  const total = monthly * months;
  return { monthly: round2(monthly), total: round2(total), totalInterest: round2(total - principal) };
}
export function platformFee({ price, feePct, fixedFee = 0 }) {
  price = Number(price); feePct = Number(feePct); fixedFee = Number(fixedFee);
  const fee = (price * feePct) / 100 + fixedFee;
  return { fee: round2(fee), net: round2(price - fee) };
}

// ---------- Web / SEO ----------
export function buildUtm({ url, source, medium, campaign, term = "", content = "" }) {
  if (!url) return "";
  let base; try { base = new URL(url); } catch { return ""; }
  const p = base.searchParams;
  if (source) p.set("utm_source", source);
  if (medium) p.set("utm_medium", medium);
  if (campaign) p.set("utm_campaign", campaign);
  if (term) p.set("utm_term", term);
  if (content) p.set("utm_content", content);
  return base.toString();
}

// ---------- Time ----------
export function timestampToISO(ts, unit = "s") {
  const ms = unit === "ms" ? Number(ts) : Number(ts) * 1000;
  const d = new Date(ms); if (isNaN(d.getTime())) return null; return d.toISOString();
}
export function isoToTimestamp(iso, unit = "s") {
  const d = new Date(iso); if (isNaN(d.getTime())) return null;
  return unit === "ms" ? d.getTime() : Math.floor(d.getTime() / 1000);
}

// ---------- Hash ----------
export async function hashText(text, algo = "SHA-256") {
  const subtle = globalThis.crypto.subtle;
  const buf = await subtle.digest(algo, new TextEncoder().encode(String(text ?? "")));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Line diff (LCS) ----------
export function lineDiff(a, b) {
  const A = String(a ?? "").split(/\r\n|\r|\n/), B = String(b ?? "").split(/\r\n|\r|\n/);
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: "equal", value: A[i] }); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]) { out.push({ type: "remove", value: A[i] }); i++; }
    else { out.push({ type: "add", value: B[j] }); j++; }
  }
  while (i < n) out.push({ type: "remove", value: A[i++] });
  while (j < m) out.push({ type: "add", value: B[j++] });
  return out;
}

// ===================== v2 EXPANSION: additional pure logic =====================
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }

// ---------- Text ----------
export function reverseText(text, mode = "chars") {
  const t = String(text ?? "");
  if (mode === "words") return t.trim().split(/\s+/).reverse().join(" ");
  if (mode === "lines") return t.split(/\r\n|\r|\n/).reverse().join("\n");
  return [...t].reverse().join("");
}
export function findReplace(text, find, replace, { regex = false, caseInsensitive = false } = {}) {
  const str = String(text ?? "");
  if (find === "" || find == null) return { ok: true, output: str, count: 0 };
  try {
    const flags = "g" + (caseInsensitive ? "i" : "");
    const re = regex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const m = str.match(re); const count = m ? m.length : 0;
    const repl = regex ? replace : String(replace).replace(/\$/g, "$$$$");
    return { ok: true, output: str.replace(re, repl), count };
  } catch (e) { return { ok: false, output: "", count: 0, error: e.message }; }
}
export function removeWhitespace(text, { trimLines = true, collapseSpaces = true, removeBlankLines = false, removeAllSpaces = false } = {}) {
  let lines = String(text ?? "").split(/\r\n|\r|\n/).map((l) => {
    let x = l;
    if (removeAllSpaces) x = x.replace(/\s+/g, "");
    else { if (collapseSpaces) x = x.replace(/[ \t]+/g, " "); if (trimLines) x = x.trim(); }
    return x;
  });
  if (removeBlankLines) lines = lines.filter((l) => l.trim() !== "");
  return lines.join("\n");
}
export function repeatText(text, times, separator = "") {
  times = Math.max(0, Math.min(100000, Math.floor(Number(times) || 0)));
  return Array.from({ length: times }, () => String(text ?? "")).join(separator);
}
export function wordFrequency(text, { caseInsensitive = true } = {}) {
  let t = String(text ?? ""); if (caseInsensitive) t = t.toLowerCase();
  const words = t.match(/[\p{L}\p{N}']+/gu) || [];
  const map = new Map(); for (const w of words) map.set(w, (map.get(w) || 0) + 1);
  return [...map.entries()].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}
export function caesarShift(text, shift = 13) {
  const s = ((Math.floor(Number(shift)) % 26) + 26) % 26;
  return String(text ?? "").replace(/[a-z]/gi, (c) => { const base = c <= "Z" ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - base + s) % 26 + base); });
}
export function rot13(text) { return caesarShift(text, 13); }

// ---------- Developer ----------
export function jsonToCsv(jsonText) {
  try {
    const data = JSON.parse(jsonText); const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return { ok: true, output: "", error: null };
    const keys = []; for (const row of arr) if (row && typeof row === "object") for (const k of Object.keys(row)) if (!keys.includes(k)) keys.push(k);
    const esc = (v) => { if (v == null) return ""; if (typeof v === "object") v = JSON.stringify(v); v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const lines = [keys.join(",")];
    for (const row of arr) lines.push(keys.map((k) => esc(row ? row[k] : "")).join(","));
    return { ok: true, output: lines.join("\n"), error: null };
  } catch (e) { return { ok: false, output: "", error: e.message }; }
}
function parseCsv(text, delim) {
  const rows = []; let row = [], field = "", i = 0, inQ = false;
  while (i < text.length) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; } field += c; i++; continue; }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === delim) { row.push(field); field = ""; i++; continue; }
    if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); field = ""; rows.push(row); row = []; i++; continue; }
    field += c; i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}
export function csvToJson(csvText, { delimiter = "," } = {}) {
  try {
    const rows = parseCsv(String(csvText ?? ""), delimiter);
    if (rows.length === 0) return { ok: true, output: "[]", error: null };
    const headers = rows[0];
    const out = rows.slice(1).filter((r) => !(r.length === 1 && r[0] === "")).map((r) => { const o = {}; headers.forEach((h, i) => (o[h] = r[i] !== undefined ? r[i] : "")); return o; });
    return { ok: true, output: JSON.stringify(out, null, 2), error: null };
  } catch (e) { return { ok: false, output: "", error: e.message }; }
}
const HTML_ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function htmlEntitiesEncode(text) { return String(text ?? "").replace(/[&<>"']/g, (c) => HTML_ENT[c]); }
export function htmlEntitiesDecode(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
  return String(text ?? "").replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") { const code = (e[1] === "x" || e[1] === "X") ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return isNaN(code) ? m : String.fromCodePoint(code); }
    return named[e] !== undefined ? named[e] : m;
  });
}
export function jwtDecode(token) {
  try {
    const parts = String(token ?? "").trim().split(".");
    if (parts.length < 2) return { ok: false, error: "Not a valid JWT (needs header.payload.signature)" };
    const dec = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(base64Decode(s)); };
    const header = dec(parts[0]); const payload = dec(parts[1]);
    let expInfo = null;
    if (payload && payload.exp) { const ms = payload.exp * 1000; expInfo = { expiresAt: new Date(ms).toISOString(), expired: Date.now() > ms }; }
    return { ok: true, header, payload, signature: parts[2] || "", expInfo };
  } catch (e) { return { ok: false, error: e.message }; }
}
export function numberBaseConvert(value, fromBase, toBase) {
  fromBase = Number(fromBase); toBase = Number(toBase);
  const s = String(value ?? "").trim();
  if (!s) return { ok: false, error: "Enter a value" };
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) return { ok: false, error: "Base must be 2-36" };
  const neg = s[0] === "-"; const digits = (neg ? s.slice(1) : s).toLowerCase();
  if (digits === "") return { ok: false, error: "Invalid number" };
  const valid = digits.split("").every((ch) => { const d = parseInt(ch, 36); return !isNaN(d) && d < fromBase; });
  if (!valid) return { ok: false, error: "Invalid digits for base " + fromBase };
  const n = parseInt(digits, fromBase); if (isNaN(n)) return { ok: false, error: "Cannot parse" };
  return { ok: true, output: (neg ? "-" : "") + n.toString(toBase).toUpperCase(), decimal: neg ? -n : n };
}
export function parseQueryString(qs) {
  let s = String(qs ?? "").trim(); const q = s.indexOf("?"); if (q >= 0) s = s.slice(q + 1);
  const params = new URLSearchParams(s); const obj = {};
  for (const [k, v] of params) { if (k in obj) { if (Array.isArray(obj[k])) obj[k].push(v); else obj[k] = [obj[k], v]; } else obj[k] = v; }
  return obj;
}
export function regexTest(pattern, flags, text) {
  try {
    let f = String(flags || ""); if (!f.includes("g")) f += "g";
    const re = new RegExp(pattern, f); const matches = []; let m, guard = 0;
    const str = String(text ?? "");
    while ((m = re.exec(str)) !== null) { matches.push({ match: m[0], index: m.index, groups: m.slice(1) }); if (m.index === re.lastIndex) re.lastIndex++; if (++guard > 10000) break; }
    return { ok: true, matches };
  } catch (e) { return { ok: false, error: e.message, matches: [] }; }
}

// ---------- Converters / units ----------
const LENGTH = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 };
const WEIGHT = { g: 1, kg: 1000, mg: 0.001, t: 1e6, lb: 453.59237, oz: 28.349523125, st: 6350.29318 };
const DATA = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 1 / 8 };
function convertUnit(value, from, to, table) { value = Number(value); if (!(from in table) || !(to in table)) return null; return (value * table[from]) / table[to]; }
export function convertLength(value, from, to) { return convertUnit(value, from, to, LENGTH); }
export function convertWeight(value, from, to) { return convertUnit(value, from, to, WEIGHT); }
export function convertDataSize(value, from, to) { return convertUnit(value, from, to, DATA); }
export function convertTemperature(value, from, to) {
  value = Number(value); let c;
  if (from === "C") c = value; else if (from === "F") c = (value - 32) * 5 / 9; else if (from === "K") c = value - 273.15; else return null;
  if (to === "C") return c; if (to === "F") return c * 9 / 5 + 32; if (to === "K") return c + 273.15; return null;
}
export function intToRoman(num) {
  num = Math.floor(Number(num)); if (!(num >= 1 && num <= 3999)) return null;
  const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = ""; for (const [v, sym] of map) while (num >= v) { out += sym; num -= v; } return out;
}
export function romanToInt(s) {
  s = String(s ?? "").toUpperCase().trim(); if (!/^[MDCLXVI]+$/.test(s)) return null;
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let total = 0;
  for (let i = 0; i < s.length; i++) { const cur = val[s[i]], next = val[s[i + 1]]; total += next > cur ? -cur : cur; }
  return intToRoman(total) === s ? total : null;
}
export function aspectRatio(w, h) { w = Math.round(Number(w)); h = Math.round(Number(h)); if (!w || !h) return null; const g = gcd(w, h); return { ratio: `${w / g}:${h / g}`, decimal: Math.round((w / h) * 1000) / 1000 }; }

// ---------- Color / design CSS ----------
export function cssGradient({ type = "linear", angle = 90, stops = [{ color: "#6d5efc", pos: 0 }, { color: "#23d5ab", pos: 100 }] } = {}) {
  const s = stops.map((st) => `${st.color} ${st.pos}%`).join(", ");
  return type === "radial" ? `radial-gradient(circle, ${s})` : `linear-gradient(${angle}deg, ${s})`;
}
export function cssBoxShadow({ x = 0, y = 8, blur = 24, spread = 0, color = "rgba(0,0,0,0.25)", inset = false } = {}) { return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${color}`; }
export function cssBorderRadius({ tl = 12, tr = 12, br = 12, bl = 12, unit = "px" } = {}) { return `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`; }

// ---------- Web / SEO ----------
export function metaTags({ title = "", description = "", url = "", image = "", type = "website" } = {}) {
  const a = (s) => String(s).replace(/"/g, "&quot;"); const lines = [];
  if (title) lines.push(`<title>${a(title)}</title>`);
  if (description) lines.push(`<meta name="description" content="${a(description)}">`);
  if (title) lines.push(`<meta property="og:title" content="${a(title)}">`);
  if (description) lines.push(`<meta property="og:description" content="${a(description)}">`);
  lines.push(`<meta property="og:type" content="${a(type)}">`);
  if (url) lines.push(`<meta property="og:url" content="${a(url)}">`);
  if (image) lines.push(`<meta property="og:image" content="${a(image)}">`);
  lines.push(`<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`);
  if (title) lines.push(`<meta name="twitter:title" content="${a(title)}">`);
  return lines.join("\n");
}
export function robotsTxt({ disallow = [], sitemap = "" } = {}) {
  const lines = ["User-agent: *"]; const dis = (disallow || []).map((p) => p.trim()).filter(Boolean);
  if (dis.length === 0) lines.push("Allow: /"); else for (const p of dis) lines.push("Disallow: " + p);
  if (sitemap) lines.push("Sitemap: " + sitemap);
  return lines.join("\n");
}
export function randomString({ length = 16, upper = true, lower = true, digits = true, symbols = false } = {}) { return passwordGenerate({ length, upper, lower, digits, symbols }); }
export function randomNumbers({ min = 1, max = 100, count = 1, unique = false } = {}) {
  min = Math.ceil(Number(min)); max = Math.floor(Number(max)); count = Math.max(1, Math.min(10000, Math.floor(count)));
  if (max < min) [min, max] = [max, min];
  const range = max - min + 1; const rnd = () => { const r = new Uint32Array(1); globalThis.crypto.getRandomValues(r); return min + (r[0] % range); };
  if (unique && count <= range) { const pool = new Set(); while (pool.size < count) pool.add(rnd()); return [...pool]; }
  const out = []; for (let i = 0; i < count; i++) out.push(rnd()); return out;
}

// ---------- Calculators ----------
export function discount({ price, percentOff }) { price = Number(price); percentOff = Number(percentOff); const saved = (price * percentOff) / 100; return { saved: round2(saved), final: round2(price - saved) }; }
export function tip({ bill, tipPct, people = 1 }) { bill = Number(bill); tipPct = Number(tipPct); people = Math.max(1, Number(people)); const t = (bill * tipPct) / 100; const total = bill + t; return { tip: round2(t), total: round2(total), perPerson: round2(total / people) }; }
export function bmi({ weightKg, heightCm }) { const w = Number(weightKg); const h = Number(heightCm) / 100; if (!h) return null; const v = w / (h * h); let cat; if (v < 18.5) cat = "Underweight"; else if (v < 25) cat = "Normal"; else if (v < 30) cat = "Overweight"; else cat = "Obese"; return { bmi: round2(v), category: cat }; }
export function ageBetween(birthISO, atISO) {
  const b = new Date(birthISO); const a = atISO ? new Date(atISO) : new Date();
  if (isNaN(b.getTime()) || isNaN(a.getTime())) return null;
  let years = a.getFullYear() - b.getFullYear(); let months = a.getMonth() - b.getMonth(); let days = a.getDate() - b.getDate();
  if (days < 0) { months--; days += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days, totalDays: Math.floor((a - b) / 86400000) };
}
export function dateDiff(aISO, bISO) {
  const a = new Date(aISO); const b = new Date(bISO); if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  const ms = Math.abs(b - a); const days = Math.floor(ms / 86400000);
  return { days, weeks: Math.floor(days / 7), hours: Math.floor(ms / 3600000) };
}
export function compoundInterest({ principal, annualRatePct, years, timesPerYear = 12, contribution = 0 }) {
  const P = Number(principal); const r = Number(annualRatePct) / 100; const t = Number(years); const n = Number(timesPerYear); const PMT = Number(contribution);
  const factor = Math.pow(1 + r / n, n * t);
  const fromContrib = r === 0 ? PMT * n * t : PMT * ((factor - 1) / (r / n));
  const finalBalance = P * factor + fromContrib; const totalContributions = P + PMT * n * t;
  return { finalBalance: round2(finalBalance), totalContributions: round2(totalContributions), totalInterest: round2(finalBalance - totalContributions) };
}
export function salesTax({ amount, taxPct }) { amount = Number(amount); taxPct = Number(taxPct); const tax = (amount * taxPct) / 100; return { tax: round2(tax), total: round2(amount + tax) }; }

// ===== v3 AI EXPANSION (pure logic) =====
function _roundTo(x, n) { const f = Math.pow(10, n); return Math.round((x + Number.EPSILON) * f) / f; }
function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds > 3.15e11) return "centuries"; // > ~10k years
  if (seconds < 0.001) return "instantly";
  const units = [["century", 3153600000], ["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
  for (const [name, s] of units) { if (seconds >= s) { const v = Math.round(seconds / s); return v + " " + name + (v > 1 ? "s" : ""); } }
  return "less than a second";
}

// Approximate LLM token count. NOT an exact tiktoken/BPE result — a transparent
// heuristic: ~4 chars/token for latin text, ~1.5 tokens per CJK character.
export function estimateTokens(text) {
  text = String(text || "");
  const chars = [...text].length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const cjk = (text.match(/[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/g) || []).length;
  const rest = text.replace(/[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/g, "");
  const tokens = Math.ceil(rest.length / 4) + Math.ceil(cjk * 1.5);
  return { tokens, chars, words, cjk };
}

// Cost math for LLM API usage. Prices are per 1,000,000 tokens (USD).
// inputTokens / outputTokens are per request.
export function aiCost({ inputTokens = 0, outputTokens = 0, inPricePerM = 0, outPricePerM = 0, requests = 1 }) {
  const inPer = (inputTokens / 1e6) * inPricePerM;
  const outPer = (outputTokens / 1e6) * outPricePerM;
  const perRequest = inPer + outPer;
  const total = perRequest * requests;
  return {
    inputCost: _roundTo(inPer * requests, 4),
    outputCost: _roundTo(outPer * requests, 4),
    perRequest: _roundTo(perRequest, 6),
    total: _roundTo(total, 4),
  };
}

// Heuristic password strength (entropy + common-pattern penalties).
// This is an estimate for guidance, NOT a substitute for a breach-list check.
export function passwordStrength(pw) {
  pw = String(pw || "");
  const warnings = [], suggestions = [];
  if (!pw) return { score: 0, label: "Empty", entropyBits: 0, crackTime: "\u2014", warnings: ["Enter a password"], suggestions: [] };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(pool || 1);
  const lower = pw.toLowerCase();
  const COMMON = ["password", "passw0rd", "123456", "1234567", "12345678", "123456789", "qwerty", "111111", "abc123", "password1", "iloveyou", "admin", "welcome", "monkey", "dragon", "letmein", "football", "123123", "000000"];
  if (COMMON.includes(lower)) { bits = Math.min(bits, 8); warnings.push("This is a very common password"); }
  if (/^(.)\1+$/.test(pw)) { bits = Math.min(bits, 10); warnings.push("Just one repeated character"); }
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf|sdfg|zxcv)/.test(lower)) { bits -= 12; warnings.push("Contains a common sequence"); }
  if (/(19|20)\d{2}/.test(pw)) { bits -= 6; warnings.push("Contains what looks like a year"); }
  if (/^\d+$/.test(pw)) { warnings.push("Digits only"); suggestions.push("Add letters and symbols"); }
  if (pw.length < 8) suggestions.push("Use at least 12 characters");
  else if (pw.length < 12) suggestions.push("Longer is stronger \u2014 aim for 12+");
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^a-zA-Z0-9]/.test(pw)) suggestions.push("Mix upper, lower, digits and symbols");
  bits = Math.max(0, bits);
  const seconds = Math.pow(2, bits) / 1e10; // 10B guesses/sec (offline fast hash)
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  return { score, label: labels[score], entropyBits: Math.round(bits), crackTime: formatDuration(seconds), warnings, suggestions };
}

// Generic case-insensitive search across chosen string fields.
export function searchItems(list, query, fields) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return list.slice();
  return list.filter((it) => fields.some((f) => String(it[f] || "").toLowerCase().includes(q)));
}


// ===================================================================
// v4 tools — pure-JS reimplementations of popular libraries (offline,
// no third-party scripts; keeps the site's privacy-first CSP intact).
// ===================================================================

// MD5 hash (crypto-js equivalent). WebCrypto has no MD5, so this is a
// compact pure-JS implementation (blueimp-style, public domain).
export function md5(string) {
  function safeAdd(x, y) { const lsw = (x & 0xffff) + (y & 0xffff); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
  function rol(n, c) { return (n << c) | (n >>> (32 - c)); }
  function cmn(q, a, b, x, s, t) { return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
  function binlMD5(x, len) {
    x[len >> 5] |= 0x80 << (len % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const oa = a, ob = b, oc = c, od = d;
      a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426); c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632); c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
      a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784); c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222); c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606); c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
    }
    return [a, b, c, d];
  }
  function rstr2binl(input) { const output = []; for (let i = 0; i < input.length * 8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32); return output; }
  function binl2rstr(input) { let output = ""; for (let i = 0; i < input.length * 32; i += 8) output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff); return output; }
  function rstr2hex(input) { const hex = "0123456789abcdef"; let out = ""; for (let i = 0; i < input.length; i++) { const x = input.charCodeAt(i); out += hex.charAt((x >>> 4) & 0x0f) + hex.charAt(x & 0x0f); } return out; }
  const s = unescape(encodeURIComponent(String(string == null ? "" : string)));
  return rstr2hex(binl2rstr(binlMD5(rstr2binl(s), s.length * 8)));
}

// Markdown -> HTML (marked / markdown-it equivalent). Supports headings,
// bold/italic/strikethrough/inline-code, links, images, fenced code,
// blockquotes, ordered/unordered lists, hr and paragraphs.
export function markdownToHtml(md) {
  md = String(md == null ? "" : md).replace(/\r\n?/g, "\n");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\b_([^_]+)_\b/g, "<em>$1</em>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
  const lines = md.split("\n");
  const out = []; let i = 0;
  const isBlock = (l) => /^(#{1,6}\s|>|```|\s*[-*+]\s|\s*\d+\.\s)/.test(l) || /^(\s*)(---|\*\*\*|___)\s*$/.test(l) || /^\s*$/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) { const lang = line.slice(3).trim(); const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; } i++; out.push(`<pre><code${lang ? ` class="language-${lang}"` : ""}>${esc(buf.join("\n"))}</code></pre>`); continue; }
    if (/^(\s*)(---|\*\*\*|___)\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/); if (h) { const lvl = h[1].length; out.push(`<h${lvl}>${inline(h[2].trim())}</h${lvl}>`); i++; continue; }
    if (/^>\s?/.test(line)) { const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; } out.push(`<blockquote>${markdownToHtml(buf.join("\n"))}</blockquote>`); continue; }
    if (/^\s*[-*+]\s+/.test(line)) { const buf = []; while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { buf.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ""))}</li>`); i++; } out.push(`<ul>${buf.join("")}</ul>`); continue; }
    if (/^\s*\d+\.\s+/.test(line)) { const buf = []; while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`); i++; } out.push(`<ol>${buf.join("")}</ol>`); continue; }
    if (/^\s*$/.test(line)) { i++; continue; }
    const buf = []; while (i < lines.length && !isBlock(lines[i])) { buf.push(lines[i]); i++; }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

// HTML -> Markdown (turndown equivalent). Pure-string tokenizer so it runs
// in tests too (no DOM dependency).
export function htmlToMarkdown(html) {
  let s = String(html == null ? "" : html).replace(/\r\n?/g, "\n");
  s = s.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (m, c) => `\n\n\`\`\`\n${c.replace(/<[^>]+>/g, "").trim()}\n\`\`\`\n\n`);
  for (let n = 6; n >= 1; n--) s = s.replace(new RegExp(`<h${n}[^>]*>([\\s\\S]*?)<\\/h${n}>`, "gi"), (m, c) => `\n\n${"#".repeat(n)} ${c.replace(/<[^>]+>/g, "").trim()}\n\n`);
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<img[^>]*?alt="([^"]*)"[^>]*?src="([^"]*)"[^>]*>/gi, "![$1]($2)");
  s = s.replace(/<img[^>]*?src="([^"]*)"[^>]*?alt="([^"]*)"[^>]*>/gi, "![$2]($1)");
  s = s.replace(/<img[^>]*?src="([^"]*)"[^>]*>/gi, "![]($1)");
  s = s.replace(/<a[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, c) => `- ${c.replace(/<[^>]+>/g, "").trim()}\n`);
  s = s.replace(/<\/(ul|ol)>/gi, "\n").replace(/<(ul|ol)[^>]*>/gi, "\n");
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, c) => `\n> ${c.replace(/<[^>]+>/g, "").trim()}\n\n`);
  s = s.replace(/<hr[^>]*>/gi, "\n\n---\n\n").replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n\n").replace(/<p[^>]*>/gi, "").replace(/<\/div>/gi, "\n").replace(/<div[^>]*>/gi, "");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// String validator (validator.js equivalent). Returns a map of checks.
export function validateString(value) {
  const v = String(value == null ? "" : value).trim();
  const luhn = (num) => { const d = num.replace(/[\s-]/g, ""); if (!/^\d{12,19}$/.test(d)) return false; let sum = 0, alt = false; for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; } return sum % 10 === 0; };
  let isJSON = false; try { if (v) { JSON.parse(v); isJSON = true; } } catch { /* not json */ }
  return {
    length: v.length,
    isEmail: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    isURL: /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v),
    isIPv4: /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(v),
    isIPv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(v),
    isCreditCard: luhn(v),
    isHexColor: /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v),
    isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v),
    isNumeric: v !== "" && !isNaN(Number(v)),
    isSlug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
    isJSON,
    isStrongPassword: v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^a-zA-Z0-9]/.test(v),
  };
}

// JSON repair (jsonrepair equivalent). Fixes the most common breakages and
// returns the cleaned output plus a list of changes applied.
export function repairJson(input) {
  const original = String(input == null ? "" : input);
  let s = original.replace(/^\uFEFF/, "");
  const changes = [];
  if (/\/\/|\/\*/.test(s)) { s = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"])\/\/[^\n]*/g, "$1"); changes.push("Removed comments"); }
  if (/[\u201C\u201D\u2018\u2019]/.test(s)) { s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'"); changes.push("Normalized smart quotes"); }
  if (/\b(None|True|False)\b/.test(s)) { s = s.replace(/\bNone\b/g, "null").replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false"); changes.push("Converted Python None/True/False"); }
  if (/'/.test(s)) { s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (m, c) => `"${c.replace(/"/g, '\\"')}"`); changes.push("Converted single quotes to double"); }
  const beforeKeys = s;
  s = s.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g, '$1"$2"$3');
  if (s !== beforeKeys) changes.push("Quoted unquoted keys");
  if (/,\s*[}\]]/.test(s)) { s = s.replace(/,(\s*[}\]])/g, "$1"); changes.push("Removed trailing commas"); }
  s = s.trim();
  let ok = false, error = null, output = s;
  try { output = JSON.stringify(JSON.parse(s), null, 2); ok = true; } catch (e) { error = e.message; }
  if (ok && !changes.length) changes.push("Already valid JSON");
  return { ok, output, error, changes };
}

// Fake data generator (faker equivalent). Deterministic when a seed is given.
const _FAKE_FIRST = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn", "Wei", "Yan", "Li", "Chen", "Mei", "Hiro", "Sofia", "Diego", "Nina", "Omar"];
const _FAKE_LAST = ["Smith", "Johnson", "Lee", "Wang", "Garcia", "Nguyen", "Kim", "Patel", "Brown", "Davis", "Muller", "Rossi", "Silva", "Tanaka", "Ivanov", "Khan", "Cohen", "Dubois", "Santos", "Zhang"];
const _FAKE_CITY = ["Shanghai", "New York", "London", "Tokyo", "Paris", "Berlin", "Sydney", "Toronto", "Singapore", "Dubai", "Mumbai", "Seoul", "Madrid", "Rome", "Cairo"];
const _FAKE_COMPANY = ["Acme", "Globex", "Initech", "Umbrella", "Stark", "Wayne", "Wonka", "Hooli", "Vehement", "Massive Dynamic", "Cyberdyne", "Soylent"];
const _FAKE_DOMAIN = ["example.com", "mail.com", "test.org", "demo.net", "inbox.io"];
export function fakeData(count = 5, seed) {
  count = Math.max(1, Math.min(1000, Math.floor(count) || 5));
  let st = (seed == null ? (Date.now() ^ Math.floor(Math.random() * 1e9)) : Number(seed)) >>> 0;
  const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const uuid = () => { const h = "0123456789abcdef"; let u = ""; for (let i = 0; i < 32; i++) { u += i === 12 ? "4" : i === 16 ? h[8 + Math.floor(rnd() * 4)] : h[Math.floor(rnd() * 16)]; } return u.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5"); };
  const out = [];
  for (let i = 0; i < count; i++) {
    const fn = pick(_FAKE_FIRST), ln = pick(_FAKE_LAST);
    out.push({
      id: i + 1,
      name: `${fn} ${ln}`,
      email: `${fn}.${ln}`.toLowerCase().replace(/[^a-z.]/g, "") + "@" + pick(_FAKE_DOMAIN),
      phone: `+1-${200 + Math.floor(rnd() * 800)}-${100 + Math.floor(rnd() * 900)}-${1000 + Math.floor(rnd() * 9000)}`,
      city: pick(_FAKE_CITY),
      company: pick(_FAKE_COMPANY),
      age: 18 + Math.floor(rnd() * 60),
      uuid: uuid(),
    });
  }
  return out;
}

// Rows -> CSV helper (used by the fake-data tool's CSV export).
export function rowsToCsv(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v) => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}
