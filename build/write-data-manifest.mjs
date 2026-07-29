import { writeFile } from 'node:fs/promises';
import { AI_CATALOG } from '../public/assets/js/catalog.js';
import { FREE_LLM_PROVIDERS } from '../public/assets/js/freeapi.js';
import { SKILL_REGISTRY_SOURCES, SKILL_REGISTRY } from '../public/assets/js/skills-registry.js';
import { AI_MODELS, APIS } from '../public/assets/js/data.js';
const manifest={version:'1.0',generatedAt:new Date().toISOString(),datasets:{aiTools:{count:AI_CATALOG.length,source:'ToolHub catalog'},freeLlm:{count:FREE_LLM_PROVIDERS.length,sources:['cheahjs/free-llm-api-resources','mnfst/awesome-free-llm-apis','nejib1/Free-LLM','for-the-zero/Free-LLM-Collection','FreeLLM-API-KeyHub']},models:{count:AI_MODELS.length},publicApis:{count:APIS.length},skills:{localOrIndexed:SKILL_REGISTRY.length,upstreamSources:SKILL_REGISTRY_SOURCES.map(x=>({name:x.name,known:x.known,refresh:x.refresh,trust:x.trust}))}},verification:{freeLlm:'official page or upstream source',skills:'metadata first; unsafe content quarantined',githubRadar:'query/classification pipeline; persistent snapshots require D1/KV + Cron'}};
await writeFile('public/assets/data/data-manifest.json',JSON.stringify(manifest,null,2));
console.log('Wrote data manifest',manifest.datasets);
