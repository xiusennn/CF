import { readFile, access } from 'node:fs/promises';
import { FREE_LLM_PROVIDERS } from '../public/assets/js/freeapi.js';
import { AI_CATALOG } from '../public/assets/js/catalog.js';
import { generateQualityPrompt } from '../public/assets/js/prompt-engine-v3.js';
const fail=[]; const ok=(b,m)=>b?console.log('OK',m):fail.push(m);
for(const f of ['src/github-radar-pipeline.js','build/sync-free-llm.mjs','public/assets/data/skills-safety-policy.json','public/assets/data/data-manifest.json','.github/workflows/sync-free-llm.yml']){try{await access(f);console.log('OK file',f)}catch{fail.push('missing '+f)}}
ok(FREE_LLM_PROVIDERS.every(x=>x.name&&x.url&&x.type&&x.region&&x.models&&x.limits),'free LLM provider schema');
ok(AI_CATALOG.length>=400,'AI catalog minimum size');
const sparse=generateQualityPrompt({taskType:'通用提示词生成',goal:'写报告'});ok(!sparse.passed&&sparse.score<95,'prompt gate blocks sparse input');
let workflow=''; try{workflow=await readFile('.github/workflows/sync-free-llm.yml','utf8')}catch{fail.push('missing .github/workflows/sync-free-llm.yml')} ok(workflow && !workflow.includes('$ secrets.'),'workflow has no malformed secret expression');
const page=await readFile('public/index.html','utf8');ok(page.includes('用 AI 做内容')&&page.includes('用 AI 做产品与开发')&&page.includes('找可信的 AI 工具与 Skills'),'homepage has three result-first workbench paths');
const toolsPage=await readFile('public/tools.html','utf8');ok(toolsPage.includes('全部工具')&&toolsPage.includes('tool-index-card'),'complete tool index exists');
for(const f of ['public/workspace-content.html','public/workspace-dev.html','public/workspace-skills.html','public/assets/js/workbench.js','public/privacy.html','public/terms.html','public/data-policy.html','public/status.html','public/contact.html']){try{await access(f);console.log('OK file',f)}catch{fail.push('missing '+f)}}
if(fail.length){console.error('SELFCHECK FAIL',fail);process.exit(1)} console.log('SELFCHECK PASS');
