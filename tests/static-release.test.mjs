// Validates the generated public release without a server.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sep } from 'node:path';
const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const SITE=(process.env.SITE_URL||'https://tool.cnagt.com').replace(/\/$/,'');
const errors=[]; let pages=0; let links=0;
async function walk(dir){const out=[];for(const name of await readdir(dir)){const full=join(dir,name);const info=await stat(full);if(info.isDirectory())out.push(...await walk(full));else out.push(full)}return out}
const files=await walk(PUBLIC); const html=files.filter(x=>x.endsWith('.html'));
for(const file of html){pages++;const text=await readFile(file,'utf8');
  if(!text.includes('<meta name="description"')) errors.push(`${file}: missing description`);
  if(!text.includes(`<link rel="canonical" href="${SITE}`)) errors.push(`${file}: wrong canonical`);
  if(text.includes('<><')||text.includes('</>')) errors.push(`${file}: malformed fragment`);
  for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1];if(!value.startsWith('/')||value.startsWith('//'))continue;
    links++;const bare=value.split(/[?#]/)[0];if(!bare||bare==='/')continue;
    let target=normalize(join(PUBLIC,bare));if(bare.endsWith('/'))target=join(target,'index.html');
    // extensionless URLs are served from the matching .html file
    try{await stat(target)}catch{target=target+'.html'}
    try{await stat(target)}catch{errors.push(`${file.replace(PUBLIC,'').split(sep).join('/')}: missing ${bare}`)}
  }
}
for(const must of ['tools.html','privacy.html','terms.html','data-policy.html','status.html','contact.html','sitemap.xml','robots.txt']){try{await stat(join(PUBLIC,must))}catch{errors.push(`missing required ${must}`)}}
if(errors.length){console.error('STATIC RELEASE AUDIT FAILED\n- '+errors.join('\n- '));process.exit(1)}
console.log(`STATIC RELEASE AUDIT: ${pages} HTML pages, ${links} local references, 0 broken`);
