// palette.js — global ⌘K command palette. Universal search across built-in
// tools, the AI tools directory, the free API directory and the prompt library.
// First-party only (no external requests) to satisfy the site CSP.
import { AI_TOOLS, APIS, PROMPTS, AI_MODELS } from "./data.js";
import { AI_CATALOG } from "./catalog.js";
import { TOOLS_INDEX } from "./tools-index.js";

const INDEX = [];
for (const t of TOOLS_INDEX) INDEX.push({ kind: "Tool", name: t.name, desc: t.desc, cat: t.cat, kw: t.kw || "", url: "/tools/" + t.id + ".html", ext: false });
for (const a of AI_CATALOG) INDEX.push({ kind: "AI", name: a.name, desc: a.desc, cat: a.cat, kw: "", url: a.url, ext: true });
for (const a of APIS) INDEX.push({ kind: "API", name: a.name, desc: a.desc, cat: a.cat, kw: "", url: a.url, ext: true });
for (const m of AI_MODELS) INDEX.push({ kind: "Model", name: m.name, desc: (m.provider + " · " + m.note), cat: m.provider, kw: ("model 模型 " + m.id), url: "/tools/model-arena.html", ext: false });
for (const p of PROMPTS) INDEX.push({ kind: "Prompt", name: p.title, desc: p.text.replace(/\s+/g, " ").slice(0, 90), cat: p.cat, kw: "", url: "/tools/prompt-library.html", ext: false });

const KIND_CLASS = { Tool: "k-tool", AI: "k-ai", API: "k-api", Prompt: "k-prompt", Model: "k-model" };

function score(item, q) {
  const name = item.name.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if ((item.cat || "").toLowerCase().includes(q)) return 40;
  if ((item.desc || "").toLowerCase().includes(q)) return 25;
  if ((item.kw || "").toLowerCase().includes(q)) return 20;
  return -1;
}

function search(q) {
  q = q.trim().toLowerCase();
  if (!q) {
    // default: a handful of built-in tools + directories
    return INDEX.filter((i) => i.kind === "Tool").slice(0, 8);
  }
  const scored = [];
  for (const item of INDEX) {
    const s = score(item, q);
    if (s >= 0) scored.push([s, item]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, 40).map((x) => x[1]);
}

let overlay, input, listEl, results = [], active = 0;

function build() {
  overlay = document.createElement("div");
  overlay.className = "cmdk";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="cmdk-backdrop" data-close="1"></div>' +
    '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search everything">' +
    '<div class="cmdk-top"><span class="cmdk-ico" aria-hidden="true">\u2315</span>' +
    '<input class="cmdk-input" type="text" autocomplete="off" spellcheck="false" placeholder="Search tools, AI, APIs, prompts\u2026" aria-label="Search everything">' +
    '<kbd class="cmdk-esc">esc</kbd></div>' +
    '<div class="cmdk-list" role="listbox"></div>' +
    '<div class="cmdk-foot"><span><kbd>\u2191</kbd><kbd>\u2193</kbd> navigate</span><span><kbd>\u21b5</kbd> open</span><span>Search across everything on ToolHub</span></div>' +
    '</div>';
  document.body.appendChild(overlay);
  input = overlay.querySelector(".cmdk-input");
  listEl = overlay.querySelector(".cmdk-list");
  input.addEventListener("input", () => { render(search(input.value)); });
  overlay.addEventListener("click", (e) => { if (e.target.getAttribute("data-close")) close(); });
  input.addEventListener("keydown", onKey);
}

function render(items) {
  results = items; active = 0;
  listEl.innerHTML = "";
  if (!items.length) {
    listEl.innerHTML = '<div class="cmdk-empty">No matches. Try another term.</div>';
    return;
  }
  items.forEach((it, i) => {
    const row = document.createElement(i === 0 ? "a" : "a");
    row.className = "cmdk-row" + (i === 0 ? " active" : "");
    row.href = it.url;
    if (it.ext) { row.target = "_blank"; row.rel = "noopener"; }
    row.setAttribute("role", "option");
    row.dataset.i = String(i);
    const mono = (it.name || "?").charAt(0).toUpperCase();
    row.innerHTML =
      '<span class="cmdk-mono ' + (KIND_CLASS[it.kind] || "") + '">' + escapeHtml(mono) + '</span>' +
      '<span class="cmdk-main"><span class="cmdk-name">' + escapeHtml(it.name) + '</span>' +
      '<span class="cmdk-desc">' + escapeHtml(it.desc || "") + '</span></span>' +
      '<span class="cmdk-kind ' + (KIND_CLASS[it.kind] || "") + '">' + it.kind + (it.cat ? " \u00b7 " + escapeHtml(it.cat) : "") + '</span>' +
      (it.ext ? '<span class="cmdk-ext" aria-hidden="true">\u2197</span>' : "");
    row.addEventListener("mousemove", () => setActive(i));
    listEl.appendChild(row);
  });
}

function setActive(i) {
  active = i;
  Array.from(listEl.children).forEach((c, idx) => c.classList.toggle("active", idx === i));
  const node = listEl.children[i];
  if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
}

function onKey(e) {
  if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) setActive((active + 1) % results.length); }
  else if (e.key === "ArrowUp") { e.preventDefault(); if (results.length) setActive((active - 1 + results.length) % results.length); }
  else if (e.key === "Enter") { e.preventDefault(); const node = listEl.children[active]; if (node) node.click(); }
  else if (e.key === "Escape") { e.preventDefault(); close(); }
}

function open() {
  if (!overlay) build();
  overlay.hidden = false;
  document.body.classList.add("cmdk-open");
  input.value = "";
  render(search(""));
  setTimeout(() => input.focus(), 20);
}
function close() {
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove("cmdk-open");
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); overlay && !overlay.hidden ? close() : open(); }
  else if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) && !e.target.isContentEditable) { e.preventDefault(); open(); }
});

document.addEventListener("click", (e) => { if (e.target.closest("[data-cmdk-open]")) { e.preventDefault(); open(); } });

window.ToolHubPalette = { open, close };
