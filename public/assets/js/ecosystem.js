// Curated, metadata-only catalog for ToolHub's AI ecosystem directory.
// This catalog intentionally links to upstream projects. It does not bundle or execute Skill scripts.
export const AI_STACK = [
  {name:"Dify", layer:"应用编排", kind:"开源 / 自托管", desc:"生产级 Agent 工作流、RAG、多模型与 API 发布。", url:"https://github.com/langgenius/dify", license:"Dify Open Source License", priority:"P0", tags:["RAG","workflow","API"]},
  {name:"Flowise", layer:"可视化编排", kind:"开源 / 自托管", desc:"用拖拽画布搭建 Agent 与 RAG 流程。", url:"https://github.com/FlowiseAI/Flowise", license:"查看项目许可", priority:"P0", tags:["low-code","agents","RAG"]},
  {name:"Langflow", layer:"可视化编排", kind:"开源 / 自托管", desc:"低代码构建 LangChain 工作流与原型。", url:"https://github.com/langflow-ai/langflow", license:"MIT", priority:"P1", tags:["LangChain","prototype"]},
  {name:"RAGFlow", layer:"RAG 应用", kind:"开源 / 自托管", desc:"面向复杂文档解析与有来源的知识库问答。", url:"https://github.com/infiniflow/ragflow", license:"Apache-2.0", priority:"P1", tags:["documents","citations","RAG"]},
  {name:"Open WebUI", layer:"聊天界面", kind:"开源 / 自托管", desc:"多模型聊天与知识库 UI，适合内部运营场景。", url:"https://github.com/open-webui/open-webui", license:"BSD-3-Clause", priority:"P1", tags:["chat","self-hosted"]},
  {name:"Firecrawl", layer:"爬取 / 抽取", kind:"开源 / API", desc:"将站点与文档转成适合 LLM 使用的内容。", url:"https://github.com/firecrawl/firecrawl", license:"查看项目许可", priority:"P0", tags:["crawl","extract","web"]},
  {name:"Qdrant", layer:"向量数据库", kind:"开源 / 自托管", desc:"高性能向量检索与元数据过滤。", url:"https://github.com/qdrant/qdrant", license:"Apache-2.0", priority:"P0", tags:["vector","search","RAG"]},
  {name:"Weaviate", layer:"向量数据库", kind:"开源 / 自托管", desc:"混合检索与可扩展向量数据库。", url:"https://github.com/weaviate/weaviate", license:"BSD-3-Clause", priority:"P1", tags:["vector","hybrid-search"]},
  {name:"pgvector", layer:"数据库扩展", kind:"开源", desc:"在既有 PostgreSQL 中实现向量相似度检索。", url:"https://github.com/pgvector/pgvector", license:"PostgreSQL License", priority:"P0", tags:["PostgreSQL","vector"]},
  {name:"LiteLLM", layer:"模型网关", kind:"开源 / 自托管", desc:"统一模型 API、预算、限额与故障回退。", url:"https://github.com/BerriAI/litellm", license:"MIT", priority:"P0", tags:["gateway","cost","routing"]},
  {name:"Ollama", layer:"本地模型运行", kind:"开源", desc:"开发期和隐私场景的本地模型运行环境。", url:"https://github.com/ollama/ollama", license:"MIT", priority:"P1", tags:["local","models"]},
  {name:"vLLM", layer:"高性能推理", kind:"开源", desc:"面向 GPU 批量请求的高性能 LLM 推理服务。", url:"https://github.com/vllm-project/vllm", license:"Apache-2.0", priority:"P2", tags:["GPU","inference"]},
  {name:"LangChain", layer:"模型编排库", kind:"开源", desc:"深度定制工具调用、RAG 与 LLM 应用。", url:"https://github.com/langchain-ai/langchain", license:"MIT", priority:"P1", tags:["framework","tools"]},
  {name:"LlamaIndex", layer:"模型编排库", kind:"开源", desc:"数据连接、索引与检索层。", url:"https://github.com/run-llama/llama_index", license:"MIT", priority:"P1", tags:["data","RAG"]},
  {name:"LangGraph", layer:"Agent 框架", kind:"开源", desc:"有状态、可中断、多步骤 Agent 工作流。", url:"https://github.com/langchain-ai/langgraph", license:"MIT", priority:"P1", tags:["agents","state"]},
  {name:"Langfuse", layer:"可观测 / 评测", kind:"开源 / 自托管", desc:"追踪、成本、提示词版本与 LLM 评测。", url:"https://github.com/langfuse/langfuse", license:"MIT", priority:"P0", tags:["observability","evals"]},
  {name:"Arize Phoenix", layer:"可观测 / 评测", kind:"开源", desc:"LLM Trace、评测与 RAG 分析。", url:"https://github.com/Arize-ai/phoenix", license:"Elastic-2.0", priority:"P1", tags:["tracing","RAG"]},
  {name:"n8n", layer:"自动化", kind:"源码可用 / 自托管", desc:"Webhook、CRM、邮件与人工审批自动化。", url:"https://github.com/n8n-io/n8n", license:"Sustainable Use License", priority:"P0", tags:["automation","webhooks"]},
  {name:"Model Context Protocol", layer:"模型服务标准", kind:"开放协议", desc:"让 Agent 在权限控制下连接工具与数据。", url:"https://modelcontextprotocol.io/", license:"开放规范", priority:"P0", tags:["MCP","tools","security"]}
];

export const SKILL_CAPABILITIES = [
  ["软件工程与代码质量","代码审查"],["软件工程与代码质量","调试"],["软件工程与代码质量","重构"],["软件工程与代码质量","单元 / 端到端测试"],["软件工程与代码质量","API 设计"],["软件工程与代码质量","性能分析"],
  ["Git 与交付","提交信息生成"],["Git 与交付","PR 描述"],["Git 与交付","变更日志"],["Git 与交付","发布 / CI 诊断"],
  ["前端与体验","UI/UX 评审"],["前端与体验","无障碍审计"],["前端与体验","设计系统"],["前端与体验","Web 应用测试"],
  ["后端与平台工程","Docker / Kubernetes"],["后端与平台工程","云部署"],["后端与平台工程","数据库迁移"],["后端与平台工程","可观测性"],
  ["安全、隐私与合规","安全审查"],["安全、隐私与合规","密钥扫描"],["安全、隐私与合规","依赖 / CVE 检查"],["安全、隐私与合规","隐私 / 合规审阅"],
  ["产品与增长","PRD 评审"],["产品与增长","用户研究"],["产品与增长","路线图"],["产品与增长","SEO / AEO"],["产品与增长","漏斗 / 指标诊断"],
  ["内容与品牌","品牌语气"],["内容与品牌","长文编辑"],["内容与品牌","社媒内容"],["内容与品牌","翻译与本地化"],
  ["研究与数据","深度研究"],["研究与数据","文献综述"],["研究与数据","市场研究"],["研究与数据","数据分析"],["研究与数据","引用 / 事实核查"],
  ["商业运营","客服回复"],["商业运营","销售研究"],["商业运营","CRM 记录"],["商业运营","财务 / 经营分析"],
  ["站点专属","商品 / 攻略问答 RAG"],["站点专属","订单与物流解释"],["站点专属","商品对比导购"],["站点专属","评价摘要与风险提示"]
].map(([category,name])=>({category,name}));

export const SKILL_SOURCES = [
  {name:"Anthropic Skills", count:"官方示例库", desc:"设计、技术测试、MCP、企业沟通与品牌。", url:"https://github.com/anthropics/skills", trust:"Official"},
  {name:"agentic-awesome-skills", count:"1,900+", desc:"跨 Agent 的 Skills、插件、工作流与安装器。", url:"https://github.com/sickn33/agentic-awesome-skills", trust:"Curated"},
  {name:"claude-skills", count:"355", desc:"工程、营销、产品、合规、研究、运营、财务。", url:"https://github.com/alirezarezvani/claude-skills", trust:"Curated"},
  {name:"TRAE-Skills", count:"150+", desc:"前后端、自动化、UI/UX、SEO 与 DevOps。", url:"https://github.com/HighMark-31/TRAE-Skills", trust:"Curated"},
  {name:"scientific-agent-skills", count:"科学研究", desc:"面向科研和科学工作流的 Agent Skills。", url:"https://github.com/K-Dense-AI/scientific-agent-skills", trust:"Curated"},
  {name:"awesome-copilot", count:"持续维护", desc:"GitHub Copilot 的指令、Agent、Skills 与配置。", url:"https://github.com/github/awesome-copilot", trust:"Official"}
];
