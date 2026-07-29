// build-skills-catalog.mjs — turns the raw Skills pipeline output (hundreds of MB)
// into a compact, shardable catalog that Cloudflare Workers can serve as static
// assets (hard limits: 25 MiB per file, 20k files per deployment).
//
// Input  (first match wins):
//   ./skills-data/index.json                          (recommended: kept in repo root)
//   ./toolhub-skills-pipeline/work/site/index.json    (raw pipeline output)
// Output:
//   ./public/assets/data/skills/meta.json             (facets + shard manifest)
//   ./public/assets/data/skills/shard-0001.json ...   (compact records)
//
// Design notes
// - Short keys + derived URLs cut ~65% of the payload with zero data loss for
//   the fields the catalog page actually renders.
// - Records are sorted by quality score (desc) so "featured first" search only
//   needs the first shards to return useful results instantly.
// - Descriptions are clipped; the site stores metadata only and always links
//   back to the upstream SKILL.md instead of mirroring its body.
import { readdir, readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { curate, POLICY } from "./repo-policy.mjs";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "assets", "data", "skills");
const DESC_MAX = Number(process.env.SKILLS_DESC_MAX || 240);
const SHARD_TARGET_BYTES = Number(process.env.SKILLS_SHARD_BYTES || 1_500_000);
const HARD_LIMIT_BYTES = 25 * 1024 * 1024; // Cloudflare per-file asset limit

const CANDIDATE_DIRS = [
  process.env.SKILLS_DATA_DIR,
  join(ROOT, "skills-data"),
  join(ROOT, "toolhub-skills-pipeline", "work", "site"),
].filter(Boolean);

function pickSourceDir() {
  for (const dir of CANDIDATE_DIRS) {
    if (existsSync(join(dir, "index.json"))) return dir;
  }
  return null;
}

// --- Mojibake repair -------------------------------------------------------
// Upstream SKILL.md front matter is occasionally UTF-8 bytes that were decoded
// as cp1252/latin-1 ("priorizaci\u00c3\u00b3n", "\u00e2\u20ac\u201d"). We only repair a string
// when the reinterpretation is provably correct:
//   1. every char is <= U+00FF so it can be a byte sequence at all,
//   2. those bytes are valid UTF-8,
//   3. the result differs and contains no U+FFFD or control characters.
// Anything that fails a check is left untouched, so legitimate accented text
// such as "Ma\u00f1ana" or "caf\u00e9" is never rewritten.
const MOJI_HINT = /[\u00c2-\u00c3\u00c5-\u00c6\u00cb\u00ce\u00d0\u00d1\u00d5\u00d8\u00e2-\u00e3][\u0080-\u00bf\u2013\u2014\u2018-\u201d\u20ac\u2020-\u2022\u00a0-\u00ff]/;
// cp1252 maps bytes 0x80-0x9f to these characters; reverse the mapping so
// text mangled through cp1252 (the Windows default) can be turned back into bytes.
const CP1252_REVERSE = new Map([[0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]]);
let mojibakeFixed = 0;

function demojibakeOnce(text) {
  if (!MOJI_HINT.test(text)) return null;
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    const mapped = code > 0xff ? CP1252_REVERSE.get(code) : code;
    if (mapped === undefined) return null; // not a byte-compatible string
    bytes[i] = mapped;
  }
  let decoded;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null; // not valid UTF-8 -> the original text was genuine, keep it
  }
  if (decoded === text || decoded.includes("\uFFFD")) return null;
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(decoded)) return null;
  return decoded;
}

function demojibake(value) {
  let text = String(value == null ? "" : value);
  let repaired = false;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = demojibakeOnce(text);
    if (next == null) break;
    text = next;
    repaired = true;
  }
  if (repaired) mojibakeFixed += 1;
  return text;
}

const clip = (value, max) => {
  const text = demojibake(value).replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "\u2026" : text;
};
const dayOf = (value) => {
  const text = String(value == null ? "" : value);
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
};
const tierOf = (value) => (value === "core" ? "c" : value === "drop" ? "d" : "i");
const safetyOf = (value) =>
  value === "safe" ? "s" : value === "review" || value === "needs-review" ? "r" : value === "risky" || value === "unsafe" || value === "high-risk" ? "x" : "u";

// --- Category inference ----------------------------------------------------
// Ordered rules: the first matching category wins, so a "security test runner"
// lands in 测试与安全 rather than 开发编程. Keywords are matched against
// name + path + description, all lower-cased.
const CATEGORY_RULES = [
  ["security", "\u6d4b\u8bd5\u4e0e\u5b89\u5168", /\b(security|vulnerab|pentest|owasp|audit|compliance|threat|exploit|malware|cve|sast|dast|test|testing|jest|pytest|vitest|playwright|cypress|qa|unit-test|e2e)\b/],
  ["data", "\u6570\u636e\u4e0e AI", /\b(machine-learning|ml|llm|prompt|rag|embedding|vector|dataset|pandas|numpy|analytics|data-analysis|jupyter|model|fine-tun|inference|agent-eval)\b/],
  ["db", "\u6570\u636e\u5e93", /\b(database|sql|postgres|mysql|sqlite|mongodb|redis|supabase|prisma|migration|orm|clickhouse|duckdb)\b/],
  ["devops", "\u8fd0\u7ef4\u4e0e CI/CD", /\b(docker|kubernetes|k8s|terraform|ansible|ci\/cd|pipeline|deploy|deployment|aws|azure|gcp|cloud|infra|infrastructure|monitoring|observability|sre|nginx|serverless)\b/],
  ["docs", "\u6587\u6863\u4e0e\u5199\u4f5c", /\b(documentation|docs|readme|changelog|technical-writing|api-docs|docstring|comment|translate|translation|summary|summariz)\b/],
  ["content", "\u5185\u5bb9\u4e0e\u5a92\u4f53", /\b(video|image|audio|music|podcast|design|figma|canvas|animation|render|thumbnail|photo|art|creative|copywriting|social-media|youtube|tiktok)\b/],
  ["business", "\u5546\u4e1a\u4e0e\u8fd0\u8425", /\b(marketing|seo|sales|crm|invoice|finance|accounting|customer|support|product-management|prd|roadmap|okr|hr|recruit|legal|contract)\b/],
  ["research", "\u7814\u7a76\u4e0e\u5206\u6790", /\b(research|paper|arxiv|literature|survey|competitive|market-research|scrape|scraping|crawler|search|academic)\b/],
  ["web3", "\u533a\u5757\u94fe\u4e0e Web3", /\b(blockchain|web3|solidity|ethereum|smart-contract|defi|nft|crypto|wallet|solana)\b/],
  ["life", "\u751f\u6d3b\u4e0e\u6548\u7387", /\b(calendar|email|note|notion|obsidian|todo|task-management|habit|recipe|travel|fitness|journal|personal)\b/],
  ["dev", "\u5f00\u53d1\u4e0e\u7f16\u7a0b", /\b(code|coding|refactor|debug|git|github|review|typescript|javascript|python|rust|golang|java|react|vue|next|api|backend|frontend|cli|sdk|framework|lint|build)\b/],
];
const CATEGORY_OTHER = ["other", "\u5176\u4ed6"];
const CATEGORY_NAMES = new Map([...CATEGORY_RULES.map(([code, name]) => [code, name]), CATEGORY_OTHER]);

function categoryOf(name, path, description) {
  const haystack = `${name} ${path} ${description}`.toLowerCase().replace(/[_\/]+/g, "-");
  for (const [code, , pattern] of CATEGORY_RULES) {
    if (pattern.test(haystack)) return code;
  }
  return CATEGORY_OTHER[0];
}

// Safety flags are stored as small integers to keep the shards compact; the
// code -> name table travels in meta.json. Codes are assigned in first-seen
// order and the table is emitted with the data, so adding an upstream flag
// later cannot silently shift the meaning of an existing code.
const FLAG_CODES = new Map();
function flagCode(name) {
  if (!FLAG_CODES.has(name)) FLAG_CODES.set(name, FLAG_CODES.size + 1);
  return FLAG_CODES.get(name);
}

/**
 * Compact one raw pipeline record.
 * Keys: n name, o owner, r repo, p path, d description, s stars, u updated day,
 * l license, c license class, q quality 0-100, t tier, f safety, g flag count,
 * h commit sha (lets us derive source + raw SKILL.md URLs), S/M/R explicit URL
 * overrides used only when the derived URL would be wrong.
 */
function compact(raw) {
  const owner = demojibake(raw.owner);
  const repo = demojibake(raw.repo);
  const path = demojibake(raw.path);
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const shaMatch = String(raw.source_url || "").match(/\/tree\/([0-9a-f]{7,40})\//i);
  const sha = shaMatch ? shaMatch[1] : "";
  const out = {
    n: String(raw.name || path.split("/").pop() || ""),
    o: owner,
    r: repo,
    p: path,
    d: clip(raw.description || raw.summary || "", DESC_MAX),
    s: Number(raw.stars || 0),
    u: dayOf(raw.updated_at),
    l: raw.license ? demojibake(raw.license) : "",
    c: String(raw.license_class || "none"),
    q: Math.round(Number(raw.quality_score || 0) * 100),
    t: tierOf(raw.tier),
    f: safetyOf(raw.safety),
  };
  out.k = categoryOf(out.n, path, out.d); // k = category code, see meta.categories
  const flagNames = (Array.isArray(raw.safety_flags) ? raw.safety_flags : [])
    .map((flag) => (typeof flag === "string" ? flag : String(flag && flag.id ? flag.id : "")).trim())
    .filter(Boolean);
  if (flagNames.length) {
    out.g = flagNames.length;
    out.x = flagNames.map(flagCode); // x = safety flag codes, see meta.flags
  }
  // Same skill vendored into many repos; useful signal when judging a copy.
  if (Number(raw.dup_count || 0) > 1) out.w = Number(raw.dup_count);
  if (sha) out.h = sha;
  const derivedSource = sha ? `${repoUrl}/tree/${sha}/${path}` : "";
  const derivedMd = sha ? `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${path}/SKILL.md` : "";
  if (raw.source_url && raw.source_url !== derivedSource) out.S = String(raw.source_url);
  if (raw.skill_md_raw_url && raw.skill_md_raw_url !== derivedMd) out.M = String(raw.skill_md_raw_url);
  if (raw.repo_url && raw.repo_url !== repoUrl) out.R = String(raw.repo_url);
  return out;
}

async function main() {
  const started = Date.now();
  const sourceDir = pickSourceDir();
  if (!sourceDir) {
    console.error("SKILLS CATALOG: no source data found. Looked for index.json in:");
    for (const dir of CANDIDATE_DIRS) console.error("  - " + dir);
    console.error("Skipping catalog build (site will still build; /skills.html shows an empty-state).");
    process.exit(2);
  }
  console.log("SKILLS CATALOG: source =", sourceDir);

  const index = JSON.parse(await readFile(join(sourceDir, "index.json"), "utf8"));
  let pages = Array.isArray(index.pages) ? index.pages : [];
  if (!pages.length) {
    pages = (await readdir(sourceDir)).filter((f) => /^skills-\d+\.json$/.test(f)).sort();
  }

  const rawRows = [];
  let rawBytes = 0;
  for (const page of pages) {
    const file = join(sourceDir, page);
    if (!existsSync(file)) continue;
    rawBytes += (await stat(file)).size;
    const rows = JSON.parse(await readFile(file, "utf8"));
    for (const row of Array.isArray(rows) ? rows : []) {
      if (row && row.tier !== "drop") rawRows.push(row);
    }
  }

  // Curation: quality/activity gate + per-repo cap + duplicate collapse.
  // Nothing is deleted - every record still ships in the shards so the "full
  // library" scope keeps working. Curated records carry v:1 and the site
  // browses them by default. See build/repo-policy.mjs for the measured rules.
  const curation = curate(rawRows, { collapse: true });
  const curatedIds = new Set(curation.records.map((r) => r.id));
  const records = [];
  for (const row of rawRows) {
    const rec = compact(row);
    if (curatedIds.has(row.id)) rec.v = 1; // v = curated (精品库)
    if (row.dup_origin && row.dup_count > 1) rec.O = String(row.dup_origin); // O = origin repo
    records.push(rec);
  }
  console.log(
    `SKILLS CATALOG: curated ${curation.stats.skillsOut.toLocaleString("en-US")} of ` +
      `${curation.stats.skillsIn.toLocaleString("en-US")} from ${curation.stats.reposKept} of ` +
      `${curation.stats.reposIn} repos (dropped ` +
      Object.entries(curation.stats.dropped)
        .filter(([, n]) => n)
        .map(([k, n]) => `${k} ${n.toLocaleString("en-US")}`)
        .join(", ") +
      ")",
  );
  if (!records.length) {
    console.error("SKILLS CATALOG: source contained 0 usable records.");
    process.exit(1);
  }

  // Featured-first ordering: quality, then stars, then name (stable + deterministic).
  records.sort((a, b) => b.q - a.q || b.s - a.s || a.n.localeCompare(b.n));

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const shards = [];
  let buffer = [];
  let bufferBytes = 2;
  const flush = async () => {
    if (!buffer.length) return;
    const name = `shard-${String(shards.length + 1).padStart(4, "0")}.json`;
    const body = JSON.stringify(buffer);
    if (Buffer.byteLength(body) > HARD_LIMIT_BYTES) throw new Error(`${name} exceeds Cloudflare's 25 MiB asset limit`);
    await writeFile(join(OUT_DIR, name), body);
    shards.push({ file: name, count: buffer.length, bytes: Buffer.byteLength(body) });
    buffer = [];
    bufferBytes = 2;
  };
  for (const record of records) {
    const size = Buffer.byteLength(JSON.stringify(record)) + 1;
    if (bufferBytes + size > SHARD_TARGET_BYTES) await flush();
    buffer.push(record);
    bufferBytes += size;
  }
  await flush();

  // Curated rows are spread across every shard, so a curated-only view had to
  // download the whole library (~74.9 MiB). Writing the curated set to its own
  // shards keeps the default scope small; the full library still ships intact.
  const curatedShards = [];
  {
    let curBuffer = [];
    let curBytes = 2;
    const flushCurated = async () => {
      if (!curBuffer.length) return;
      const name = `curated-${String(curatedShards.length + 1).padStart(4, "0")}.json`;
      const body = JSON.stringify(curBuffer);
      if (Buffer.byteLength(body) > HARD_LIMIT_BYTES) throw new Error(`${name} exceeds Cloudflare's 25 MiB asset limit`);
      await writeFile(join(OUT_DIR, name), body);
      curatedShards.push({ file: name, count: curBuffer.length, bytes: Buffer.byteLength(body) });
      curBuffer = [];
      curBytes = 2;
    };
    for (const record of records) {
      if (record.v !== 1) continue;
      const size = Buffer.byteLength(JSON.stringify(record)) + 1;
      if (curBytes + size > SHARD_TARGET_BYTES) await flushCurated();
      curBuffer.push(record);
      curBytes += size;
    }
    await flushCurated();
    const curatedBytes = curatedShards.reduce((sum, s) => sum + s.bytes, 0);
    console.log(
      `SKILLS CATALOG: curated shards ${curatedShards.length} files, ` +
        `${(curatedBytes / 1048576).toFixed(1)} MiB (full library ${shards.length} files)`
    );
  }

  // Facets are precomputed so the page can render filters without downloading data.
  const tally = (list) => {
    const map = new Map();
    for (const key of list) map.set(key, (map.get(key) || 0) + 1);
    return map;
  };
  const owners = [...tally(records.map((r) => r.o))]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 300)
    .map(([name, count]) => ({ name, count }));
  const licenses = [...tally(records.map((r) => r.l || "(未声明)"))]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([name, count]) => ({ name, count }));
  const tiers = tally(records.map((r) => r.t));
  const safety = tally(records.map((r) => r.f));

  // Risk + freshness statistics, computed once here so every page that needs
  // them (catalog, weekly changes, rankings) reads the same numbers.
  const flagCounts = new Map();
  for (const record of records) {
    for (const code of record.x || []) flagCounts.set(code, (flagCounts.get(code) || 0) + 1);
  }
  const flagStats = [...FLAG_CODES.entries()]
    .map(([name, code]) => ({ code, name, count: flagCounts.get(code) || 0 }))
    .sort((a, b) => b.count - a.count);
  const licenseClasses = tally(records.map((r) => r.c));
  const days = records.map((r) => r.u).filter(Boolean).sort();
  const newestDay = days.length ? days[days.length - 1] : "";
  const fresh = (window) => {
    if (!newestDay) return 0;
    const cutoff = new Date(newestDay + "T00:00:00Z");
    cutoff.setUTCDate(cutoff.getUTCDate() - window);
    const iso = cutoff.toISOString().slice(0, 10);
    return records.reduce((sum, r) => sum + (r.u && r.u > iso ? 1 : 0), 0);
  };

  const totalBytes = shards.reduce((sum, s) => sum + s.bytes, 0);
  const meta = {
    version: 2,
    generated_at: new Date().toISOString(),
    source_generated_at: index.generated_at || null,
    count: records.length,
    counts: {
      core: tiers.get("c") || 0,
      index: tiers.get("i") || 0,
      safe: safety.get("s") || 0,
      review: safety.get("r") || 0,
      risky: safety.get("x") || 0,
    },
    desc_max: DESC_MAX,
    featured_count: Math.min(records.length, 20000),
    shard_dir: "/assets/data/skills/",
    shards,
    curated_shards: curatedShards,
    total_bytes: totalBytes,
    largest_shard_bytes: shards.reduce((max, s) => Math.max(max, s.bytes), 0),
    facets: { owners, licenses },
    flags: flagStats,
    categories: [...tally(records.map((r) => r.k))]
      .map(([code, count]) => ({ code, name: CATEGORY_NAMES.get(code) || code, count }))
      .sort((a, b) => b.count - a.count),
    license_classes: {
      permissive: licenseClasses.get("permissive") || 0,
      share_alike: licenseClasses.get("share_alike") || 0,
      none: licenseClasses.get("none") || 0,
      other: licenseClasses.get("other") || 0,
    },
    duplicates: records.filter((r) => (r.w || 0) > 1).length,
    curated: {
      count: curation.stats.skillsOut,
      repos: curation.stats.reposKept,
      repos_total: curation.stats.reposIn,
      clusters: curation.stats.clusters || 0,
      dropped: curation.stats.dropped,
      policy: {
        min_stars: POLICY.MIN_STARS,
        fresh_days: POLICY.FRESH_DAYS,
        famous_stars: POLICY.FAMOUS_STARS,
        max_per_repo: POLICY.MAX_PER_REPO,
      },
    },
    freshness: { last7: fresh(7), last30: fresh(30), newest: newestDay },
    notice: "站内仅保存元数据与外链，不转存 SKILL.md 正文。",
  };
  await writeFile(join(OUT_DIR, "meta.json"), JSON.stringify(meta));

  if (mojibakeFixed) console.log(`SKILLS CATALOG: repaired ${mojibakeFixed} mojibake string(s)`);
  console.log(
    `SKILLS CATALOG: ${flagStats.length} safety flags, ` +
      `${meta.counts.risky.toLocaleString("en-US")} risky, ` +
      `${meta.duplicates.toLocaleString("en-US")} duplicated, ` +
      `${meta.freshness.last7.toLocaleString("en-US")} updated in the last 7 days`
  );
  const mib = (n) => (n / 1024 / 1024).toFixed(1) + " MiB";
  console.log(
    `SKILLS CATALOG: ${records.length.toLocaleString("en-US")} skills -> ${shards.length} shards, ` +
      `${mib(totalBytes)} total (raw input ${mib(rawBytes)}), largest shard ${mib(meta.largest_shard_bytes)}, ` +
      `${((Date.now() - started) / 1000).toFixed(1)}s`
  );
}

main().catch((error) => {
  console.error("SKILLS CATALOG FAILED:", error);
  process.exit(1);
});
