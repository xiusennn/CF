// GitHub AI Project Radar pipeline contract.
// Scheduler/persistence adapter: call collectRadar() from a Cron Trigger and store snapshots in D1/KV.
export const RADAR_QUERIES=[
 {id:'agents',q:'topic:ai-agent OR topic:agentic-ai pushed:>=DATE'},
 {id:'llm',q:'topic:llm OR topic:large-language-model pushed:>=DATE'},
 {id:'mcp',q:'topic:model-context-protocol OR topic:mcp pushed:>=DATE'},
 {id:'rag',q:'topic:rag OR topic:retrieval-augmented-generation pushed:>=DATE'},
 {id:'coding',q:'topic:ai-coding OR topic:coding-agent pushed:>=DATE'},
 {id:'inference',q:'topic:llm-inference OR topic:inference-engine pushed:>=DATE'},
 {id:'vision',q:'topic:generative-ai OR topic:image-generation OR topic:video-generation pushed:>=DATE'}
];
const RULES=[['MCP',/\bmcp\b|model context protocol/i],['RAG',/\brag\b|retrieval|vector database|embedding/i],['Agent',/agent|multi-agent|autonomous/i],['AI 编程',/coding agent|code assistant|copilot|developer tools/i],['模型推理',/inference|vllm|ollama|serving/i],['图像与视频',/image generation|video generation|diffusion|vision/i],['模型与框架',/llm|large language model|transformer|generative ai/i]];
export function classifyProject(repo){const text=[repo.name,repo.description,(repo.topics||[]).join(' ')].join(' ');const hits=RULES.filter(([,re])=>re.test(text)).map(([x])=>x);return {category:hits[0]||'待复核',tags:hits,confidence:hits.length?Math.min(0.95,0.55+hits.length*.15):0.2};}
export function normalizeProject(repo,previous){const c=classifyProject(repo);const stars=repo.stargazers_count||0;const before=previous?.stars||stars;return {id:repo.full_name.toLowerCase(),fullName:repo.full_name,url:repo.html_url,description:repo.description||'',stars,starDelta:Math.max(0,stars-before),forks:repo.forks_count||0,topics:repo.topics||[],updatedAt:repo.pushed_at,createdAt:repo.created_at,category:c.category,tags:c.tags,confidence:c.confidence,status:c.confidence<0.55?'待复核':'已分类',source:'GitHub Search API'};}
