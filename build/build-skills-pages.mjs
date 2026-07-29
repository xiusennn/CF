// build-skills-pages.mjs - pre-render static pages for the top Skills so search
// engines can actually index them. The interactive catalog at /skills.html stays
// exactly as it is; these pages are additive, crawlable entry points.
//
// Layout is inherited from the already generated public/skills.html so the nav,
// footer, CSS and scripts can never drift from the rest of the site.
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const DATA = join(PUB, "assets", "data", "skills");
const OUT = join(PUB, "skills");
const SITE = (process.env.SITE_URL || "https://tool.cnagt.com").replace(/\/$/, "");
// Cloudflare free tier allows 20,000 static assets. Measured frame cost is
// ~280 files, so 8,000 curated detail pages leaves room for an equally sized
// English tree later (8,000 + 8,000 + frame < our 18,000 budget).
const MAX = Number(process.env.SKILLS_PRERENDER || 8000);
const PER_PAGE = 40;
const GH = "https://" + "github.com/";
const RAW = "https://" + "raw.githubusercontent.com/";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const repoUrl = (r) => r.R || GH + r.o + "/" + r.r;
const srcUrl = (r) => r.S || (r.h ? repoUrl(r) + "/tree/" + r.h + "/" + r.p : repoUrl(r));
const mdUrl = (r) => r.M || (r.h ? RAW + r.o + "/" + r.r + "/" + r.h + "/" + r.p + "/SKILL.md" : "");
const TIER = { c: "core - \u8bb8\u53ef\u8bc1\u660e\u786e", i: "index - \u4ec5\u5916\u94fe\u7d22\u5f15" };
const SAFE = { s: "\u672a\u547d\u4e2d\u5b89\u5168\u89c4\u5219", r: "\u9700\u4eba\u5de5\u590d\u6838", x: "\u9ad8\u98ce\u9669", u: "\u672a\u8bc4\u4f30" };

const CTX = "https:" + "//schema.org";

// Plain-language meaning of each upstream safety flag. Anything unknown falls
// back to the raw code so a new upstream flag can never silently disappear.
const FLAG_TEXT = {
  mentions_secrets: ["\u6d89\u53ca\u5bc6\u94a5 / \u51ed\u636e", "SKILL.md \u4e2d\u51fa\u73b0 API Key\u3001token \u7b49\u5b57\u6837\uff0c\u5b89\u88c5\u540e\u53ef\u80fd\u8981\u6c42\u4f60\u63d0\u4f9b\u51ed\u636e\u3002"],
  code_execution: ["\u6267\u884c\u4ee3\u7801", "\u4f1a\u5728\u4f60\u7684\u673a\u5668\u4e0a\u8fd0\u884c\u811a\u672c\u6216\u547d\u4ee4\u3002"],
  privilege_escalation: ["\u63d0\u6743", "\u5305\u542b sudo / \u7ba1\u7406\u5458\u6743\u9650\u76f8\u5173\u64cd\u4f5c\u3002"],
  exfiltration: ["\u6570\u636e\u5916\u53d1", "\u5b58\u5728\u5c06\u672c\u5730\u6570\u636e\u53d1\u9001\u5230\u5916\u90e8\u5730\u5740\u7684\u884c\u4e3a\u3002"],
  file_deletion: ["\u5220\u9664\u6587\u4ef6", "\u4f1a\u5220\u9664\u6216\u8986\u76d6\u672c\u5730\u6587\u4ef6\u3002"],
  remote_pipe_shell: ["\u8fdc\u7a0b\u811a\u672c\u76f4\u63a5\u6267\u884c", "\u7c7b\u4f3c curl | sh \u7684\u5199\u6cd5\uff0c\u4e0b\u8f7d\u5185\u5bb9\u4f1a\u76f4\u63a5\u6267\u884c\u3002"],
  external_executable: ["\u8c03\u7528\u5916\u90e8\u53ef\u6267\u884c\u6587\u4ef6", "\u4f9d\u8d56\u4ed3\u5e93\u5916\u7684\u4e8c\u8fdb\u5236\u7a0b\u5e8f\u3002"],
  exec_permission: ["\u4fee\u6539\u6267\u884c\u6743\u9650", "\u4f1a\u7ed9\u6587\u4ef6\u52a0\u4e0a\u53ef\u6267\u884c\u6743\u9650\u3002"],
  destructive_rm: ["\u9ad8\u5371\u5220\u9664\u547d\u4ee4", "\u5305\u542b rm -rf \u7c7b\u4e0d\u53ef\u9006\u547d\u4ee4\u3002"],
  prompt_injection: ["\u63d0\u793a\u8bcd\u6ce8\u5165\u98ce\u9669", "\u6587\u672c\u4e2d\u542b\u6709\u8bd5\u56fe\u63a5\u7ba1\u6a21\u578b\u884c\u4e3a\u7684\u6307\u4ee4\u3002"],
  powershell_iex: ["PowerShell \u52a8\u6001\u6267\u884c", "\u4f7f\u7528 IEX \u6267\u884c\u52a8\u6001\u62fc\u63a5\u7684\u547d\u4ee4\u3002"],
  obfuscated_eval: ["\u6df7\u6dc6\u540e\u6267\u884c", "\u5b58\u5728\u7f16\u7801 / \u6df7\u6dc6\u540e\u518d eval \u7684\u4ee3\u7801\u3002"],
};
const LICENSE_VERDICT = {
  permissive: ["\u5bbd\u677e\u8bb8\u53ef\u8bc1", "\u901a\u5e38\u53ef\u5546\u7528\uff0c\u4fdd\u7559\u7248\u6743\u58f0\u660e\u5373\u53ef\u3002"],
  share_alike: ["\u4f20\u67d3\u6027\u8bb8\u53ef\u8bc1", "\u884d\u751f\u4f5c\u54c1\u53ef\u80fd\u9700\u8981\u4ee5\u76f8\u540c\u8bb8\u53ef\u8bc1\u5f00\u6e90\u3002"],
  other: ["\u5176\u4ed6\u8bb8\u53ef\u8bc1", "\u6761\u6b3e\u975e\u6807\u51c6\uff0c\u5546\u7528\u524d\u8bf7\u9010\u6761\u9605\u8bfb\u3002"],
  none: ["\u672a\u58f0\u660e\u8bb8\u53ef\u8bc1", "\u9ed8\u8ba4\u4fdd\u7559\u5168\u90e8\u6743\u5229\uff0c\u5546\u7528\u524d\u9700\u8054\u7cfb\u4f5c\u8005\u3002"],
};
let FLAG_NAMES = new Map(); // meta.flags: code -> name

function flagsOf(r) {
  return (r.x || []).map((code) => {
    const name = FLAG_NAMES.get(code) || ("flag-" + code);
    const text = FLAG_TEXT[name];
    return { name, label: text ? text[0] : name, note: text ? text[1] : "\u4e0a\u6e38\u5b89\u5168\u89c4\u5219\u547d\u4e2d\uff0c\u4f7f\u7528\u524d\u8bf7\u9605\u8bfb SKILL.md\u3002" };
  });
}

// A skill's own report: what it touches, whether it can be used commercially,
// and how widely it has been copied.
function safetyReport(r) {
  const flags = flagsOf(r);
  const verdict = LICENSE_VERDICT[r.c] || LICENSE_VERDICT.none;
  const rows = flags.length
    ? flags.map((f) => `<li><strong>${esc(f.label)}</strong><span>${esc(f.note)}</span><code>${esc(f.name)}</code></li>`).join("\n")
    : `<li><strong>\u672a\u547d\u4e2d\u4efb\u4f55\u5b89\u5168\u89c4\u5219</strong><span>\u81ea\u52a8\u626b\u63cf\u672a\u53d1\u73b0\u654f\u611f\u884c\u4e3a\uff0c\u4f46\u4ecd\u5efa\u8bae\u5b89\u88c5\u524d\u901a\u8bfb SKILL.md\u3002</span></li>`;
  const level = r.f === "x" ? ["high", "\u9ad8\u98ce\u9669"] : r.f === "r" ? ["mid", "\u9700\u4eba\u5de5\u590d\u6838"] : ["low", "\u672a\u547d\u4e2d\u89c4\u5219"];
  return `<section class="sk-report sk-report-${level[0]}">
<h2>\u5b89\u5168\u4f53\u68c0\u62a5\u544a</h2>
<p class="sk-report-head"><span class="sk-report-level">${esc(level[1])}</span> \u547d\u4e2d ${flags.length} \u6761\u5b89\u5168\u89c4\u5219\uff0c\u8bb8\u53ef\u8bc1\u5224\u5b9a\uff1a${esc(verdict[0])}\u3002</p>
<ul class="sk-report-list">
${rows}
</ul>
<p class="sk-report-note"><strong>\u8bb8\u53ef\u8bc1</strong>\uff1a${esc(r.l || "\u672a\u58f0\u660e")} \u00b7 ${esc(verdict[1])}${(r.w || 0) > 1 ? ` \u00b7 <strong>\u91cd\u590d\u6536\u5f55</strong>\uff1a\u5168\u7f51\u53d1\u73b0 ${r.w} \u4efd\u51e0\u4e4e\u76f8\u540c\u7684\u526f\u672c\uff0c\u8bf7\u4f18\u5148\u9009\u62e9\u539f\u4ed3\u5e93\u3002` : ""}</p>
<p class="sk-report-note">\u8bc4\u4f30\u57fa\u4e8e\u5bf9\u516c\u5f00 SKILL.md \u7684\u81ea\u52a8\u626b\u63cf\uff0c\u4e0d\u66ff\u4ee3\u4eba\u5de5\u5ba1\u9605\uff0c\u4e5f\u4e0d\u6784\u6210\u6cd5\u5f8b\u5efa\u8bae\u3002</p>
</section>`;
}

function slugOf(r, used) {
  const base = [r.o, r.r, r.p].join("-").toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "skill";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = base + "-" + n++;
  used.add(slug);
  return slug;
}

// Reuse the generated catalog page as the layout template.
function splitTemplate(html) {
  const headEnd = html.indexOf("</head>");
  const mainStart = html.indexOf("<main");
  const mainEnd = html.indexOf("</main>");
  if (headEnd < 0 || mainStart < 0 || mainEnd < 0) throw new Error("skills.html layout not recognised");
  return {
    head: html.slice(0, headEnd),
    afterHead: html.slice(headEnd, mainStart),
    tail: html.slice(mainEnd + "</main>".length),
  };
}

function renderHead(tpl, { title, desc, canonical, schema }) {
  let head = tpl
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace(/\n?<script src="\/assets\/js\/skills-catalog\.js" defer><\/script>/, "")
    .replace(/\n?<link rel="stylesheet" href="\/assets\/css\/skills-catalog\.css">/, '\n<link rel="stylesheet" href="/assets/css/skills-catalog.css">');
  if (schema) head += `\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return head;
}

let NEWEST = "";
let CATEGORY_NAMES = new Map();

// Three grades a human can read at a glance, each backed by a field we really
// have. We deliberately do NOT grade the raw quality score: its p50..p90 are
// all 84, so a letter derived from it would carry no information.
const LICENSE_GRADE = {
  permissive: ["A", "\u5bbd\u677e\u8bb8\u53ef\u8bc1\uff0c\u901a\u5e38\u53ef\u5546\u7528"],
  share_alike: ["B", "\u4f20\u67d3\u6027\u8bb8\u53ef\u8bc1\uff0c\u884d\u751f\u4f5c\u54c1\u9700\u540c\u534f\u8bae\u5f00\u6e90"],
  other: ["C", "\u975e\u6807\u51c6\u8bb8\u53ef\u8bc1\uff0c\u5546\u7528\u524d\u9700\u9010\u6761\u786e\u8ba4"],
  none: ["D", "\u672a\u58f0\u660e\u8bb8\u53ef\u8bc1\uff0c\u9ed8\u8ba4\u4fdd\u7559\u5168\u90e8\u6743\u5229"],
};

function daysBetween(a, b) {
  const ms = new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z");
  return Math.round(ms / 86400000);
}

function maintainGrade(r) {
  if (!r.u || !NEWEST) return ["?", "\u672a\u77e5\u66f4\u65b0\u65f6\u95f4"];
  const days = daysBetween(r.u, NEWEST);
  if (days <= 7) return ["A", "\u6700\u8fd1 7 \u5929\u5185\u66f4\u65b0"];
  if (days <= 30) return ["B", "\u6700\u8fd1 30 \u5929\u5185\u66f4\u65b0"];
  if (days <= 180) return ["C", "\u534a\u5e74\u5185\u66f4\u65b0\u8fc7"];
  return ["D", "\u8d85\u8fc7\u534a\u5e74\u672a\u66f4\u65b0"];
}

function safetyGrade(r) {
  if (r.f === "x") return ["D", "\u547d\u4e2d\u9ad8\u5371\u884c\u4e3a\uff0c\u9700\u9010\u884c\u5ba1\u9605"];
  if (r.f === "r") return ["C", "\u547d\u4e2d\u9700\u590d\u6838\u89c4\u5219"];
  if (r.f === "s") return r.g ? ["B", "\u4ec5\u547d\u4e2d\u63d0\u793a\u7c7b\u89c4\u5219"] : ["A", "\u672a\u547d\u4e2d\u4efb\u4f55\u5b89\u5168\u89c4\u5219"];
  return ["?", "\u672a\u8bc4\u4f30"];
}

function gradeCards(r) {
  const items = [
    ["\u8bb8\u53ef\u8bc1", LICENSE_GRADE[r.c] || LICENSE_GRADE.none],
    ["\u7ef4\u62a4", maintainGrade(r)],
    ["\u5b89\u5168", safetyGrade(r)],
  ];
  return `<ul class="sk-grades">${items
    .map(([axis, [grade, note]]) => `<li class="sk-grade sk-grade-${grade.toLowerCase().replace(/[^a-d]/g, "x")}"><span class="sk-grade-letter">${grade}</span><span class="sk-grade-axis">${esc(axis)}</span><span class="sk-grade-note">${esc(note)}</span></li>`)
    .join("")}</ul>`;
}

// Install commands. Both are plain git/curl so they work with any agent
// (Claude Code, Codex, Cursor) and need no third-party CLI we cannot verify.
function readerBlock(r) {
  const md = mdUrl(r);
  if (!md) return "";
  return `<section class="sk-reader" data-raw="${esc(md)}">
<h2>\u5728\u672c\u9875\u9605\u8bfb SKILL.md</h2>
<p class="sk-reader-note">\u539f\u6587\u5b9e\u65f6\u53d6\u81ea GitHub\uff08\u6309\u63d0\u4ea4\u54c8\u5e0c\u9501\u5b9a\u7684\u7248\u672c\uff09\u3002\u547d\u4e2d\u5b89\u5168\u89c4\u5219\u7684\u884c\u4f1a\u88ab\u6807\u7ea2\uff0c\u5e76\u9644\u4e2d\u6587\u89e3\u91ca\u3002</p>
<button type="button" class="sk-reader-load">\u52a0\u8f7d\u539f\u6587</button>
<div class="sk-reader-status" role="status"></div>
<div class="sk-reader-body" hidden></div>
</section>`;
}

function installBlock(r) {
  const dir = (r.n || "skill").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
  const md = mdUrl(r);
  const rows = [];
  if (md) {
    rows.push([
      "\u53ea\u88c5 SKILL.md\uff08\u6700\u5feb\uff09",
      `mkdir -p ~/.claude/skills/${dir} && curl -fsSL ${md} -o ~/.claude/skills/${dir}/SKILL.md`,
    ]);
  }
  rows.push([
    "\u8fde\u540c\u9644\u4ef6\u4e00\u8d77\u88c5\uff08\u63a8\u8350\uff09",
    `git clone --depth 1 --filter=blob:none --sparse ${repoUrl(r)} /tmp/${dir}-src && git -C /tmp/${dir}-src sparse-checkout set ${r.p} && cp -r /tmp/${dir}-src/${r.p} ~/.claude/skills/${dir}`,
  ]);
  const blocks = rows
    .map(([label, cmd]) => `<div class="sk-cmd"><div class="sk-cmd-head"><span>${esc(label)}</span><button type="button" class="sk-copy" data-copy="${esc(cmd)}">\u590d\u5236</button></div><pre><code>${esc(cmd)}</code></pre></div>`)
    .join("");
  return `<section class="sk-install">
<h2>\u5b89\u88c5\u5230\u4f60\u7684 Agent</h2>
<p class="sk-install-note">\u547d\u4ee4\u9ed8\u8ba4\u88c5\u5230 <code>~/.claude/skills/</code>\uff08Claude Code \u5168\u5c40\u76ee\u5f55\uff09\u3002Codex / Cursor \u7b49\u5176\u4ed6 Agent \u8bf7\u6362\u6210\u5b83\u4eec\u5404\u81ea\u7684 skills \u76ee\u5f55\uff1b\u53ea\u5bf9\u5f53\u524d\u9879\u76ee\u751f\u6548\u65f6\u6539\u6210 <code>.claude/skills/</code>\u3002\u8fd0\u884c\u524d\u8bf7\u5148\u770b\u4e00\u773c\u4e0b\u9762\u7684\u5b89\u5168\u4f53\u68c0\u3002</p>
${blocks}
</section>`;
}

function detailBody(r, url) {
  const badges = [
    TIER[r.t] || "index",
    r.l ? "\u8bb8\u53ef\u8bc1 " + r.l : "\u8bb8\u53ef\u8bc1\u672a\u58f0\u660e",
    SAFE[r.f] || SAFE.u,
    r.s + " Stars",
    r.u ? "\u66f4\u65b0 " + r.u : "",
  ].filter(Boolean).map((b) => `<span class="sk-badge">${esc(b)}</span>`).join("");
  const md = mdUrl(r);
  return `<section class="sk-wrap sk-detail">
<div class="crumbs"><a href="/">\u9996\u9875</a> / <a href="/skills">Skills \u76ee\u5f55</a> / <a href="/skills/">\u7cbe\u9009\u7d22\u5f15</a> / ${esc(r.n)}</div>
<header class="sk-hero"><span class="eyebrow">${esc(r.o)} / ${esc(r.r)}</span>
<h1>${esc(r.n)}</h1>
<p>${esc(r.d || "\u8be5 Skill \u672a\u63d0\u4f9b\u63cf\u8ff0\u3002")}</p>
<div class="sk-badges">${badges}</div>
${gradeCards(r)}</header>
<dl class="sk-facts">
<div><dt>\u4ed3\u5e93</dt><dd><a href="${esc(repoUrl(r))}" rel="nofollow noopener" target="_blank">${esc(r.o)}/${esc(r.r)}</a></dd></div>
<div><dt>\u76ee\u5f55</dt><dd><code>${esc(r.p)}</code></dd></div>
<div><dt>\u8d28\u91cf\u5206</dt><dd>${(r.q / 100).toFixed(2)}</dd></div>
<div><dt>\u5b89\u5168\u89c4\u5219\u547d\u4e2d</dt><dd>${r.g ? r.g + " \u9879\uff0c\u4f7f\u7528\u524d\u8bf7\u9605\u8bfb SKILL.md" : "\u65e0"}</dd></div>
</dl>
<p class="sk-actions"><a class="btn" href="${esc(srcUrl(r))}" rel="nofollow noopener" target="_blank">\u6253\u5f00 Skill \u76ee\u5f55</a>${md ? ` <a class="btn ghost" href="${esc(md)}" rel="nofollow noopener" target="_blank">\u67e5\u770b SKILL.md \u539f\u6587</a>` : ""} <a class="btn ghost" href="/skills?q=${encodeURIComponent(r.n)}">\u5728\u76ee\u5f55\u4e2d\u641c\u7d22</a></p>
${installBlock(r)}
${readerBlock(r)}
${safetyReport(r)}
<p class="sk-note">\u672c\u7ad9\u53ea\u4fdd\u5b58\u5143\u6570\u636e\u4e0e\u5916\u94fe\uff0c\u4e0d\u8f6c\u5b58 SKILL.md \u6b63\u6587\u3002\u5f15\u7528\u6216\u5546\u7528\u524d\u8bf7\u81ea\u884c\u786e\u8ba4\u4e0a\u6e38\u8bb8\u53ef\u8bc1\u4e0e\u6743\u9650\u8fb9\u754c\u3002\u6570\u636e\u5feb\u7167\u6765\u81ea\u516c\u5f00\u4ed3\u5e93\uff0c\u53ef\u80fd\u6ede\u540e\u4e8e\u4e0a\u6e38\u3002</p>
<script src="/assets/js/skills-detail.js" defer></script>
</section>`;
}

function indexBody(rows, page, pages, total) {
  const items = rows.map((x) => `<li class="sk-card"><a class="sk-card-title" href="/skills/${x.slug}">${esc(x.r.n)}</a>
<p class="sk-card-desc">${esc(x.r.d || "")}</p>
<p class="sk-card-meta">${esc(x.r.o)}/${esc(x.r.r)} \u00b7 ${x.r.s} Stars \u00b7 ${esc(TIER[x.r.t] || "index")}${x.r.u ? " \u00b7 \u66f4\u65b0 " + esc(x.r.u) : ""}</p></li>`).join("\n");
  const nav = [];
  if (page > 1) nav.push(`<a href="${page === 2 ? "/skills/" : `/skills/page-${page - 1}`}" rel="prev">\u4e0a\u4e00\u9875</a>`);
  nav.push(`<span>\u7b2c ${page} / ${pages} \u9875</span>`);
  if (page < pages) nav.push(`<a href="/skills/page-${page + 1}" rel="next">\u4e0b\u4e00\u9875</a>`);
  return `<section class="sk-wrap">
<div class="crumbs"><a href="/">\u9996\u9875</a> / <a href="/skills">Skills \u76ee\u5f55</a> / \u7cbe\u9009\u7d22\u5f15</div>
<header class="sk-hero"><span class="eyebrow">STATIC INDEX</span>
<h1>\u7cbe\u9009 Skills \u7d22\u5f15\uff08\u7b2c ${page} \u9875\uff09</h1>
<p>\u6309\u8d28\u91cf\u5206\u6392\u5e8f\u7684\u524d ${total.toLocaleString("en-US")} \u4e2a Skills\uff0c\u6bcf\u4e2a\u90fd\u6709\u53ef\u6536\u5f55\u7684\u72ec\u7acb\u9875\u9762\u3002\u9700\u8981\u5168\u5e93 15.8 \u4e07\u6761\u68c0\u7d22\u65f6\uff0c\u8bf7\u4f7f\u7528 <a href="/skills">Skills \u76ee\u5f55</a>\u3002</p></header>
<ul class="sk-cards">
${items}
</ul>
<nav class="sk-pager" aria-label="\u5206\u9875">${nav.join(" ")}</nav>
</section>`;
}

const RANK_N = 100;
const OWNER_N = 25;

function listBody(crumb, eyebrow, title, intro, rows, slugOf2, extra) {
  const items = rows.map((r, i) => {
    const slug = slugOf2(r);
    const flags = flagsOf(r).map((f) => f.label);
    return `<li class="sk-card"><span class="sk-rank">${i + 1}</span>
<a class="sk-card-title" href="/skills/${slug}">${esc(r.n)}</a>
<p class="sk-card-desc">${esc(r.d || "")}</p>
<p class="sk-card-meta">${esc(r.o)}/${esc(r.r)} \u00b7 ${r.s.toLocaleString("en-US")} Stars \u00b7 ${esc(r.l || "\u672a\u58f0\u660e\u8bb8\u53ef\u8bc1")}${r.u ? " \u00b7 \u66f4\u65b0 " + esc(r.u) : ""}${flags.length ? ' \u00b7 <span class="sk-flagged">' + esc(flags.join("\u3001")) + "</span>" : ""}</p></li>`;
  }).join("\n");
  return `<section class="sk-wrap">
<div class="crumbs">${crumb}</div>
<header class="sk-hero"><span class="eyebrow">${esc(eyebrow)}</span>
<h1>${esc(title)}</h1>
<p>${intro}</p></header>
${extra || ""}
<ol class="sk-cards sk-ranked">
${items}
</ol>
</section>`;
}

function listSchema(title, canonical, rows, slugOf2, site) {
  return {
    "@context": CTX,
    "@type": "CollectionPage",
    name: title,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "ToolHub", url: site + "/" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: rows.length,
      itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.n, url: `${site}/skills/${slugOf2(r)}` })),
    },
  };
}

async function main() {
  const metaPath = join(DATA, "meta.json");
  if (!existsSync(metaPath)) {
    console.log("SKILLS PAGES: no catalog data, skipped (run build:skills first).");
    return;
  }
  const meta = JSON.parse(await readFile(metaPath, "utf8"));
  const template = splitTemplate(await readFile(join(PUB, "skills.html"), "utf8"));

  FLAG_NAMES = new Map((meta.flags || []).map((f) => [f.code, f.name]));
  NEWEST = (meta.freshness && meta.freshness.newest) || "";
  CATEGORY_NAMES = new Map((meta.categories || []).map((c) => [c.code, c.name]));
  const secretsCode = (meta.flags || []).find((f) => f.name === "mentions_secrets");

  // Streaming scan of the whole catalog: detail candidates (quality order, the
  // shards are already sorted), ranking buckets, freshness buckets. Buckets are
  // trimmed after every shard so memory stays flat.
  const keyOf = (r) => r.o + "/" + r.r + "/" + r.p;
  const byStars = (a, b) => b.s - a.s || b.q - a.q || a.n.localeCompare(b.n);
  const byQuality = (a, b) => b.q - a.q || b.s - a.s || a.n.localeCompare(b.n);
  const trim = (arr, cmp, n) => { arr.sort(cmp); if (arr.length > n) arr.length = n; };

  const records = [];
  const topOwners = ((meta.facets && meta.facets.owners) || []).slice(0, 20).map((o) => o.name);
  const ownerBuckets = new Map(topOwners.map((name) => [name, []]));
  const buckets = { stars: [], quality: [], commercial: [], risky: [], secrets: [] };
  const catBuckets = new Map((meta.categories || []).filter((c) => c.code !== "other").map((c) => [c.code, []]));
  const newestDay = (meta.freshness && meta.freshness.newest) || "";
  let cutoff = "";
  if (newestDay) {
    const d = new Date(newestDay + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 7);
    cutoff = d.toISOString().slice(0, 10);
  }
  const fresh = [];
  const dayCounts = new Map();
  let freshTotal = 0;

  for (const shard of meta.shards) {
    const rows = JSON.parse(await readFile(join(DATA, shard.file), "utf8"));
    for (const row of rows) {
      // Prerender only curated records (v:1). Cloudflare's free tier caps
      // static assets at 20,000 files, so pages are spent on the skills that
      // survived the quality gate, cap and dedupe; everything else stays
      // browsable client-side from the shards.
      const curatedOnly = row.v === 1;
      if (curatedOnly && records.length < MAX) records.push(row);
      buckets.stars.push(row);
      buckets.quality.push(row);
      if (row.c === "permissive") buckets.commercial.push(row);
      if (row.f === "x") buckets.risky.push(row);
      if (secretsCode && (row.x || []).includes(secretsCode.code)) buckets.secrets.push(row);
      if (cutoff && row.u && row.u > cutoff) {
        fresh.push(row);
        dayCounts.set(row.u, (dayCounts.get(row.u) || 0) + 1);
        freshTotal += 1;
      }
      const catBucket = catBuckets.get(row.k);
      if (catBucket) catBucket.push(row);
      const bucket = ownerBuckets.get(row.o);
      if (bucket) bucket.push(row);
    }
    trim(buckets.stars, byStars, RANK_N);
    trim(buckets.quality, byQuality, RANK_N);
    trim(buckets.commercial, byStars, RANK_N);
    trim(buckets.risky, byStars, RANK_N);
    trim(buckets.secrets, byStars, RANK_N);
    trim(fresh, byStars, 120);
    for (const bucket of ownerBuckets.values()) trim(bucket, byQuality, OWNER_N);
    for (const bucket of catBuckets.values()) trim(bucket, byStars, RANK_N);
  }

  const RANKS = [
    { slug: "stars", rows: buckets.stars, title: `Star \u6700\u9ad8\u7684 ${buckets.stars.length} \u4e2a Agent Skills`,
      intro: `\u6309\u6240\u5728\u4ed3\u5e93 Star \u6570\u6392\u5e8f\uff0c\u6570\u636e\u53d6\u81ea\u5168\u5e93 ${meta.count.toLocaleString("en-US")} \u6761\u5feb\u7167\u3002` },
    { slug: "quality", rows: buckets.quality, title: "\u8d28\u91cf\u5206\u6700\u9ad8\u7684 Agent Skills",
      intro: "\u8d28\u91cf\u5206\u7efc\u5408\u63cf\u8ff0\u5b8c\u6574\u5ea6\u3001\u4ed3\u5e93\u6d3b\u8dc3\u5ea6\u4e0e\u8bb8\u53ef\u8bc1\u6e05\u6670\u5ea6\u3002" },
    { slug: "commercial", rows: buckets.commercial, title: "\u53ef\u5546\u7528\uff08\u5bbd\u677e\u8bb8\u53ef\u8bc1\uff09Skills \u699c",
      intro: `\u5168\u5e93\u5171 ${(meta.license_classes ? meta.license_classes.permissive : 0).toLocaleString("en-US")} \u6761\u4f7f\u7528 MIT / Apache-2.0 \u7b49\u5bbd\u677e\u8bb8\u53ef\u8bc1\uff0c\u4e0b\u9762\u662f\u5176\u4e2d\u6700\u77e5\u540d\u7684\u4e00\u6279\u3002` },
    { slug: "risky", rows: buckets.risky, title: "\u9ad8\u98ce\u9669 Skills \u89c2\u5bdf\u540d\u5355",
      intro: `\u5168\u5e93\u6709 ${meta.counts.risky.toLocaleString("en-US")} \u6761\u88ab\u5224\u5b9a\u4e3a\u9ad8\u98ce\u9669\uff08\u5982\u8fdc\u7a0b\u811a\u672c\u76f4\u63a5\u6267\u884c\u3001\u9ad8\u5371\u5220\u9664\u3001\u6570\u636e\u5916\u53d1\uff09\uff0c\u5b89\u88c5\u524d\u8bf7\u9010\u884c\u9605\u8bfb\u3002` },
    { slug: "secrets", rows: buckets.secrets, title: "\u4f1a\u7d22\u53d6\u5bc6\u94a5 / \u51ed\u636e\u7684 Skills",
      intro: `${secretsCode ? secretsCode.count.toLocaleString("en-US") : 0} \u6761 Skill \u7684\u6b63\u6587\u4e2d\u51fa\u73b0\u5bc6\u94a5\u3001token \u7b49\u5b57\u6837\uff0c\u6388\u6743\u524d\u8bf7\u786e\u8ba4\u5b83\u8981\u7684\u6743\u9650\u8fb9\u754c\u3002` },
  ].filter((rank) => rank.rows.length);
  const OWNER_RANKS = topOwners
    .map((name) => ({ name, rows: ownerBuckets.get(name) || [] }))
    .filter((owner) => owner.rows.length >= 5);
  const CAT_RANKS = [...catBuckets.entries()]
    .map(([code, rows]) => ({ code, name: CATEGORY_NAMES.get(code) || code, rows, total: ((meta.categories || []).find((c) => c.code === code) || {}).count || rows.length }))
    .filter((cat) => cat.rows.length >= 5)
    .sort((a, b) => b.total - a.total);

  // Every ranked / recently updated record needs its own page to link to.
  const inSet = new Set(records.map(keyOf));
  const extraRows = [
    ...RANKS.flatMap((rank) => rank.rows),
    ...OWNER_RANKS.flatMap((owner) => owner.rows),
    ...CAT_RANKS.flatMap((cat) => cat.rows),
    ...fresh,
  ];
  for (const row of extraRows) {
    if (!inSet.has(keyOf(row))) {
      inSet.add(keyOf(row));
      records.push(row);
    }
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const used = new Set();
  const entries = records.map((r) => ({ r, slug: slugOf(r, used) }));
  const slugByKey = new Map(entries.map((e) => [keyOf(e.r), e.slug]));
  const slugFor = (r) => slugByKey.get(keyOf(r));
  const urls = [];

  for (const entry of entries) {
    /* canonical: extensionless */
    const canonical = `${SITE}/skills/${entry.slug}`;
    const title = `${entry.r.n} - ${entry.r.o}/${entry.r.r} | Skills \u76ee\u5f55`;
    const desc = (entry.r.d || `${entry.r.o}/${entry.r.r} \u4ed3\u5e93\u4e2d\u7684 Agent Skill\u3002`).slice(0, 155);
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: entry.r.n,
      description: entry.r.d || "",
      codeRepository: repoUrl(entry.r),
      url: canonical,
      license: entry.r.l || undefined,
      dateModified: entry.r.u || undefined,
      author: { "@type": "Organization", name: entry.r.o },
      isPartOf: { "@type": "CollectionPage", name: "ToolHub Skills \u76ee\u5f55", url: `${SITE}/skills` },
    };
    const html = `${renderHead(template.head, { title, desc, canonical, schema })}${template.afterHead}<main class="container">\n${detailBody(entry.r, canonical)}\n</main>${template.tail}`;
    await writeFile(join(OUT, `${entry.slug}.html`), html);
    urls.push(canonical);
  }

  // The paginated static index stays at the top MAX by quality; ranking pages
  // may have added extra detail pages beyond that set.
  const indexEntries = entries.slice(0, MAX);
  const pages = Math.max(1, Math.ceil(indexEntries.length / PER_PAGE));
  for (let page = 1; page <= pages; page += 1) {
    const rows = indexEntries.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const file = page === 1 ? "index.html" : `page-${page}.html`;
    const canonical = page === 1 ? `${SITE}/skills/` : `${SITE}/skills/page-${page}`;
    const title = page === 1 ? `\u7cbe\u9009 Skills \u7d22\u5f15 | ToolHub` : `\u7cbe\u9009 Skills \u7d22\u5f15 \u7b2c ${page} \u9875 | ToolHub`;
    const desc = `\u6309\u8d28\u91cf\u5206\u6392\u5e8f\u7684 Agent Skills \u9759\u6001\u7d22\u5f15\uff0c\u5171 ${indexEntries.length} \u6761\uff0c\u6bcf\u6761\u90fd\u6709\u72ec\u7acb\u9875\u9762\u4e0e\u4e0a\u6e38\u94fe\u63a5\u3002`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "ToolHub", url: SITE + "/" },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: rows.length,
        itemListElement: rows.map((x, i) => ({
          "@type": "ListItem",
          position: (page - 1) * PER_PAGE + i + 1,
          name: x.r.n,
          url: `${SITE}/skills/${x.slug}.html`,
        })),
      },
    };
    const html = `${renderHead(template.head, { title, desc, canonical, schema })}${template.afterHead}<main class="container">\n${indexBody(rows, page, pages, indexEntries.length)}\n</main>${template.tail}`;
    await writeFile(join(OUT, file), html);
    urls.push(canonical);
  }

  // ---- ranking / comparison pages ---------------------------------------
  await mkdir(join(OUT, "top"), { recursive: true });
  const CRUMB = '<a href="/">\u9996\u9875</a> / <a href="/skills">Skills \u76ee\u5f55</a> / <a href="/skills/top/">\u699c\u5355</a>';
  const rankLinks = [];

  const writeList = async (file, canonical, title, desc, eyebrow, intro, rows, extra) => {
    const schema = listSchema(title, canonical, rows, slugFor, SITE);
    const body = listBody(CRUMB, eyebrow, title, intro, rows, slugFor, extra);
    const html = `${renderHead(template.head, { title: `${title} | ToolHub`, desc, canonical, schema })}${template.afterHead}<main class="container">\n${body}\n</main>${template.tail}`;
    await writeFile(join(OUT, file), html);
    urls.push(canonical);
  };

  for (const rank of RANKS) {
    const canonical = `${SITE}/skills/top/${rank.slug}`;
    await writeList(join("top", `${rank.slug}.html`), canonical, rank.title, rank.intro.replace(/<[^>]+>/g, "").slice(0, 155), "RANKING", rank.intro, rank.rows);
    rankLinks.push({ href: `/skills/top/${rank.slug}`, title: rank.title, count: rank.rows.length });
  }

  for (const owner of OWNER_RANKS) {
    const safe = owner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "owner";
    const title = `${owner.name} \u7684 Agent Skills\uff08\u8d28\u91cf Top ${owner.rows.length}\uff09`;
    const intro = `${esc(owner.name)} \u5728\u516c\u5f00\u4ed3\u5e93\u4e2d\u5171\u6536\u5f55\u4e86\u5927\u91cf Skills\uff0c\u4e0b\u9762\u662f\u8d28\u91cf\u5206\u6700\u9ad8\u7684 ${owner.rows.length} \u6761\uff0c\u5df2\u6807\u6ce8\u8bb8\u53ef\u8bc1\u4e0e\u5b89\u5168\u89c4\u5219\u547d\u4e2d\u60c5\u51b5\u3002`;
    const canonical = `${SITE}/skills/top/owner-${safe}`;
    await writeList(join("top", `owner-${safe}.html`), canonical, title, intro.replace(/<[^>]+>/g, "").slice(0, 155), "BY OWNER", intro, owner.rows);
    rankLinks.push({ href: `/skills/top/owner-${safe}`, title, count: owner.rows.length });
  }

  // ---- category pages ----------------------------------------------------
  const catLinks = [];
  if (CAT_RANKS.length) {
    await mkdir(join(OUT, "c"), { recursive: true });
    for (const cat of CAT_RANKS) {
      const canonical = `${SITE}/skills/c/${cat.code}`;
      const title = `${cat.name}\u7c7b Agent Skills\uff08\u5171 ${cat.total.toLocaleString("en-US")} \u6761\uff09`;
      const intro = `\u5168\u5e93\u5171 <strong>${cat.total.toLocaleString("en-US")}</strong> \u6761 Skill \u5c5e\u4e8e\u201c${esc(cat.name)}\u201d\uff0c\u5206\u7c7b\u7531\u540d\u79f0\u3001\u8def\u5f84\u4e0e\u63cf\u8ff0\u5173\u952e\u8bcd\u5728\u6784\u5efa\u65f6\u63a8\u5bfc\u3002\u4e0b\u9762\u662f\u5176\u4e2d Star \u6700\u9ad8\u7684 ${cat.rows.length} \u6761\uff0c\u5df2\u6807\u6ce8\u8bb8\u53ef\u8bc1\u4e0e\u5b89\u5168\u89c4\u5219\u547d\u4e2d\u60c5\u51b5\u3002<a href="/skills?cat=${cat.code}">\u5728\u76ee\u5f55\u4e2d\u770b\u5168\u90e8 \u2192</a>`;
      const desc = `${cat.name}\u7c7b Agent Skills \u5171 ${cat.total} \u6761\uff0cStar Top ${cat.rows.length} \u5df2\u9644\u8bb8\u53ef\u8bc1\u4e0e\u5b89\u5168\u8bc4\u7ea7\u3002`;
      await writeList(join("c", `${cat.code}.html`), canonical, title, desc, "CATEGORY", intro, cat.rows);
      catLinks.push({ href: `/skills/c/${cat.code}`, title: cat.name, count: cat.total });
    }
    console.log(`SKILLS PAGES: ${catLinks.length} category pages`);
  }

  // ---- library-wide risk report ------------------------------------------
  {
    const canonical = `${SITE}/skills/report`;
    const total = meta.count;
    const pct = (n) => ((n / total) * 100).toFixed(1) + "%";
    const flagRows = (meta.flags || [])
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((f) => `<tr><td>${esc(FLAG_TEXT[f.name] ? FLAG_TEXT[f.name][0] : f.name)}</td><td>${esc(FLAG_TEXT[f.name] ? FLAG_TEXT[f.name][1] : "")}</td><td>${f.count.toLocaleString("en-US")}</td><td>${pct(f.count)}</td></tr>`)
      .join("");
    const licRows = Object.entries(meta.license_classes || {})
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => `<tr><td>${esc((LICENSE_VERDICT[code] || LICENSE_VERDICT.none)[0])}</td><td>${esc((LICENSE_VERDICT[code] || LICENSE_VERDICT.none)[1])}</td><td>${count.toLocaleString("en-US")}</td><td>${pct(count)}</td></tr>`)
      .join("");
    const catRows = (meta.categories || [])
      .map((c) => `<tr><td>${c.code === "other" ? esc(c.name) : `<a href="/skills/c/${c.code}">${esc(c.name)}</a>`}</td><td></td><td>${c.count.toLocaleString("en-US")}</td><td>${pct(c.count)}</td></tr>`)
      .join("");
    const flagged = total - meta.counts.safe;
    const extra = `<div class="sk-report-grid">
<p class="sk-stat"><strong>${pct(flagged)}</strong><span>\u81f3\u5c11\u547d\u4e2d\u4e00\u6761\u5b89\u5168\u89c4\u5219\uff08${flagged.toLocaleString("en-US")} \u6761\uff09</span></p>
<p class="sk-stat"><strong>${pct(meta.counts.risky)}</strong><span>\u9ad8\u98ce\u9669\uff08${meta.counts.risky.toLocaleString("en-US")} \u6761\uff09</span></p>
<p class="sk-stat"><strong>${pct((meta.license_classes || {}).none || 0)}</strong><span>\u672a\u58f0\u660e\u8bb8\u53ef\u8bc1\uff0c\u9ed8\u8ba4\u4e0d\u53ef\u5546\u7528</span></p>
<p class="sk-stat"><strong>${pct(meta.duplicates || 0)}</strong><span>\u5b58\u5728\u51e0\u4e4e\u5b8c\u5168\u76f8\u540c\u7684\u526f\u672c</span></p>
</div>
<h2>\u5b89\u5168\u89c4\u5219\u547d\u4e2d\u5206\u5e03</h2>
<table class="sk-report-table"><thead><tr><th>\u89c4\u5219</th><th>\u542b\u4e49</th><th>\u6570\u91cf</th><th>\u5360\u6bd4</th></tr></thead><tbody>${flagRows}</tbody></table>
<h2>\u8bb8\u53ef\u8bc1\u5206\u5e03</h2>
<table class="sk-report-table"><thead><tr><th>\u7ed3\u8bba</th><th>\u8bf4\u660e</th><th>\u6570\u91cf</th><th>\u5360\u6bd4</th></tr></thead><tbody>${licRows}</tbody></table>
<h2>\u5206\u7c7b\u5206\u5e03</h2>
<table class="sk-report-table"><thead><tr><th>\u5206\u7c7b</th><th></th><th>\u6570\u91cf</th><th>\u5360\u6bd4</th></tr></thead><tbody>${catRows}</tbody></table>
<h2>\u9ad8\u98ce\u9669\u6837\u672c</h2>`;
    const intro = `\u5bf9\u5168\u5e93 <strong>${total.toLocaleString("en-US")}</strong> \u6761 Agent Skills \u9010\u6761\u626b\u63cf\u540e\u7684\u7edf\u8ba1\uff08\u5feb\u7167 ${esc((meta.source_generated_at || "").slice(0, 10))}\uff09\uff1a<strong>${pct(flagged)}</strong> \u81f3\u5c11\u547d\u4e2d\u4e00\u6761\u5b89\u5168\u89c4\u5219\uff0c<strong>${pct((meta.license_classes || {}).none || 0)}</strong> \u6ca1\u6709\u58f0\u660e\u8bb8\u53ef\u8bc1\u3002\u6570\u636e\u53ef\u5f15\u7528\uff0c\u8bf7\u6ce8\u660e\u5feb\u7167\u65e5\u671f\u3002`;
    await writeList("report.html", canonical, "\u5168\u5e93 Agent Skills \u5b89\u5168\u4e0e\u8bb8\u53ef\u8bc1\u4f53\u68c0\u62a5\u544a", `\u5168\u5e93 ${total} \u6761 Agent Skills \u7684\u5b89\u5168\u89c4\u5219\u547d\u4e2d\u3001\u8bb8\u53ef\u8bc1\u4e0e\u91cd\u590d\u60c5\u51b5\u7edf\u8ba1\u3002`, "LIBRARY REPORT", intro, buckets.risky.slice(0, 20), extra);
  }

  // ---- ranking hub -------------------------------------------------------
  {
    const canonical = `${SITE}/skills/top/`;
    const title = "Agent Skills \u699c\u5355\u4e0e\u5bf9\u6bd4";
    const catGroups = catLinks.map((link) => `<li class="sk-card"><a class="sk-card-title" href="${link.href}">${esc(link.title)}</a><p class="sk-card-meta">${link.count.toLocaleString("en-US")} \u6761</p></li>`).join("\n");
    const groups = rankLinks.map((link) => `<li class="sk-card"><a class="sk-card-title" href="${link.href}">${esc(link.title)}</a><p class="sk-card-meta">${link.count} \u6761</p></li>`).join("\n");
    const body = `<section class="sk-wrap">
<div class="crumbs"><a href="/">\u9996\u9875</a> / <a href="/skills">Skills \u76ee\u5f55</a> / \u699c\u5355</div>
<header class="sk-hero"><span class="eyebrow">RANKINGS</span>
<h1>${title}</h1>
<p>\u57fa\u4e8e ${meta.count.toLocaleString("en-US")} \u6761 Agent Skills \u5feb\u7167\uff08${esc(meta.source_generated_at || "").slice(0, 10)}\uff09\u751f\u6210\u7684\u699c\u5355\uff1aStar\u3001\u8d28\u91cf\u5206\u3001\u53ef\u5546\u7528\u8bb8\u53ef\u8bc1\u3001\u9ad8\u98ce\u9669\u540d\u5355\uff0c\u4ee5\u53ca\u4e3b\u8981\u4f5c\u8005\u7684\u4ee3\u8868\u4f5c\u3002<a href="/skills/updates">\u672c\u5468\u53d8\u66f4 \u2192</a></p></header>
<ul class="sk-cards">
${groups}
</ul>
<h2>\u6309\u5206\u7c7b\u6d4f\u89c8</h2>
<ul class="sk-cards">
${catGroups}
</ul>
<p class="sk-actions"><a class="btn" href="/skills/report">\u770b\u5168\u5e93\u5b89\u5168\u4f53\u68c0\u62a5\u544a</a> <a class="btn ghost" href="/skills/updates">\u672c\u5468\u53d8\u66f4</a></p>
</section>`;
    const schema = { "@context": CTX, "@type": "CollectionPage", name: title, url: canonical };
    const html = `${renderHead(template.head, { title: `${title} | ToolHub`, desc: "\u6309 Star\u3001\u8d28\u91cf\u5206\u3001\u8bb8\u53ef\u8bc1\u4e0e\u5b89\u5168\u98ce\u9669\u6392\u5e8f\u7684 Agent Skills \u699c\u5355\u3002", canonical, schema })}${template.afterHead}<main class="container">\n${body}\n</main>${template.tail}`;
    await writeFile(join(OUT, "top", "index.html"), html);
    urls.push(canonical);
  }

  // ---- weekly change feed (page + RSS) -----------------------------------
  const feedItems = fresh.slice(0, 60);
  if (feedItems.length) {
    const days = [...dayCounts.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const table = `<table class="sk-changes"><thead><tr><th>\u65e5\u671f</th><th>\u53d1\u751f\u53d8\u66f4\u7684 Skills</th></tr></thead><tbody>${days
      .map(([day, count]) => `<tr><td>${esc(day)}</td><td>${count.toLocaleString("en-US")}</td></tr>`)
      .join("")}</tbody></table>`;
    const canonical = `${SITE}/skills/updates`;
    const title = "\u672c\u5468 Agent Skills \u53d8\u66f4";
    const intro = `\u6700\u8fd1 7 \u5929\uff08\u622a\u6b62 ${esc(newestDay)}\uff09\u5171\u6709 <strong>${freshTotal.toLocaleString("en-US")}</strong> \u4e2a Skills \u53d1\u751f\u66f4\u65b0\uff0c\u5168\u5e93\u5171 ${meta.count.toLocaleString("en-US")} \u6761\u3002\u4e0b\u9762\u662f\u5176\u4e2d\u5f71\u54cd\u9762\u6700\u5927\u7684 ${feedItems.length} \u4e2a\u3002<a href="/skills/updates.xml">\u8ba2\u9605 RSS</a>`;
    await writeList("updates.html", canonical, title, `\u6700\u8fd1 7 \u5929\u5171 ${freshTotal} \u4e2a Agent Skills \u66f4\u65b0\uff0c\u6309\u5f71\u54cd\u529b\u6392\u5e8f\uff0c\u9644\u8bb8\u53ef\u8bc1\u4e0e\u5b89\u5168\u89c4\u5219\u6807\u6ce8\u3002`, "WEEKLY CHANGES", intro, feedItems, table);

    const rssItems = feedItems.slice(0, 50).map((r) => {
      const link = `${SITE}/skills/${slugFor(r)}`;
      const flags = flagsOf(r).map((f) => f.label).join("\u3001");
      const summary = `${r.o}/${r.r} \u00b7 ${r.s} Stars \u00b7 ${r.l || "\u672a\u58f0\u660e\u8bb8\u53ef\u8bc1"}${flags ? " \u00b7 " + flags : ""}\n${r.d || ""}`;
      return `<item><title>${esc(r.n)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${new Date(r.u + "T00:00:00Z").toUTCString()}</pubDate><description>${esc(summary)}</description></item>`;
    }).join("\n");
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>ToolHub \u00b7 Agent Skills \u53d8\u66f4</title>
<link>${SITE}/skills/updates</link>
<description>\u6bcf\u5468\u66f4\u65b0\u7684 Agent Skills \u53d8\u66f4\u6d41\uff1a\u65b0\u589e\u3001\u66f4\u65b0\u4e0e\u9ad8\u98ce\u9669\u63d0\u9192\u3002</description>
<language>zh-CN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
</channel></rss>`;
    await writeFile(join(OUT, "updates.xml"), rss);
    console.log(`SKILLS PAGES: weekly feed lists ${feedItems.length} of ${freshTotal} updates in the last 7 days`);
  }

  await writeFile(join(OUT, "urls.json"), JSON.stringify(urls, null, 0));

  // Merge the new URLs into the sitemap build.mjs just wrote. Idempotent:
  // previously injected skill URLs are dropped before the fresh ones go in.
  const sitemapPath = join(PUB, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const xml = await readFile(sitemapPath, "utf8");
    const kept = xml
      .split("\n")
      .filter((line) => !line.includes("<loc>" + SITE + "/skills/"))
      .join("\n");
    const block = urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n");
    await writeFile(sitemapPath, kept.replace("</urlset>", `${block}\n</urlset>`));
    console.log(`SKILLS PAGES: sitemap now lists ${(kept.match(/<loc>/g) || []).length + urls.length} URLs`);
  }
  console.log(`SKILLS PAGES: ${rankLinks.length + 1} ranking pages (incl. hub)`);
  console.log(`SKILLS PAGES: ${entries.length} detail pages + ${pages} index pages (of ${meta.count.toLocaleString("en-US")} total skills)`);
}

main().catch((error) => {
  console.error("SKILLS PAGES failed:", error);
  process.exit(1);
});
