// Parses /data/pa-raw.md (public-apis README tables) into the APIS array in data.js
import fs from 'node:fs';

const RAW = '/data/pa-raw.md';
const DATA = '/data/ToolHub/public/assets/js/data.js';

const lines = fs.readFileSync(RAW, 'utf8').split('\n');
let cat = 'Misc';
const seen = new Set();
const out = [];
const skipCats = new Set(['Index','APILayer APIs','License','Learn more about Public APIs']);

function clean(s){
  return String(s).replace(/\\\|/g,'|').replace(/\s+/g,' ').replace(/"/g,"'").trim();
}

for (const raw of lines){
  const line = raw.trim();
  if(!line) continue;
  const h = line.match(/^###\s+(.+?)\s*$/);
  if(h){ cat = h[1].trim(); continue; }
  if(line[0] !== '|') continue;
  const cells = line.split('|').map(s=>s.trim());
  if(cells.length < 7) continue;              // need at least name|desc|auth|https|cors
  const first = cells[1];
  const mm = first.match(/^\[(.+)\]\((.+)\)$/);
  if(!mm) continue;                            // header/separator/APILayer rows
  const name = clean(mm[1]);
  let url = mm[2].trim();
  if(!/^https?:\/\//i.test(url)) continue;     // drop compressed placeholders / bad urls
  const cors = cells[cells.length-2];
  const https = cells[cells.length-3];
  const auth = cells[cells.length-4].replace(/`/g,'').trim();
  const desc = clean(cells.slice(2, cells.length-4).join(' | '));
  // validate the 3 flag columns look right, else it's a mis-split row
  if(!/^(Yes|No|Unknown)$/i.test(https)) continue;
  if(!/^(Yes|No|Unknown)$/i.test(cors)) continue;
  const key = url.toLowerCase();
  if(seen.has(key)) continue;
  if(skipCats.has(cat)) continue;
  seen.add(key);
  out.push({
    name,
    cat,
    desc: desc || name,
    auth: (/^no$/i.test(auth) || auth==='') ? 'No' : (/oauth/i.test(auth) ? 'OAuth' : 'apiKey'),
    https: /^yes$/i.test(https),
    cors: /^yes$/i.test(cors),
    url
  });
}

out.sort((a,b)=> a.cat===b.cat ? a.name.localeCompare(b.name) : a.cat.localeCompare(b.cat));

const body = out.map(a=>
  `  { name: "${a.name}", cat: "${a.cat}", desc: "${a.desc}", auth: "${a.auth}", https: ${a.https}, cors: ${a.cors}, url: "${a.url}" },`
).join('\n');
const block = `export const APIS = [\n${body}\n]`;

let data = fs.readFileSync(DATA, 'utf8');
const re = /export const APIS = \[[\s\S]*?\n\]/;
if(!re.test(data)){ console.error('APIS array not found in data.js'); process.exit(1); }
data = data.replace(re, block);
fs.writeFileSync(DATA, data);

const cats = [...new Set(out.map(a=>a.cat))].sort();
console.log('APIS entries:', out.length);
console.log('Categories:', cats.length);
console.log(cats.join(', '));
