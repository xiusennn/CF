// build.mjs — generates static HTML (homepage + one page per tool) from tools.config.mjs.
// Static-first: pre-rendered HTML served by the Worker's ASSETS binding = free & unlimited.
import { CATEGORIES, TOOLS } from "./tools.config.mjs";
import { AI_TOOLS, APIS, PROMPTS, AI_MODELS } from "../public/assets/js/data.js";
import { AI_CATALOG } from "../public/assets/js/catalog.js";
import { FREE_LLM_PROVIDERS } from "../public/assets/js/freeapi.js";
import { SKILL_REGISTRY } from "../public/assets/js/skills-registry.js";
import { USE_CASES, WORKFLOWS, LEARNING, EDITOR_PICKS } from "./content.config.mjs";
import { mkdir, writeFile, rm, readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dirname, "..", "public");
const SITE = (process.env.SITE_URL || "https://tool.cnagt.com").replace(/\/$/, "");
const BRAND = "ToolHub";
const CONTACT_EMAIL = (process.env.CONTACT_EMAIL || "admin@cnagt.com").trim();
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Per-category presentation meta (short description + accent colour) for the
// category-first homepage. Accent hues are muted and dark-mode friendly.
const CAT_META = {
  text:    { desc: "Count, clean, transform and compare text.",       accent: "#5E9FE8" },
  dev:     { desc: "Format, encode, hash and debug like a pro.",       accent: "#72BC8F" },
  ai:      { desc: "Prompts, tokens, model costs and an AI tool hub.", accent: "#A78BFA" },
  convert: { desc: "Convert units, numbers, dates and bases.",         accent: "#EAC26B" },
  image:   { desc: "Compress, resize and convert images in-browser.",  accent: "#DF84A8" },
  color:   { desc: "Palettes, gradients, contrast and CSS helpers.",   accent: "#4FB9C9" },
  seo:     { desc: "UTM links, meta tags, slugs and robots.txt.",      accent: "#DE9255" },
  calc:    { desc: "Finance, health, pricing and everyday math.",      accent: "#E97366" },
};
const accentOf = (id) => (CAT_META[id] && CAT_META[id].accent) || "#7c6cff";
const descOf = (id) => (CAT_META[id] && CAT_META[id].desc) || "";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Cloudflare Workers static assets answer "/x.html" with a 307 redirect to
// "/x", so the extensionless form is the only URL that returns 200. Canonical
// tags, og:url and the sitemap must therefore use that form.
function canon(u) {
  return String(u)
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "");
}

// Same rule for in-page navigation: link straight to the 200 URL instead of
// sending every visitor and crawler through a redirect hop.
function canonLinks(html) {
  return html.replace(
    /(href|src)="(\/[^"?#]*?)\.html([?#][^"]*)?"/g,
    (m, attr, path, tail) => `${attr}="${path === "/index" ? "/" : path}${tail || ""}"`
  );
}

function head(title, desc, canonical, language="zh-CN", robots="index,follow", schema="") {
  return `<!doctype html>
<html lang="${language}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canon(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canon(canonical)}">
<meta property="og:site_name" content="ToolHub">
<meta property="og:locale" content="zh_CN">
<meta property="og:image" content="${SITE}/assets/brand/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ToolHub — 本地优先的 AI 工具与 Skills 目录">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/assets/brand/og-default.png">
<meta name="theme-color" content="#f7f9fc">
<link rel="icon" type="image/svg+xml" href="/assets/brand/toolhub-mark.svg">
<link rel="apple-touch-icon" href="/assets/brand/toolhub-mark.svg">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="manifest" href="/manifest.webmanifest">
${schema ? `<script type="application/ld+json">${schema}</script>` : ""}
</head>`;
}

function navBar() {
  return `<header class="nav"><div class="container nav-inner">
<a class="logo" href="/"><img class="logo-mark" src="/assets/brand/toolhub-mark.svg" alt="ToolHub"><span class="logo-name">Tool<span>Hub</span></span></a>
<nav class="nav-links"><a href="/start.html">任务规划</a><a href="/tools.html">工具</a><a href="/discover.html">资源库</a><a href="/workflows.html">工作流</a><a href="/workspace-content.html">工作台</a><a href="/learn.html">学习</a><a href="/tools/ai-tools-directory.html">AI 工具</a><a href="/tools/ai-ecosystem-directory.html">AI 生态</a><a href="/skills.html">Skills 目录</a><a href="/pitfalls.html">避坑指南</a></nav>
<div class="nav-spacer"></div>
<button class="kbtn" data-cmdk-open type="button" aria-label="搜索全部资源"><span class="kbtn-ico" aria-hidden="true">${ICON.search}</span><span class="kbtn-txt">搜索</span><kbd>Ctrl K</kbd></button>
<button class="icon-btn" id="theme-btn" title="切换主题" type="button" aria-label="切换主题"><span class="theme-ico theme-ico-moon">${ICON.moon}</span><span class="theme-ico theme-ico-sun">${ICON.sun}</span></button>
</div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="container">
<div class="foot-brand"><div class="logo"><img class="logo-mark" src="/assets/brand/toolhub-mark.svg" alt="ToolHub"><span class="logo-name">Tool<span>Hub</span></span></div>
<p class="foot-tag">免费、快速、隐私优先的实用工具，全部在浏览器本地运行，文件不会离开你的设备。</p></div>
<nav class="fcols" aria-label="工具分类">
${CATEGORIES.map((c)=>{const items=TOOLS.filter(t=>t.cat===c.id); return `<a class="foot-category" href="/tools.html#${c.id}"><span class="foot-category-icon" aria-hidden="true">${c.emoji}</span><span><b>${esc(c.name)}</b><small>${items.length} 个本地工具 · 查看分类 →</small></span></a>`}).join("")}
</nav>
<div class="disc"><a href="/skills.html">Skills 目录</a> · <a href="/discover.html">资源库</a> · <a href="/workflows.html">工作流</a> · <a href="/learn.html">学习</a> · <a href="/compare.html">对比</a> · <a href="/pitfalls.html">避坑指南</a> · <a href="/about.html">关于</a> · <a href="/privacy.html">隐私说明</a> · <a href="/terms.html">使用条款</a> · <a href="/data-policy.html">数据与收录政策</a> · <a href="/status.html">服务状态</a> · <a href="/contact.html">联系与反馈</a> · 所有本地工具均在浏览器处理；外部资源会在跳转前明确标注。© ${new Date().getFullYear()} ${BRAND}。</div>
</div></footer>
<script type="module" src="/assets/js/palette.js"></script>
<script src="/assets/js/sw-register.js"></script>`;
}

const SVGA = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  search:`<svg ${SVGA}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  ai:`<svg ${SVGA}><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4.5M8 3.5h8"/><path d="M9 13.5v1.5M15 13.5v1.5"/></svg>`,
  eco:`<svg ${SVGA}><path d="m12 3 8.5 4.7L12 12.4 3.5 7.7 12 3Z"/><path d="m3.5 12 8.5 4.7 8.5-4.7M3.5 16.3 12 21l8.5-4.7"/></svg>`,
  api:`<svg ${SVGA}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/></svg>`,
  prompt:`<svg ${SVGA}><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z"/></svg>`,
  token:`<svg ${SVGA}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>`,
  cost:`<svg ${SVGA}><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M14.5 9.3c0-1.2-1.1-2-2.5-2s-2.5.8-2.5 2 1.1 1.6 2.5 1.9 2.5.7 2.5 1.9-1.1 2-2.5 2-2.5-.8-2.5-2"/></svg>`,
  arrow:`<svg ${SVGA}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  toolbox:`<svg ${SVGA}><path d="M14.6 5.6a4 4 0 0 0-5.3 5L3 16.9 6.1 20l6.3-6.3a4 4 0 0 0 5-5.3l-2.5 2.5-2.4-.6-.6-2.4 2.3-2.3Z"/></svg>`,
  spark:`<svg ${SVGA}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/></svg>`,
  sun:`<svg ${SVGA}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  moon:`<svg ${SVGA}><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"/></svg>`,
};
const CAT_ICON = {
  text:`<svg ${SVGA}><path d="M4 6h16M4 12h16M4 18h11"/></svg>`,
  dev:`<svg ${SVGA}><path d="m8 8-4 4 4 4M16 8l4 4-4 4"/></svg>`,
  ai:ICON.ai,
  convert:`<svg ${SVGA}><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>`,
  image:`<svg ${SVGA}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3 17 5-4 4 3 3-2 6 4"/></svg>`,
  color:`<svg ${SVGA}><circle cx="12" cy="12" r="9"/><circle cx="8.8" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.2" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="9.4" cy="15" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  seo:`<svg ${SVGA}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M9 11h4M11 9v4"/></svg>`,
  calc:`<svg ${SVGA}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18h3.5"/></svg>`,
};
const catIcon = (id)=>CAT_ICON[id]||ICON.toolbox;

function homepage(stats) {
  // Live numbers straight from the catalog build; if the catalog has not been
  // built the homepage falls back to copy without numbers instead of lying.
  const nf = (n) => Number(n || 0).toLocaleString("en-US");
  const S = stats && stats.count
    ? {
        count: stats.count,
        risky: (stats.counts && stats.counts.risky) || 0,
        review: (stats.counts && stats.counts.review) || 0,
        permissive: (stats.license_classes && stats.license_classes.permissive) || 0,
        last7: (stats.freshness && stats.freshness.last7) || 0,
        duplicates: stats.duplicates || 0,
        day: String(stats.source_generated_at || "").slice(0, 10),
        categories: Array.isArray(stats.categories) ? stats.categories : [],
      }
    : null;
  const tracks = [
    { id: "content", icon: "✍", title: "用 AI 做内容", text: "从选题、提示词到发布检查，完成一条可复用的内容生产流程。", href: "/workspace-content.html", tools: ["prompt-builder", "word-counter", "meta-tag-generator"] },
    { id: "dev", icon: "⌘", title: "用 AI 做产品与开发", text: "把想法拆成需求、提示词、调试步骤和上线前检查。", href: "/workspace-dev.html", tools: ["prompt-library", "json-repair", "fake-data"] },
    { id: "skills", icon: "◌", title: "找可信的 AI 工具与 Skills", text: "按任务、来源、许可证和权限边界，做出更稳妥的选择。", href: "/workspace-skills.html", tools: ["skills-registry", "ai-ecosystem-directory", "ai-tools-directory"] },
  ];
  const cards = tracks.map((track) => {
    const links = track.tools.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean)
      .map((tool) => `<a href="/tools/${tool.id}.html">${esc(tool.name)} <span>→</span></a>`).join("");
    return `<article class="journey-card journey-${track.id}"><div class="journey-icon">${track.icon}</div><span class="journey-kicker">结果型工作台</span><h2>${track.title}</h2><p>${track.text}</p><div class="journey-tools">${links}</div><a class="journey-cta" href="${track.href}">进入工作台 <span>→</span></a></article>`;
  }).join("");
  const schema = JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", name: BRAND, url: SITE, inLanguage: "zh-CN", description: "本地优先的 AI 工作流与实用工具网站。" },
    { "@type": "Organization", name: BRAND, url: SITE }
  ] });
  return `${head(`${BRAND} — 把 AI 想法变成可执行工作流`, "面向中文用户的本地优先 AI 工作台：内容发布、开发调试、工具与 Agent Skills 决策。", SITE + "/", "zh-CN", "index,follow", schema)}
<body class="product-home">
${navBar()}
<main>
  <section class="product-hero container">
    <span class="product-kicker">${S ? nf(S.count) + " 条 AGENT SKILLS / " + nf(S.risky) + " 条高风险 / " + esc(S.day) + " 快照" : "TOOLHUB / 本地优先 / 可追溯"}</span>
    <h1>全网 Agent Skills，<br><em>安装前先查一下。</em></h1>
    <p>${S ? nf(S.count) + " 个公开仓库里的 Agent Skill，已逐条标注许可证、安全规则命中与重复副本。" : "按任务、来源、许可证和权限边界选择 Agent Skills。"}搜一下它要什么权限、能不能商用，再决定装不装。</p>
    <form class="hero-search" action="/skills" method="get" role="search">
      <input type="search" name="q" placeholder="搜索 Skill 名称、仓库或用途，例如 pdf" aria-label="搜索 Agent Skills" autocomplete="off">
      <button class="btn primary" type="submit">搜索 ${S ? nf(S.count) : ""} 条 Skills</button>
    </form>
    <p class="hero-examples">试试：<a href="/skills?q=pdf">pdf</a><a href="/skills?q=slack">slack</a><a href="/skills?q=code%20review">code review</a><a href="/skills/top/risky">高风险名单</a></p>
    ${S && S.categories.length ? `<p class="hero-cats">按分类浏览：${S.categories.filter((c) => c.code !== "other").slice(0, 6).map((c) => `<a href="/skills/c/${c.code}">${c.name} <b>${nf(c.count)}</b></a>`).join("")}<a class="hero-cats-report" href="/skills/report">全库安全体检报告 →</a></p>` : ""}
    <div class="product-proof"><span><b>${S ? nf(S.permissive) : "许可证"}</b>条使用宽松许可证（通常可商用）</span><span><b>${S ? nf(S.risky) : "风险"}</b>条命中高风险行为，已单独标出</span><span><b>${S ? nf(S.last7) : "变更"}</b>条在最近 7 天内发生变更</span></div>
  </section>
  <section class="journeys container" aria-labelledby="journey-title">
    <div class="journey-heading"><div><span class="eyebrow">选择你的任务</span><h2 id="journey-title">三条从需求到结果的路径</h2></div><p>先选择要完成的事，再使用恰当的工具。不是再多一个目录。</p></div>
    <div class="journey-grid">${cards}</div>
  </section>
  <section class="home-skills container" aria-labelledby="skills-title">
    <div class="journey-heading"><div><span class="eyebrow">别处查不到的部分</span><h2 id="skills-title">不只告诉你有哪些 Skill，还告诉你能不能用</h2></div><a class="text-link" href="/skills/top/">查看全部榜单 →</a></div>
    <div class="skills-grid">
      <a class="skills-card" href="/skills/top/risky"><b>安全体检</b><p>每条 Skill 都标出它是否执行命令、索取密钥、删除文件或向外发送数据，并给出中文解释。</p><span>${S ? nf(S.risky) + " 条高风险、" + nf(S.review) + " 条需人工复核" : "查看高风险名单"} →</span></a>
      <a class="skills-card" href="/skills/updates"><b>本周变更</b><p>每周重新扫描一次全库，告诉你哪些 Skill 刚更新、哪些新增了风险行为，支持 RSS 订阅。</p><span>${S ? nf(S.last7) + " 条最近 7 天发生变更" : "查看本周变更"} →</span></a>
      <a class="skills-card" href="/skills/top/commercial"><b>许可证与重复副本</b><p>宽松 / 传染性 / 未声明许可证逐条分类，并标出同一份 Skill 被多少个仓库拷贝过。</p><span>${S ? nf(S.permissive) + " 条可商用、" + nf(S.duplicates) + " 条存在副本" : "查看可商用榜单"} →</span></a>
    </div>
  </section>
  <section class="home-local container" aria-labelledby="local-title">
    <div class="journey-heading"><div><span class="eyebrow">你的本地工作区</span><h2 id="local-title">最近使用与已保存项目</h2></div><a class="text-link" href="/workspace.html">打开工作区 →</a></div>
    <div class="local-grid"><div class="local-panel"><h3>最近使用的工具</h3><div id="recent-tools" class="local-list"><p class="local-empty">还没有记录。打开一个工具后会显示在这里。</p></div></div><div class="local-panel"><h3>已保存的工作流</h3><div id="saved-projects" class="local-list"><p class="local-empty">在任一工作台保存项目后，会仅保存在这台设备。</p></div></div></div>
  </section>
  <section class="trust-strip"><div class="container trust-grid"><div><span>01</span><b>先看任务匹配</b><p>不因热门榜单就推荐一个工具。</p></div><div><span>02</span><b>再看数据与权限</b><p>安装 Skill 前先确认联网、文件和密钥边界。</p></div><div><span>03</span><b>最后核算成本</b><p>免费额度用于验证，不把它当生产依赖。</p></div><a href="/pitfalls.html">查看 AI 避坑指南 →</a></div></section>
</main>
${footer()}
<script src="/assets/js/app.js"></script>
<script type="module" src="/assets/js/workbench.js"></script>
</body></html>`;
}

function workbenchPage(mode) {
  const data = {
    content: {
      label: "内容发布工作台", title: "从想法到可发布内容。", desc: "把选题、受众、提示词、发布检查组织成一份可本地保存的项目。", goal: "例如：为一个面向独立开发者的 AI 工具写一篇小红书图文", steps: [["明确结果", "写清平台、受众、行动目标和不能碰的表达。"], ["生成结构", "用提示词生成器建立提纲，再人工确认观点和来源。"], ["完成发布检查", "检查标题、字数、Meta、UTM 和最终 CTA。"]], tools: ["prompt-builder", "word-counter", "meta-tag-generator", "utm-builder"]
    },
    dev: {
      label: "开发调试工作台", title: "从产品想法到可验证原型。", desc: "先写清需求和验收标准，再把 JSON、接口、测试数据和发布检查串起来。", goal: "例如：做一个帮助销售团队整理客户跟进记录的轻量 Web 应用", steps: [["拆解需求", "明确用户、输入、输出、边界、错误情况和验收标准。"], ["实现与调试", "用 AI 编程工具生成方案，使用 JSON、URL、JWT 和正则工具验证输入。"], ["发布前验证", "生成测试数据，核对接口返回与上线说明。"]], tools: ["prompt-library", "json-repair", "fake-data", "regex-tester", "free-api-directory"]
    },
    skills: {
      label: "Skills 决策工作台", title: "先判断，再安装 Agent Skills。", desc: "建立你的任务清单，记录候选 Skill 的来源、许可证、权限和验证结论。", goal: "例如：为竞品研究任务选择可安装的 Agent Skills", steps: [["定义任务", "先描述需要的输出，不从“热门 Skill”开始。"], ["核验来源与许可证", "优先官方或原始仓库，记录版本、许可证和最后检查日期。"], ["检查权限边界", "明确是否联网、读取文件、访问密钥或执行命令；不确定就不安装。"]], tools: ["skills-registry", "ai-ecosystem-directory", "ai-tools-directory", "ai-selector"]
    }
  }[mode];
  const toolLinks = data.tools.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean)
    .map((tool) => `<a class="workbench-tool" href="/tools/${tool.id}.html"><span>${tool.emoji}</span><div><b>${esc(tool.name)}</b><small>${esc(tool.desc)}</small></div><i>→</i></a>`).join("");
  const stepList = data.steps.map(([title, body], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><b>${title}</b><p>${body}</p></div></li>`).join("");
  return `${head(`${data.label} — ${BRAND}`, data.desc, `${SITE}/workspace-${mode}.html`, "zh-CN", "noindex,follow")}
<body class="workbench-page" data-workbench="${mode}">
${navBar()}
<main class="container workbench-page-main">
  <div class="crumbs"><a href="/">首页</a> / ${data.label}</div>
  <section class="workbench-page-hero"><span class="eyebrow">${data.label}</span><h1>${data.title}</h1><p>${data.desc}</p></section>
  <div class="workbench-layout"><section class="project-editor"><div class="project-editor-head"><div><h2>创建可继续的本地项目</h2><p>保存后会带上这条路线的检查清单；内容不会上传。</p></div><span class="local-badge">LOCAL ONLY</span></div><form id="project-form"><label>这次要完成什么？<textarea name="goal" required maxlength="600" placeholder="${esc(data.goal)}"></textarea></label><label>补充背景或限制（可选）<textarea name="notes" maxlength="1200" placeholder="受众、已有素材、预算、数据边界、验收标准……"></textarea></label><div class="project-form-actions"><button class="btn primary" type="submit">保存到本地工作区</button><span id="project-feedback" aria-live="polite"></span></div></form></section>
  <aside class="workflow-outline"><span class="eyebrow">建议路径</span><ol>${stepList}</ol></aside></div>
  <section class="workbench-tools-section"><div class="journey-heading"><div><span class="eyebrow">现在可用</span><h2>按顺序使用这些工具</h2></div><a class="text-link" href="/workspace.html">查看已保存项目 →</a></div><div class="workbench-tools-grid">${toolLinks}</div></section>
  <section class="boundary-note"><b>使用边界</b><p>${mode === "skills" ? "ToolHub 只索引与说明公开来源，不执行第三方 Skill 代码。安装前仍需自己核查仓库、许可证、版本和权限。" : "敏感文本、密钥和客户资料不应粘贴到未知的第三方 AI 服务。ToolHub 的本地工具不上传输入内容。"}</p></section>
</main>
${footer()}
<script src="/assets/js/app.js"></script>
<script type="module" src="/assets/js/workbench.js"></script>
</body></html>`;
}

function toolPage(t) {
  const cat = CATEGORIES.find((c) => c.id === t.cat);
  const related = TOOLS.filter((x) => x.cat === t.cat && x.id !== t.id).slice(0, 4);
  const title = `${t.name} \u2014 免费在线工具 | ${BRAND}`;
  const ld = {
    "@context": "https://schema.org", "@type": "WebApplication", name: t.name,
    applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: t.desc,
  };
  return `${head(title, t.desc, `${SITE}/tools/${t.id}.html`)}
<body data-tool="${t.id}">
${navBar()}
<main class="container">
<div class="tool-head">
<div class="crumbs"><a href="/">首页</a> / <a href="/#${t.cat}">${esc(cat.name)}</a> / ${esc(t.name)}</div>
<h1>${t.emoji} ${esc(t.name)}</h1>
<p>${esc(t.desc)}</p>
</div>
<div class="panel"><div id="tool-mount"></div></div>
${related.length?`<div class="section-title"><h2>相关工具</h2></div><div class="grid">${related.map((r)=>`<a class="card" href="/tools/${r.id}.html" style="--ca:${accentOf(r.cat)}"><div class="t-ico">${r.emoji}</div><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p></a>`).join("")}</div>`:""}
</main>
${footer()}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script src="/assets/js/app.js"></script>
<script type="module" src="/assets/js/workbench.js"></script>
<script type="module" src="/assets/js/ui.js"></script>
</body></html>`;
}

function docShell(title, desc, canonical, bodyHtml, language="zh-CN") {
  return `${head(title, desc, canonical, language)}\n<body>\n${navBar()}\n<main class="container">\n<div class="doc">${bodyHtml}</div>\n</main>\n${footer()}\n<script src="/assets/js/app.js"></script>\n</body></html>`;
}

function aboutPage() {
  const body = `<div class="crumbs"><a href="/">首页</a> / 关于</div>\n<h1>关于 ${BRAND}</h1>\n<p class="lead">${BRAND} 是一套快速、免费、隐私优先的日常工具集，并配有精选的 AI 工具、免费公开 API 与专业提示词目录。</p>\n<h2>为什么做这个网站</h2>\n<p>大多数在线工具充斥着广告、注册墙与追踪脚本。${BRAND} 力求简单：打开页面即可完成任务。所有工具完全在你的浏览器中运行，数据不会经过任何服务器。</p>\n<h2>网站内容</h2>\n<ul>\n<li><b>${TOOLS.length}+ 个内置工具</b>，涵盖 ${CATEGORIES.length} 个分类。</li>\n<li><b>${AI_CATALOG.length}+ 款 AI 工具</b>，精选自高星 GitHub 项目与热门目录。</li>\n<li><b>${APIS.length}+ 个免费 API</b>，标注鉴权、HTTPS 与 CORS 信息。</li>\n<li><b>${PROMPTS.length} 个专业提示词</b>，可直接复制并按需修改。</li>\n</ul>\n<h2>我们的原则</h2>\n<ul>\n<li><b>默认隐私</b>：仅在本地运行，不上传、不需账号。</li>\n<li><b>快速</b>：边缘节点分发的静态页面。</li>\n<li><b>诚实</b>：外部链接（部分为推广链接）均有标注；价格与可用性可能变化。</li>\n</ul>\n<p>提示：在任意页面按 <kbd>Ctrl+K</kbd> 即可搜索全部内容。</p>`;
  return docShell(`关于 \u2014 ${BRAND}`, `${BRAND}：免费、快速、隐私优先的实用工具，外加精选 AI 工具、免费 API 与提示词。`, SITE + "/about.html", body);
}

function privacyPage(){
  const body = `<div class="crumbs"><a href="/">首页</a> / 隐私说明</div>
<h1>隐私说明</h1><p class="lead">ToolHub 的核心工具默认在你的浏览器中运行。我们不要求创建账号，也不把你粘贴的文本、JSON 或本地图片上传到 ToolHub 服务器。</p>
<h2>我们在本地保存什么</h2><p>为了提供主题、最近使用工具和本地工作区功能，网站会在你的浏览器中使用 localStorage 保存偏好、最近工具名称及你主动保存的项目内容。你可以在浏览器清除站点数据，或在“本地工作区”中删除项目。</p>
<h2>哪些情况会连接网络</h2><p>当你主动打开外部工具、官方来源或 GitHub/Hacker News 等外部资源时，你会离开 ToolHub 或由浏览器连接对应服务；这些服务适用其自身条款。部分目录页面展示的公开信息来自注明的上游来源，可能随时间变化。</p>
<h2>我们不做什么</h2><ul><li>不出售你的个人信息。</li><li>不默认采集你在本地工具中输入的正文、文件、密钥或图片。</li><li>不把本地工作区同步到服务器。</li></ul>
<h2>运营数据与变更</h2><p>Cloudflare 可能为站点提供基础访问与错误观测，以保障可用性和安全性；这些不用于读取本地工具输入内容。若未来启用新的账号、支付、云同步或第三方统计功能，会在启用前更新本说明。</p>
<p class="policy-updated">最后更新：${BUILD_DATE}</p>`;
  return docShell(`隐私说明 — ${BRAND}`, "ToolHub 如何处理本地数据、外部链接和基础运营观测。", SITE+"/privacy.html", body);
}
function termsPage(){
  const body = `<div class="crumbs"><a href="/">首页</a> / 使用条款</div>
<h1>使用条款</h1><p class="lead">使用 ToolHub 即表示你同意按本条款合法、审慎地使用本站。</p>
<h2>工具与信息的性质</h2><p>本站工具、目录、工作流和文章用于一般信息、效率和开发辅助，不构成法律、财务、医疗、投资、安全或专业技术意见。请在重要决策、生产部署或商业使用前自行验证结果。</p>
<h2>外部资源与 Agent Skills</h2><p>目录中的第三方链接、模型、API、仓库与 Skills 由各自提供方维护。ToolHub 不执行第三方 Skill 代码，也不保证外部服务持续可用、免费、安全或适合你的用途。安装前请自行核验来源、许可证、版本、权限与数据边界。</p>
<h2>内容与知识产权</h2><p>请勿利用本站侵犯他人权利、传播违法内容、绕过第三方平台规则或重新分发无授权的课程、代码、素材和 Skill 内容。若引用或使用开源项目，请遵守适用许可证和署名要求。</p>
<h2>可用性与变更</h2><p>我们会尽力维持服务，但不承诺无中断、无错误或所有外部数据始终最新。功能、目录和条款可能调整；重大变化会通过更新日志或本页说明。</p>
<p class="policy-updated">最后更新：${BUILD_DATE}</p>`;
  return docShell(`使用条款 — ${BRAND}`, "ToolHub 的使用边界、第三方资源说明和责任限制。", SITE+"/terms.html", body);
}
function dataPolicyPage(){
  const body = `<div class="crumbs"><a href="/">首页</a> / 数据与收录政策</div>
<h1>数据与收录政策</h1><p class="lead">我们不把“工具数量”当作推荐理由。目录信息的目标是帮助你做选择，而不是代替验证。</p>
<h2>收录标准</h2><ul><li><b>任务相关性：</b>能解决明确的内容、开发、研究或自动化任务。</li><li><b>来源可追溯：</b>优先链接官方页面、原始仓库或原作者公开页面。</li><li><b>边界可说明：</b>尽量标记许可证、公开信息、权限和潜在风险。</li><li><b>不做暗示性背书：</b>被收录不等于适合所有人，也不等于安全审计或商业推荐。</li></ul>
<h2>更新与失效处理</h2><p>公开 API、免费额度、价格、模型能力和第三方项目状态可能发生变化。页面中的“免费”“支持”或“可用”仅代表所列来源在核验时的公开信息；关键使用前请回到官方页面复核。发现失效、误导或侵权内容，可通过联系页反馈。</p>
<h2>推广与商业合作</h2><p>如未来出现赞助、推广或联盟链接，会以清晰标签标注，不会把付费展示伪装成独立评测。核心本地工具不会因是否付费而改变结果。</p>
<h2>安全边界</h2><p>任何第三方 Skill、脚本、插件或仓库都应在独立环境中审查和测试。尤其应留意网络访问、文件读写、环境变量、密钥读取和命令执行权限。</p>
<p class="policy-updated">最后更新：${BUILD_DATE}</p>`;
  return docShell(`数据与收录政策 — ${BRAND}`, "ToolHub 的外部资源收录、更新、推广披露与安全边界。", SITE+"/data-policy.html", body);
}
function statusPage(){
  const body = `<div class="crumbs"><a href="/">首页</a> / 服务状态</div>
<h1>服务状态与运营说明</h1><p class="lead">本站核心功能采用静态页面和浏览器本地计算。出现异常时，请先判断是 ToolHub、浏览器本地环境，还是第三方资源本身的问题。</p>
<div class="status-grid"><article><span class="status-dot ok"></span><h2>核心本地工具</h2><p>文本、JSON、编码、图片和计算类工具在浏览器本地运行；不依赖 ToolHub 后端处理你的输入。</p></article><article><span class="status-dot info"></span><h2>目录与外部数据</h2><p>第三方资源、模型、免费额度和公开资讯会受上游服务、网络和政策变化影响。</p></article><article><span class="status-dot info"></span><h2>本地工作区</h2><p>项目保存在当前浏览器。清除浏览器站点数据、使用无痕模式或更换设备可能导致本地数据丢失。</p></article></div>
<h2>自助排查</h2><ol><li>刷新页面或使用最新浏览器重试。</li><li>确认浏览器没有拦截 localStorage、下载或剪贴板权限。</li><li>外部链接失效时，回到原始官方页面确认服务状态。</li><li>若问题持续，请在反馈中提供页面地址、浏览器版本、复现步骤与错误截图；不要发送密钥或敏感资料。</li></ol>
<p class="policy-updated">状态页更新：${BUILD_DATE}</p>`;
  return docShell(`服务状态 — ${BRAND}`, "ToolHub 核心功能、外部数据和本地工作区的运行边界与排查方式。", SITE+"/status.html", body);
}
function contactPage(){
  const link = CONTACT_EMAIL ? `<a class="btn primary" href="mailto:${esc(CONTACT_EMAIL)}?subject=${encodeURIComponent("ToolHub 反馈")}">发送邮件反馈</a>` : `<p class="contact-pending">运营邮箱尚未配置。正式上线前，请在部署配置中设置 CONTACT_EMAIL；发布检查会阻止未配置联系方式的正式部署。</p>`;
  const body = `<div class="crumbs"><a href="/">首页</a> / 联系与反馈</div>
<h1>联系与反馈</h1><p class="lead">欢迎反馈失效链接、数据错误、版权问题、安全风险、产品建议和合作需求。</p>
<div class="contact-card"><h2>提交时请包含</h2><ul><li>相关页面地址或外部来源链接；</li><li>你看到的问题及可复现步骤；</li><li>必要时附浏览器版本或截图。</li></ul><p><b>请不要发送：</b>密码、API Key、身份证件、客户数据、未脱敏文件或任何敏感个人信息。</p>${link}</div>
<h2>处理原则</h2><p>涉及失效、侵权、误导、恶意代码或高风险权限的反馈优先处理。外部来源的最终状态以提供方官方说明为准。</p>`;
  return docShell(`联系与反馈 — ${BRAND}`, "联系 ToolHub 反馈错误、失效来源、安全风险或合作需求。", SITE+"/contact.html", body);
}

function changelogPage() {
  const entry = (ver, items) => `<div class="changelog-entry"><div><span class="ver">${ver}</span></div><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
  const body = `<div class="crumbs"><a href="/">首页</a> / 更新日志</div>\n<h1>更新日志</h1>\n<p class="lead">${BRAND} 的最新更新。</p>\n${entry("v15", ["首页重构为以搜索为核心的工作台，新增任务分流、AI 技术栈与 Agent Skills 资源。", "移除旧版首页模板，改用选定的搜索工作台。"])}\n${entry("v13", ["全局 Ctrl+K 命令面板，可搜索工具、AI 工具、API 与提示词。", "AI 工具与 API 目录支持收藏（★）。", "优化设计系统、首页旗舰合集与卡片。", "新增关于页、更新日志页与自定义 404 页面。"])}\n${entry("v12", [`提示词库升级至 ${PROMPTS.length} 个详尽的专业提示词。`])}\n${entry("v11", [`AI 工具目录扩充至 ${AI_CATALOG.length}+ 款，并刷新了布局。`])}\n${entry("v9", [`新增免费 API 目录，收录 ${APIS.length}+ 个公开 API。`])}`;
  return docShell(`更新日志 \u2014 ${BRAND}`, `${BRAND} 更新日志。`, SITE + "/changelog.html", body);
}

function notFoundPage() {
  const body = `<div style="text-align:center;padding:30px 0"><h1 style="font-size:64px;margin:0">404</h1><p class="lead">该页面不存在或已被移动。</p><p style="margin-top:22px"><a class="btn primary" href="/">← 返回首页</a> &nbsp; <button class="btn" data-cmdk-open type="button">搜索全部</button></p></div>`;
  return docShell(`404 \u2014 ${BRAND}`, "页面未找到。", SITE + "/404.html", body);
}


function hubHero(eyebrow, title, desc, actions="") {
  return `<section class="hub-hero"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${desc}</p>${actions}</section>`;
}
function workflowCards(compact=false) {
  return `<div class="workflow-grid">${WORKFLOWS.map((w)=>`<article class="workflow-card" id="${w.id}"><div class="workflow-num">${w.num}</div><span class="eyebrow">工作流</span><h2>${esc(w.title)}</h2><p>${esc(w.desc)}</p>${compact?`<a class="text-link" href="/workflows.html#${w.id}">查看工作流 →</a>`:`<div class="workflow-outcome"><b>目标产出</b><span>${esc(w.outcome)}</span></div><ol class="workflow-steps">${w.steps.map((x,i)=>`<li class="workflow-step"><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div></li>`).join("")}</ol><div class="workflow-links">${w.links.map((l)=>`<a href="${l}">打开工具 ↗</a>`).join("")}</div>`}</article>`).join("")}</div>`;
}
function toolsIndexPage(){
  const sections = CATEGORIES.map((category) => {
    const items = TOOLS.filter((tool) => tool.cat === category.id);
    return `<section class="tool-index-section" id="${category.id}"><div class="tool-index-head"><div><span class="eyebrow">${category.emoji} 工具分类</span><h2>${esc(category.name)}</h2></div><span>${items.length} 个工具</span></div><div class="tool-index-grid">${items.map((tool) => `<a class="tool-index-card" href="/tools/${tool.id}.html"><span class="tool-index-icon">${tool.emoji}</span><span><b>${esc(tool.name)}</b><small>${esc(tool.desc)}</small></span><i aria-hidden="true">→</i></a>`).join("")}</div></section>`;
  }).join("");
  const body = hubHero("全部工具", "本地完成，不上传输入。", "按任务直接选择工具。文本、数据、开发、图片、设计、SEO 与计算均在浏览器中运行。", `<div class="hub-actions"><button class="btn primary" data-cmdk-open type="button">搜索全部工具</button><a class="btn" href="/workspace-content.html">打开工作台</a></div>`) + `<nav class="tool-index-jump" aria-label="跳转到工具分类">${CATEGORIES.map((category) => `<a href="#${category.id}">${category.emoji} ${esc(category.name)}</a>`).join("")}</nav><div class="tool-index-list">${sections}</div>`;
  return docShell(`全部工具 — ${BRAND}`, "按文本、开发、换算、图片、设计、SEO、计算与 AI 分类浏览 ToolHub 的本地工具。", SITE+"/tools.html", body);
}

function discoverPage(){
 const picks=`<div class="pick-grid">${EDITOR_PICKS.map((x)=>`<a class="pick-card" href="${x.href}" ${x.href.startsWith("http")?'target="_blank" rel="noopener"':''}><span class="pick-ico">${x.icon}</span><div><span class="pick-kind">精选推荐</span><h3>${esc(x.name)}</h3><p>${esc(x.why)}</p></div><span class="pick-arrow">↗</span></a>`).join("")}</div>`;
 const learn=`<div class="learn-grid">${LEARNING.map((x)=>`<a class="learn-card" href="${x.href}"><span>${esc(x.level)} · ${esc(x.time)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><b>阅读指南 →</b></a>`).join("")}</div>`;
 const body=hubHero("ToolHub 精选", "带着观点发现工具。", "更从容地找到合适的工具：从任务出发，理解取舍，只保留真正值得纳入工作流的工具。", `<div class="hub-actions"><a class="btn primary" href="/workflows.html">浏览工作流</a><button class="btn" data-cmdk-open type="button">搜索全部</button></div>`) + `<section class="hub-section"><div class="section-kicker"><span class="eyebrow">精选</span><h2>编辑精选清单</h2><p>现在就用得上，且每一个都有明确的推荐理由。</p></div>${picks}</section><section class="hub-section"><div class="section-kicker"><span class="eyebrow">学习</span><h2>更好的输入，更好的结果</h2><p>简短指南，帮你更有把握地选择和使用工具。</p></div>${learn}</section><section class="hub-section"><div class="section-kicker"><span class="eyebrow">工作流</span><h2>不要囤积工具，而要搭建系统。</h2></div>${workflowCards(true)}</section>`;
 return docShell(`资源库 — ${BRAND}`, "来自 ToolHub 的精选 AI 工具、实用工作流与简明学习路径。", SITE+"/discover.html", body).replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script src="/assets/js/hub.js"></script>');
}
function workflowsPage(){
 const body=hubHero("ToolHub 工作流", "从任务直达成果。", "每条路线都结合了实用步骤、合适的 ToolHub 工具与精选 AI 资源。把它们当作可灵活调整的操作手册，而非死板的清单。", `<div class="hub-actions"><a class="btn primary" href="/tools/prompt-library.html">浏览提示词模板</a><a class="btn" href="/tools/ai-tools-directory.html">浏览 AI 工具</a></div>`) + workflowCards(false) + `<section class="template-callout"><span class="eyebrow">可复用模板</span><h2>在让 AI 动手前，先给它一份说明</h2><pre>目标：[做好后能带来什么]\n受众：[谁会使用它]\n背景：[事实、约束、素材]\n输出：[格式、篇幅、结构]\n质量标准：[需包含 / 避免什么]\n检查：[如何验证结果]</pre><button class="btn" type="button" data-copy-template="目标：[做好后能带来什么]\n受众：[谁会使用它]\n背景：[事实、约束、素材]\n输出：[格式、篇幅、结构]\n质量标准：[需包含 / 避免什么]\n检查：[如何验证结果]">复制模板</button></section>`;
 return docShell(`工作流 — ${BRAND}`, "围绕真实成果构建的实用 AI、研究、设计与开发工作流。", SITE+"/workflows.html", body).replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script src="/assets/js/hub.js"></script>');
}
function learnPage(){
 const body=hubHero("ToolHub 学习", "理解工具背后的决策。", "一个精简的知识库，帮你更聪明地使用 AI、API 与浏览器优先的工具。没有废话，也没有付费课程漏斗。") + `<div class="learn-grid large">${LEARNING.map((x)=>`<article class="learn-card"><span>${esc(x.level)} · ${esc(x.time)}</span><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p><a class="text-link" href="${x.href}">查看相关资源 →</a></article>`).join("")}</div><section class="principle-grid"><article><span>01</span><h3>用一手来源，而非二手摘要</h3><p>AI 的输出可以帮你导航，但重要结论仍需回到一手来源核实。</p></article><article><span>02</span><h3>先定义什么算成功</h3><p>明确的质量标准能避免含糊的提示词，并让结果可被检验。</p></article><article><span>03</span><h3>敏感工作留在本地</h3><p>对于敏感的文件和文本，尽量选择 ToolHub 中在本地运行的工具。</p></article></section>`;
 return docShell(`学习 — ${BRAND}`, "负责任地使用 AI 工具、提示词与 API 的简短实用指南。", SITE+"/learn.html", body).replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script src="/assets/js/hub.js"></script>');
}
function comparePage(){
 const body=hubHero("ToolHub 对比", "按需求对比，而非跟风。", "一套透明的决策框架，用于选择 AI 工具、提示词方法或 API。排名会变，但应由你的需求主导。") + `<section class="compare-shell"><div class="compare-intro"><span class="eyebrow">决策框架</span><h2>做决定前的五项检查</h2><p>针对你真正需要完成的任务为候选工具打分，避免因为一次发布或一份泛泛的功能清单而频繁换工具。</p></div><div class="compare-grid"><article><b>01</b><h3>任务匹配</h3><p>它能否产出你需要的确切输出，并提供足够的控制？</p></article><article><b>02</b><h3>质量与审阅</h3><p>你能否检查、编辑并验证结果？</p></article><article><b>03</b><h3>数据边界</h3><p>哪些数据会离开你的设备，以及在什么条款下？</p></article><article><b>04</b><h3>重复成本</h3><p>考虑用量、团队席位、API 使用量与节省的时间。</p></article><article><b>05</b><h3>退出路径</h3><p>你能否导出成果并在以后更换工具？</p></article></div></section><section class="template-callout"><span class="eyebrow">对比模板</span><h2>做出经得起推敲的选择</h2><pre>候选工具：[A]、[B]、[C]\n要完成的任务：[具体成果]\n硬性约束：[隐私、预算、语言、集成]\n评测样本：[对所有候选使用相同输入]\n评分：任务匹配 / 质量 / 可控性 / 成本 / 可迁移性\n结论：[工具]，因为 [依据]</pre><button class="btn" type="button" data-copy-template="候选工具：[A]、[B]、[C]\n要完成的任务：[具体成果]\n硬性约束：[隐私、预算、语言、集成]\n评测样本：[对所有候选使用相同输入]\n评分：任务匹配 / 质量 / 可控性 / 成本 / 可迁移性\n结论：[工具]，因为 [依据]">复制模板</button></section>`;
 return docShell(`对比 — ${BRAND}`, "基于任务匹配、质量、数据与成本对比 AI 工具与 API 的实用框架。", SITE+"/compare.html", body).replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script src="/assets/js/hub.js"></script>');
}

function startPage(){
  const body = `<section class="route-shell"><div class="crumbs"><a href="/">首页</a> / 任务规划</div><header class="route-hero"><span class="eyebrow">TASK → DECISION → DONE</span><h1>先说要完成什么。<br>再决定用什么。</h1><p>不是给你更多链接，而是给你一条能今天开始、可稍后继续的最小执行路线。所有内容只保存在当前浏览器。</p></header><section class="route-form-card"><h2>生成我的执行路线</h2><form id="route-form"><label>你要完成什么？<textarea name="goal" required maxlength="600" placeholder="例如：我想每周稳定发布 3 篇面向创业者的 AI 内容，但预算有限，不能泄露客户资料。"></textarea></label><div class="route-fields"><label>任务类型<select name="type"><option value="auto">由 ToolHub 判断</option><option value="content">内容发布</option><option value="dev">产品 / 开发</option><option value="skills">Skills / Agent 选型</option></select></label><label>最优先的约束<select name="constraint"><option>隐私与可控性优先</option><option>最低成本优先</option><option>最快完成优先</option><option>稳定可复用优先</option></select></label></div><button class="btn primary" type="submit">生成我的最小执行路线</button></form></section><section id="route-result" class="route-result" hidden aria-live="polite"></section><section class="route-proof"><article><b>01</b><h3>不堆工具</h3><p>每条路线只给完成当前任务真正需要的工具。</p></article><article><b>02</b><h3>先看风险</h3><p>成本、隐私、权限与许可证在开始前说清楚。</p></article><article><b>03</b><h3>下次继续</h3><p>保存到本地工作区，而不是下次从零找起。</p></article></section></section>`;
  return docShell(`任务规划 — ${BRAND}`, "输入目标，获得最少工具、执行步骤与风险边界；本地保存后随时继续。", SITE+"/start.html", body).replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script type="module" src="/assets/js/task-router.js"></script>');
}

function workspacePage(){
  const body = `<section class="workspace-shell"><header class="workspace-head"><div><span class="eyebrow">PRIVATE / LOCAL-FIRST</span><h1>Your execution workspace</h1><p>Saved routes stay in this browser only. No account, tracking, or server upload is required.</p></div><div class="workspace-actions"><span id="workspace-count">0 saved routes</span><button id="workspace-clear" class="btn" type="button">Clear local workspace</button></div></header><section id="workspace-empty" class="workspace-empty"><h2>No saved routes yet</h2><p>Start in Build, generate an execution route, then save it here to track planning, building, review, and delivery.</p><a class="btn primary" href="/workspace-dev.html">打开开发工作台</a></section><section id="workspace-list" class="workspace-list" aria-live="polite"></section><p class="workspace-note">Privacy boundary: clearing browser site data or using another device will not transfer these routes. Team sync is intentionally not implied by this local-first workspace.</p></section>`;
  return docShell(`本地工作区 — ${BRAND}`, "保存本地 AI 工作流项目、草稿与状态，不需要账号。", SITE+"/workspace.html", body).replace('<head>','<head>\n<meta name="robots" content="noindex,follow">').replace('<script src="/assets/js/app.js"></script>','<script src="/assets/js/app.js"></script><script type="module" src="/assets/js/workspace.js"></script>');
}

function pitfallsPage(){
  const cards = `<div class="pitfall"><div class="pf-num">1</div><div class="pf-body"><h3>简单分类 / 信息抽取，别一上来就用最贵的旗舰模型</h3><p class="pf-avoid"><b>别急着：</b>用顶配 GPT/Claude 跑标签分类、字段抽取这类结构化小任务。</p><p class="pf-why"><b>为什么：</b>这类任务小模型甚至规则就能做好，旗舰模型贵几十倍且更慢。</p><p class="pf-use"><b>更好的做法：</b>先用小模型（mini / flash / 本地开源）或规则，做不好再升级。</p></div></div><div class="pitfall"><div class="pf-num">2</div><div class="pf-body"><h3>文档很少时，别为了 RAG 而 RAG</h3><p class="pf-avoid"><b>别急着：</b>只有几十页文档就搭向量库 + 检索链路。</p><p class="pf-why"><b>为什么：</b>小语料下 RAG 的工程复杂度与出错面远大于收益，还会引入检索噪声。</p><p class="pf-use"><b>更好的做法：</b>直接把文档放进长上下文模型，等数据量真正大了再上检索。</p></div></div><div class="pitfall"><div class="pf-num">3</div><div class="pf-body"><h3>别把专用向量数据库当成第一步</h3><p class="pf-avoid"><b>别急着：</b>项目一开始就引入一套专用向量数据库服务。</p><p class="pf-why"><b>为什么：</b>初期数据量下，关键词 / BM25 或 SQLite / pgvector 就够用，运维成本更低。</p><p class="pf-use"><b>更好的做法：</b>先用嵌入式方案（SQLite / Postgres 扩展），规模上去再迁移到专用库。</p></div></div><div class="pitfall"><div class="pf-num">4</div><div class="pf-body"><h3>一次调用能搞定的事，别套 Agent 框架</h3><p class="pf-avoid"><b>别急着：</b>为简单任务搭多步 Agent / 工具链。</p><p class="pf-why"><b>为什么：</b>多步 Agent 增加了失败面、延迟与成本，调试也更难。</p><p class="pf-use"><b>更好的做法：</b>能用一次带结构化输出的调用完成，就不要上 Agent；确实需要多步再引入。</p></div></div><div class="pitfall"><div class="pf-num">5</div><div class="pf-body"><h3>请求量不大时，别过早自建推理</h3><p class="pf-avoid"><b>别急着：</b>为了“省钱”提前买 GPU 自建推理服务。</p><p class="pf-why"><b>为什么：</b>低利用率下，GPU 闲置与运维人力反而比调 API 更贵。</p><p class="pf-use"><b>更好的做法：</b>先用 API，用成本沙盘算清楚盈亏平衡点，真正超过再自建。</p></div></div><div class="pitfall"><div class="pf-num">6</div><div class="pf-body"><h3>选模型，别只看榜单跑分</h3><p class="pf-avoid"><b>别急着：</b>看到某模型榜单第一就直接上生产。</p><p class="pf-why"><b>为什么：</b>公开榜单与你的真实任务分布往往不一致，还可能有数据污染。</p><p class="pf-use"><b>更好的做法：</b>用你自己的数据做小样本实测，再用模型擂台对比关键维度。</p></div></div><div class="pitfall"><div class="pf-num">7</div><div class="pf-body"><h3>提示词别只写一句话</h3><p class="pf-avoid"><b>别急着：</b>把复杂任务压成一句笼统的提示词。</p><p class="pf-why"><b>为什么：</b>缺少角色 / 受众 / 格式 / 质量标准 / 示例，输出就会飘忽不定。</p><p class="pf-use"><b>更好的做法：</b>用可参数化提示词生成器补齐约束，把“你是谁 / 给谁看 / 要什么格式”说清楚。</p></div></div><div class="pitfall"><div class="pf-num">8</div><div class="pf-body"><h3>别忽视数据合规与许可证</h3><p class="pf-avoid"><b>别急着：</b>把敏感数据随意发给境外 API，或把开源模型直接商用。</p><p class="pf-why"><b>为什么：</b>国内业务需注意数据出境合规；部分开源权重对商用有限制。</p><p class="pf-use"><b>更好的做法：</b>优先国内直连 / 可自托管方案，上线前确认数据流向与模型许可证。</p></div></div><div class="pitfall"><div class="pf-num">9</div><div class="pf-body"><h3>别把免费额度当成生产依赖</h3><p class="pf-avoid"><b>别急着：</b>用免费 / 试用额度支撑正式业务流量。</p><p class="pf-why"><b>为什么：</b>免费额度有限速、稳定性与条款变化风险，随时可能断供。</p><p class="pf-use"><b>更好的做法：</b>免费额度用于原型 / 低峰兼备，生产链路准备付费兼容方案与降级预案。</p></div></div>`;
  const body = `<div class="crumbs"><a href="/">首页</a> / 避坑指南</div>
<h1>什么时候别用 AI（避坑指南）</h1>
<p class="lead">大多数教程只教你“怎么上手”，却很少告诉你“什么时候别用”。这里是一份带观点的清单，帮你在动手前少走弯路、少花冤柉钱。</p>
<div class="pitfalls">${cards}</div>
<p class="msg">以上为编辑观点，用于启发判断；具体取舍请结合你的数据规模、团队能力与合规要求。想快速得到组合建议，可用 <a href="/tools/ai-selector.html">AI 选型决策引擎</a> 与 <a href="/tools/ai-cost-sandbox.html">成本沙盘</a>。</p>`;
  return docShell("避坑指南 — 什么时候别用 AI — "+BRAND, "带观点的 AI 避坑清单：什么时候别用大模型、别做 RAG、别自建推理、别只看跑分。", SITE + "/pitfalls.html", body);
}


function skillsPage(){
  const stats = [
    ["sk-total", "收录 Skills 总数"],
    ["sk-core", "core · 许可证明确"],
    ["sk-index", "index · 仅外链索引"],
    ["sk-review", "需人工复核"],
    ["sk-date", "索引生成日期"],
  ].map(([id, label]) => `<div class="sk-stat"><b id="${id}">—</b><span>${label}</span></div>`).join("");
  const body = `<section class="sk-wrap">
<div class="crumbs"><a href="/">首页</a> / Skills 目录</div>
<header class="sk-hero"><span class="eyebrow">AGENT SKILLS INDEX</span>
<h1>全网 Skills 目录</h1>
<p>按任务关键词、许可证、安全等级与活跃度检索公开仓库中的 Agent Skills。站内只保存元数据与外链，不转存 SKILL.md 正文；每条结果都可一键跳回上游仓库核对。</p></header>
<div class="sk-stats">${stats}</div>
<section class="sk-panel" aria-label="搜索与筛选">
<div class="sk-searchrow">
<input id="sk-q" type="search" placeholder="关键词搜索（多个词空格隔开 = 同时包含），例如：pdf 抽取" autocomplete="off" spellcheck="false">
<div class="sk-scope" role="group" aria-label="搜索范围">
<button id="sk-scope-featured" type="button" aria-pressed="true">精选优先</button>
<button id="sk-scope-full" type="button" aria-pressed="false">全库搜索</button>
</div></div>
<div class="sk-filters">
<label>分类<select id="sk-cat"><option value="">全部</option></select></label>
<label>层级<select id="sk-tier"><option value="">全部</option><option value="c">core（许可证明确）</option><option value="i">index（仅外链）</option></select></label>
<label>安全等级<select id="sk-safety"><option value="">全部</option><option value="s">无命中</option><option value="r">需复核</option><option value="x">高风险</option></select></label>
<label>许可证<select id="sk-license"><option value="">全部</option></select></label>
<label>作者 / 组织<select id="sk-owner"><option value="">全部</option></select></label>
<label>最低 Star 数<input id="sk-stars" type="number" min="0" step="100" value="0" inputmode="numeric"></label>
<label>排序<select id="sk-sort"><option value="quality">质量分优先</option><option value="stars">Star 数优先</option><option value="updated">最近更新</option><option value="name">名称 A-Z</option></select></label>
</div>
<div class="sk-progress" id="sk-progress" hidden><i></i></div>
</section>
<p class="sk-status" id="sk-status" aria-live="polite"></p>
<ul class="sk-list" id="sk-list"></ul>
<button class="sk-more" id="sk-more" type="button" hidden></button>
<p class="sk-note">合规说明：core 表示上游许可证可识别；index 表示上游未声明许可证，本站仅做索引与外链。带红色标签的条目命中了安全规则，使用前请人工阅读 SKILL.md。引用或商用前请自行确认上游许可证与权限边界。数据按分片流式加载，首屏只下载索引与第一个分片。</p>
</section>`;
  return docShell(`Skills 目录 — ${BRAND}`, "可搜索的全网 Agent Skills 目录：按关键词、许可证、安全等级与 Star 数筛选，并直达上游 SKILL.md。", SITE+"/skills.html", body)
    .replace('<link rel="stylesheet" href="/assets/css/app.css">', '<link rel="stylesheet" href="/assets/css/app.css">\n<link rel="stylesheet" href="/assets/css/skills-catalog.css">')
    .replace('<script src="/assets/js/app.js"></script>', '<script src="/assets/js/app.js"></script><script src="/assets/js/skills-catalog.js" defer></script>');
}

const execFileAsync = promisify(execFile);
async function main() {
  await rm(join(PUB, "tools"), { recursive: true, force: true });
  await mkdir(join(PUB, "tools"), { recursive: true });
  // Homepage numbers come from the catalog build; missing data is not fatal.
  let skillStats = null;
  try {
    skillStats = JSON.parse(await readFile(join(PUB, "assets", "data", "skills", "meta.json"), "utf8"));
  } catch {
    console.log("BUILD: no skills meta.json yet, homepage renders without catalog numbers.");
  }
  await writeFile(join(PUB, "index.html"), homepage(skillStats));
  for (const t of TOOLS) await writeFile(join(PUB, "tools", `${t.id}.html`), toolPage(t));
  const urls = [`${SITE}/`, `${SITE}/start.html`, `${SITE}/tools.html`, `${SITE}/discover.html`, `${SITE}/workflows.html`, `${SITE}/learn.html`, `${SITE}/compare.html`, `${SITE}/pitfalls.html`, `${SITE}/skills.html`, `${SITE}/skills/top/`, `${SITE}/skills/updates`, `${SITE}/about.html`, `${SITE}/changelog.html`, `${SITE}/privacy.html`, `${SITE}/terms.html`, `${SITE}/data-policy.html`, `${SITE}/status.html`, `${SITE}/contact.html`, ...TOOLS.map((t) => `${SITE}/tools/${t.id}.html`)];
  await writeFile(join(PUB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u)=>`<url><loc>${canon(u)}</loc></url>`).join("\n")}\n</urlset>\n`);
  // Edge/browser caching. Shard files are versioned through a ?v= query string
  // so they can be cached hard; meta.json is the pointer that must stay fresh,
  // and HTML is short-lived so a deploy shows up immediately.
  await writeFile(join(PUB, "_headers"), [
    "/assets/data/skills/meta.json",
    "  Cache-Control: public, max-age=300, must-revalidate",
    "/assets/data/skills/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "/assets/brand/*",
    "  Cache-Control: public, max-age=604800",
    "/assets/css/*",
    "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800",
    "/assets/js/*",
    "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800",
    "/sw.js",
    "  Cache-Control: no-cache",
    "/*",
    "  Cache-Control: public, max-age=0, must-revalidate",
    "  X-Content-Type-Options: nosniff",
    "  X-Frame-Options: SAMEORIGIN",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "  Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "  Cross-Origin-Opener-Policy: same-origin",
    "  Cross-Origin-Resource-Policy: same-origin",
    "  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob: https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' blob:; font-src 'self' data:",
    "",
  ].join("\n"));
  // Service worker cache key follows RELEASE_ID. Hand-editing sw.js was the
  // root cause of a release that looked "deployed but unchanged".
  try {
    const wrangler = await readFile(join(PUB, "..", "wrangler.toml"), "utf8");
    const release = (wrangler.match(/RELEASE_ID\s*=\s*"([^"]+)"/) || [])[1];
    if (release) {
      const swPath = join(PUB, "sw.js");
      const swSrc = await readFile(swPath, "utf8");
      const name = `toolhub-${release.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
      const next = swSrc.replace(/const CACHE = "[^"]*";/, `const CACHE = "${name}";`);
      if (next !== swSrc) await writeFile(swPath, next);
      console.log(`BUILD: service worker cache = const CACHE = "${name}";`);
    }
  } catch (error) {
    console.warn("BUILD: could not sync service worker cache name", error.message);
  }
  await writeFile(join(PUB, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  await writeFile(join(PUB, "assets", "js", "tools-index.js"), `export const TOOLS_INDEX = ${JSON.stringify(TOOLS.map((t) => ({ id: t.id, name: t.name, desc: t.desc, cat: t.cat, kw: t.kw || "" })))};\n`);
  await writeFile(join(PUB, "about.html"), aboutPage());
  await writeFile(join(PUB, "privacy.html"), privacyPage());
  await writeFile(join(PUB, "terms.html"), termsPage());
  await writeFile(join(PUB, "data-policy.html"), dataPolicyPage());
  await writeFile(join(PUB, "status.html"), statusPage());
  await writeFile(join(PUB, "contact.html"), contactPage());
  await writeFile(join(PUB, "changelog.html"), changelogPage());
  await writeFile(join(PUB, "404.html"), notFoundPage());
  await writeFile(join(PUB, "tools.html"), toolsIndexPage());
  await writeFile(join(PUB, "start.html"), startPage());
  await writeFile(join(PUB, "discover.html"), discoverPage());
  await writeFile(join(PUB, "workflows.html"), workflowsPage());
  await writeFile(join(PUB, "workspace.html"), workspacePage());
  await writeFile(join(PUB, "workspace-content.html"), workbenchPage("content"));
  await writeFile(join(PUB, "workspace-dev.html"), workbenchPage("dev"));
  await writeFile(join(PUB, "workspace-skills.html"), workbenchPage("skills"));
  await writeFile(join(PUB, "learn.html"), learnPage());
  await writeFile(join(PUB, "compare.html"), comparePage());
  await writeFile(join(PUB, "pitfalls.html"), pitfallsPage());
  await writeFile(join(PUB, "skills.html"), skillsPage());
  await execFileAsync(process.execPath, ['build/write-data-manifest.mjs']);
  // Rewrite internal .html links to their canonical extensionless form.
  const pageFiles = [];
  const collect = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await collect(full);
      else if (entry.name.endsWith(".html")) pageFiles.push(full);
    }
  };
  await collect(PUB);
  for (const file of pageFiles) {
    const before = await readFile(file, "utf8");
    const after = canonLinks(before);
    if (after !== before) await writeFile(file, after);
  }

  console.log(`Built homepage + ${TOOLS.length} tool pages + editorial hub pages + sitemap/robots.`);
}
main();
