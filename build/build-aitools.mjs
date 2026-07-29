// Parse /data/aitools-raw.md (curated from mahseema/awesome-ai-tools, MIT) into
// new AI_TOOLS entries, dedupe internally and against existing data.js, and
// append. Category is set by `### <Category>` headers using our own 12 cats.
import fs from 'node:fs';

const DATA = '/data/ToolHub/public/assets/js/data.js';
const RAW = '/data/aitools-raw2.md';

const norm = (u) => u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').toLowerCase();

// existing tools
const mod = await import(DATA + '?t=' + Date.now());
const existing = mod.AI_TOOLS;
const seen = new Set();
for (const t of existing) { seen.add('u:' + norm(t.url)); seen.add('n:' + t.name.toLowerCase()); }

const lines = fs.readFileSync(RAW, 'utf8').split(/\r?\n/);
let cat = null;
const added = [];
for (const line of lines) {
  const h = line.match(/^###\s+(.+)$/);
  if (h) { cat = h[1].trim(); continue; }
  const m = line.match(/^\*\s+\**\[([^\]]+)\]\(([^)]+)\)\**\s*(.*)$/);
  if (!m || !cat) continue;
  let [, name, url, desc] = m;
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) continue;
  name = name.trim();
  desc = desc.replace(/^[-\u2013\u2014\\\s]+/, '').trim();
  desc = desc.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  desc = desc.replace(/"/g, "'");
  name = name.replace(/"/g, "'").replace(/\\/g, '');
  if (!name) continue;
  if (!desc) desc = name;
  if (desc.length > 200) desc = desc.slice(0, 197).trimEnd() + '...';
  const open = /github\.com/i.test(url) || /#?\s*open[\s-]?source/i.test(desc);
  const uk = 'u:' + norm(url), nk = 'n:' + name.toLowerCase();
  if (seen.has(uk) || seen.has(nk)) continue;
  seen.add(uk); seen.add(nk);
  added.push({ name, cat, desc, url, open });
}

const combined = existing.concat(added);
const body = combined.map((t) => `  { name: ${JSON.stringify(t.name)}, cat: ${JSON.stringify(t.cat)}, desc: ${JSON.stringify(t.desc)}, url: ${JSON.stringify(t.url)}, open: ${t.open} },`).join('\n');
const block = `export const AI_TOOLS = [\n${body}\n]`;

let src = fs.readFileSync(DATA, 'utf8');
src = src.replace(/export const AI_TOOLS = \[[\s\S]*?\n\]/, block);
fs.writeFileSync(DATA, src);

const byCat = {};
for (const t of combined) byCat[t.cat] = (byCat[t.cat] || 0) + 1;
console.log('existing:', existing.length, 'added:', added.length, 'total:', combined.length);
console.log('openCount:', combined.filter((t) => t.open).length);
console.log('byCat:', JSON.stringify(byCat));
