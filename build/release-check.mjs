import { access, readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { checkCloudflareBudget, CF_FREE } from './repo-policy.mjs';
const fail=[]; const ok=(condition,message)=>condition?console.log('OK',message):fail.push(message);
const site=(process.env.SITE_URL||'https://tool.cnagt.com').replace(/\/$/,'');
const contact=(process.env.CONTACT_EMAIL||'admin@cnagt.com').trim();
ok(/^https:\/\/[^/]+/.test(site) && !site.includes('workers.dev'),'SITE_URL is a custom HTTPS domain');
ok(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact),'CONTACT_EMAIL is configured');
for(const file of ['public/privacy.html','public/terms.html','public/data-policy.html','public/status.html','public/contact.html','docs/LAUNCH.md','docs/OPERATIONS.md']){try{await access(file);console.log('OK file',file)}catch{fail.push('missing '+file)}}
const worker=await readFile('src/index.js','utf8'); ok(worker.includes('Content-Security-Policy')&&worker.includes('UPSTREAM_TIMEOUT_MS'),'Worker has security headers and upstream timeouts');

// Cloudflare free tier: 20,000 static assets, 25 MiB each. A build that busts
// either limit fails to deploy, so the gate runs before we ever upload.
async function walk(dir){let files=0,largest=0,largestFile='';for(const entry of await readdir(dir,{withFileTypes:true})){const full=join(dir,entry.name);if(entry.isDirectory()){const sub=await walk(full);files+=sub.files;if(sub.largest>largest){largest=sub.largest;largestFile=sub.largestFile}}else{files++;const size=(await stat(full)).size;if(size>largest){largest=size;largestFile=full}}}return{files,largest,largestFile}}
const assets=await walk('public');
const budget=checkCloudflareBudget({files:assets.files,largestBytes:assets.largest});
ok(budget.ok,`Cloudflare free tier: ${assets.files} assets (limit ${CF_FREE.MAX_FILES}, headroom ${budget.headroom}), largest ${(assets.largest/1048576).toFixed(2)} MiB ← ${assets.largestFile}`);
for(const problem of budget.problems) fail.push('Cloudflare budget: '+problem);
if(fail.length){console.error('RELEASE CHECK FAILED:\n- '+fail.join('\n- '));process.exit(1)}
console.log('RELEASE CHECK PASSED');
