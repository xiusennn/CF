// Normalized public-catalog expansion. Each record keeps a concise factual description
// and original catalog provenance; existing data.js entries are de-duplicated by URL/name.
import { AI_TOOLS } from "./data.js";

const rows = [];
const add = (cat, source, items) => items.forEach(([name, url, desc, open=false]) => rows.push({ name, url, desc, cat, open, source }));
const SRC = "公开 AI / 开源目录";

add("Chat", SRC, [
 ["Perplexity","https://www.perplexity.ai","联网检索与引用式回答的 AI 答案引擎。"],
 ["You.com","https://you.com","带 AI 对话、研究与搜索模式的搜索平台。"],
 ["Pi","https://pi.ai","Inflection 的个人对话型 AI 助手。"],
 ["Character.AI","https://character.ai","面向角色和社区对话的 AI 平台。"],
 ["OpenRouter","https://openrouter.ai","通过统一 API 使用多家模型的路由平台。"],
 ["LM Studio","https://lmstudio.ai","在桌面设备本地下载和运行大语言模型。"],
 ["Jan","https://jan.ai","本地优先的开源 AI 助手与模型客户端。",true],
 ["Open WebUI","https://github.com/open-webui/open-webui","可自托管的本地 LLM Web 界面，支持 Ollama 与 OpenAI 兼容 API。",true],
 ["LibreChat","https://github.com/danny-avila/LibreChat","支持多模型与插件的开源聊天界面。",true],
 ["LobeChat","https://lobechat.com","支持插件、知识库和多模型的开源聊天框架。",true],
 ["Chatbox","https://chatboxai.app","支持多模型 API 的桌面 AI 客户端。",true],
 ["AnythingLLM","https://anythingllm.com","面向文档、RAG 和本地模型的一体化 AI 工作台。",true]
]);
add("Agents", SRC, [
 ["LangChain","https://www.langchain.com","构建 LLM 应用、检索与工具调用的开发框架。",true],
 ["LangGraph","https://langchain-ai.github.io/langgraph","用于有状态、多步骤 Agent 的图式编排框架。",true],
 ["CrewAI","https://www.crewai.com","为多角色协作任务构建 AI Agent 团队。",true],
 ["AutoGen","https://microsoft.github.io/autogen","微软开源的多 Agent 对话与工作流框架。",true],
 ["Semantic Kernel","https://learn.microsoft.com/semantic-kernel","微软的 AI 编排 SDK，支持插件和 Agent。",true],
 ["PydanticAI","https://ai.pydantic.dev","强调类型安全与可观测性的 Python Agent 框架。",true],
 ["Haystack","https://haystack.deepset.ai","用于生产级 RAG、搜索与 Agent 管道的框架。",true],
 ["LlamaIndex","https://www.llamaindex.ai","连接私有数据与 LLM 的数据框架。",true],
 ["OpenAI Agents SDK","https://openai.github.io/openai-agents-python","用于工具、交接和追踪的轻量 Agent SDK。",true],
 ["Google ADK","https://google.github.io/adk-docs","Google 的 Agent Development Kit。",true],
 ["Agno","https://www.agno.com","用于构建多模态 Agent 的开源框架。",true],
 ["Mastra","https://mastra.ai","TypeScript 的 Agent、工作流和 RAG 框架。",true],
 ["smolagents","https://huggingface.co/docs/smolagents","Hugging Face 的轻量级代码 Agent 库。",true],
 ["CAMEL","https://www.camel-ai.org","用于研究多 Agent 社会与协作的开源框架。",true],
 ["MetaGPT","https://github.com/FoundationAgents/MetaGPT","用软件团队角色协作完成开发任务的多 Agent 框架。",true],
 ["OpenHands","https://www.all-hands.dev","开源软件开发 Agent，可在隔离环境执行任务。",true],
 ["browser-use","https://github.com/browser-use/browser-use","让 AI Agent 理解并操作浏览器的开源库。",true],
 ["AutoGPT","https://agpt.co","自主任务执行型 Agent 平台。",true],
 ["Dify","https://dify.ai","可视化构建 AI 应用、工作流和知识库的平台。",true],
 ["Flowise","https://flowiseai.com","低代码搭建 LLM 应用与 Agent 流程。",true],
 ["FastGPT","https://fastgpt.io","面向知识库问答与工作流的开源 RAG 平台。",true],
 ["Coze","https://www.coze.com","字节跳动的 Bot 与 Agent 应用构建平台。"],
 ["n8n","https://n8n.io","可自托管的工作流自动化平台，支持 AI 节点。",true]
]);
add("Coding", SRC, [
 ["Claude Code","https://docs.anthropic.com/en/docs/claude-code","Anthropic 的终端编码 Agent。"],
 ["Codex CLI","https://github.com/openai/codex","OpenAI 的终端代码 Agent。",true],
 ["Windsurf","https://windsurf.com","带 Agent 工作流的 AI 编程环境。"],
 ["Aider","https://aider.chat","在 Git 仓库中与多种 LLM 协作编码的终端工具。",true],
 ["Continue","https://www.continue.dev","可连接本地或云模型的开源 IDE 编程助手。",true],
 ["Cline","https://cline.bot","VS Code 中可使用工具与终端的开源编码 Agent。",true],
 ["Roo Code","https://roocode.com","开源 VS Code Agent，支持多种模式与模型。",true],
 ["OpenCode","https://opencode.ai","开源终端 AI 编程 Agent。",true],
 ["GitHub Copilot","https://github.com/features/copilot","GitHub 的代码补全、对话与编码 Agent。"],
 ["Amazon Q Developer","https://aws.amazon.com/q/developer","AWS 面向开发者的 AI 助手。"],
 ["JetBrains AI Assistant","https://www.jetbrains.com/ai","JetBrains IDE 内置 AI 编码与协作功能。"],
 ["Tabnine","https://www.tabnine.com","强调企业隐私和代码补全的 AI 编程助手。"],
 ["Sourcegraph Cody","https://sourcegraph.com/cody","面向大型代码库理解与检索的 AI 助手。"],
 ["Devin","https://devin.ai","Cognition 的软件工程 Agent。"],
 ["Sweep","https://sweep.dev","将 GitHub issue 转为代码修改的 AI 工程工具。"],
 ["v0","https://v0.dev","用自然语言生成 React 界面和应用原型。"],
 ["Bolt.new","https://bolt.new","浏览器内生成并运行全栈 Web 应用。"],
 ["Lovable","https://lovable.dev","通过对话构建 Web 应用与产品原型。"],
 ["Replit Agent","https://replit.com","在 Replit 中从描述生成和部署应用。"],
 ["Firebase Studio","https://firebase.studio","Google 的云端全栈 AI 应用开发环境。"]
]);
add("Image", SRC, [
 ["Adobe Firefly","https://firefly.adobe.com","Adobe 的图像、矢量和创意生成工具。"],
 ["Ideogram","https://ideogram.ai","擅长图片中文字和海报排版的图像模型。"],
 ["Leonardo AI","https://leonardo.ai","面向设计与资产生产的 AI 图像平台。"],
 ["Recraft","https://www.recraft.ai","用于矢量、插画、图标和品牌视觉的生成工具。"],
 ["Krea","https://www.krea.ai","提供实时生成与视觉增强的创意平台。"],
 ["Playground AI","https://playground.com","在线 AI 图像创作和编辑平台。"],
 ["Stable Diffusion WebUI","https://github.com/AUTOMATIC1111/stable-diffusion-webui","本地运行 Stable Diffusion 的广泛使用界面。",true],
 ["ComfyUI","https://www.comfy.org","基于节点工作流的开源图像与视频生成界面。",true],
 ["Fooocus","https://github.com/lllyasviel/Fooocus","简化本地图像生成配置的开源工具。",true],
 ["InvokeAI","https://invoke.ai","面向创意工作流的开源 Stable Diffusion 平台。",true],
 ["Krita AI Diffusion","https://github.com/Acly/krita-ai-diffusion","在 Krita 中使用本地生成式图像模型的插件。",true],
 ["Clipdrop","https://clipdrop.co","提供抠图、重绘、放大等 AI 图像编辑工具。"],
 ["Photoroom","https://www.photoroom.com","面向商品图和背景处理的 AI 图片工具。"],
 ["Magnific","https://magnific.ai","AI 图像放大与细节增强工具。"],
 ["Topaz Photo AI","https://www.topazlabs.com/topaz-photo-ai","照片降噪、锐化和放大的 AI 桌面工具。"]
]);
add("Video", SRC, [
 ["Runway","https://runwayml.com","生成、编辑和特效合一的 AI 视频平台。"],
 ["Kling AI","https://klingai.com","快手推出的文生视频与图生视频工具。"],
 ["Hailuo AI","https://hailuoai.video","MiniMax 的 AI 视频生成平台。"],
 ["Luma Dream Machine","https://lumalabs.ai/dream-machine","Luma 的视频生成与三维创作平台。"],
 ["Pika","https://pika.art","面向短视频、特效和图生视频的 AI 工具。"],
 ["Google Veo","https://deepmind.google/models/veo","Google DeepMind 的视频生成模型。"],
 ["Sora","https://openai.com/sora","OpenAI 的视频生成产品。"],
 ["HeyGen","https://www.heygen.com","数字人、视频翻译和口型同步平台。"],
 ["Synthesia","https://www.synthesia.io","企业 AI 数字人讲解视频工具。"],
 ["Descript","https://www.descript.com","基于文本编辑音视频的创作工具。"],
 ["OpusClip","https://www.opus.pro","将长视频自动剪成短视频的 AI 工具。"],
 ["CapCut","https://www.capcut.com","剪映 / CapCut 的 AI 视频编辑功能。"],
 ["Viggle","https://viggle.ai","基于角色动作控制的 AI 视频生成工具。"],
 ["Vidu","https://www.vidu.com","生数科技的 AI 视频生成平台。"]
]);
add("Audio", SRC, [
 ["ElevenLabs","https://elevenlabs.io","高保真语音合成、配音和语音克隆平台。"],
 ["Suno","https://suno.com","根据文字生成歌曲和音乐的 AI 产品。"],
 ["Udio","https://www.udio.com","AI 音乐创作和编辑平台。"],
 ["Stable Audio","https://www.stableaudio.com","Stability AI 的音乐和声音生成工具。"],
 ["AIVA","https://www.aiva.ai","面向配乐创作的 AI 音乐工具。"],
 ["Mubert","https://mubert.com","生成免版税背景音乐的 AI 平台。"],
 ["Adobe Podcast","https://podcast.adobe.com","语音增强与播客音频处理工具。"],
 ["Whisper","https://github.com/openai/whisper","OpenAI 开源语音识别模型。",true],
 ["WhisperX","https://github.com/m-bain/whisperX","带时间对齐和说话人标注的 Whisper 扩展。",true],
 ["Coqui TTS","https://github.com/coqui-ai/TTS","开源语音合成工具包。",true]
]);
add("Writing", SRC, [
 ["Jasper","https://www.jasper.ai","面向营销团队的 AI 写作与品牌内容平台。"],
 ["Copy.ai","https://www.copy.ai","营销文案和销售工作流 AI 工具。"],
 ["Writesonic","https://writesonic.com","AI 写作、SEO 和内容生成平台。"],
 ["Grammarly","https://www.grammarly.com","语法、语气和写作辅助工具。"],
 ["Wordtune","https://www.wordtune.com","改写、扩写和摘要 AI 写作工具。"],
 ["QuillBot","https://quillbot.com","改写、语法和摘要工具。"],
 ["Sudowrite","https://www.sudowrite.com","面向小说和创意写作的 AI 辅助工具。"],
 ["Rytr","https://rytr.me","多场景短文案 AI 写作助手。"],
 ["Notion AI","https://www.notion.so/product/ai","Notion 内的写作、问答和知识库功能。"],
 ["Lex","https://lex.page","强调无干扰写作的 AI 文档编辑器。"]
]);
add("Research", SRC, [
 ["Elicit","https://elicit.com","面向研究问题和文献综述的 AI 助手。"],
 ["Consensus","https://consensus.app","基于学术论文检索回答研究问题。"],
 ["Scite","https://scite.ai","通过引用上下文辅助评估科研论文。"],
 ["Research Rabbit","https://www.researchrabbit.ai","可视化探索论文、作者和引用网络。"],
 ["Connected Papers","https://www.connectedpapers.com","通过论文关系图发现相关研究。"],
 ["Semantic Scholar","https://www.semanticscholar.org","提供论文检索与引用信息的学术搜索引擎。"],
 ["NotebookLM","https://notebooklm.google","基于用户上传来源进行问答与摘要的研究笔记工具。"],
 ["SciSpace","https://scispace.com","辅助阅读、理解和写作学术论文的平台。"],
 ["Paperpal","https://paperpal.com","学术写作、语言润色和投稿辅助工具。"],
 ["Zotero","https://www.zotero.org","开源文献管理与引用工具。",true]
]);
add("Models", SRC, [
 ["Hugging Face","https://huggingface.co","开源模型、数据集和 AI 应用社区平台。"],
 ["Ollama","https://ollama.com","在本地运行和管理开源模型的工具。",true],
 ["vLLM","https://github.com/vllm-project/vllm","高吞吐 LLM 推理与服务引擎。",true],
 ["SGLang","https://github.com/sgl-project/sglang","高性能 LLM 和多模态推理框架。",true],
 ["Together AI","https://www.together.ai","提供开源模型推理与微调 API 的平台。"],
 ["Replicate","https://replicate.com","用 API 运行开源模型的平台。"],
 ["Fireworks AI","https://fireworks.ai","面向快速模型推理与微调的 AI 云平台。"],
 ["GroqCloud","https://console.groq.com","低延迟 LLM 推理 API 平台。"],
 ["Modal","https://modal.com","用于 GPU、批处理和 AI 应用的无服务器云。"],
 ["BentoML","https://www.bentoml.com","打包、部署和服务机器学习模型的平台。",true]
]);
add("MCP", SRC, [
 ["MCP Registry","https://registry.modelcontextprotocol.io","Model Context Protocol 的官方服务器注册表。"],
 ["Smithery","https://smithery.ai","发现和部署 MCP 服务器的平台。"],
 ["MCP.so","https://mcp.so","MCP 服务器目录与发现站。"],
 ["Glama MCP Servers","https://glama.ai/mcp/servers","MCP 服务发现、文档与安装目录。"],
 ["FastMCP","https://gofastmcp.com","快速构建 Python MCP 服务器的框架。",true],
 ["MCP Inspector","https://github.com/modelcontextprotocol/inspector","调试和测试 MCP 服务器的官方工具。",true],
 ["awesome-mcp-servers","https://github.com/punkpeye/awesome-mcp-servers","社区维护的 MCP 服务器集合。",true]
]);
add("Security", SRC, [
 ["Promptfoo","https://www.promptfoo.dev","LLM 评测、红队测试和提示词安全测试工具。",true],
 ["Garak","https://github.com/NVIDIA/garak","开源 LLM 漏洞扫描器和红队工具。",true],
 ["PyRIT","https://github.com/Azure/PyRIT","微软开源的生成式 AI 风险识别框架。",true],
 ["Lakera Guard","https://www.lakera.ai","提示词注入和敏感数据防护服务。"],
 ["Llama Guard","https://www.llama.com/llama-guard","Meta 的开源内容安全与风险分类模型系列。",true],
 ["NVIDIA NeMo Guardrails","https://github.com/NVIDIA-NeMo/Guardrails","为 LLM 应用定义安全与对话边界的开源工具。",true]
]);
add("Productivity", SRC, [
 ["Gamma","https://gamma.app","用 AI 快速制作演示、文档和网页。"],
 ["Beautiful.ai","https://www.beautiful.ai","AI 辅助的演示文稿制作平台。"],
 ["Tome","https://tome.app","叙事型演示与内容创作工具。"],
 ["Canva Magic Studio","https://www.canva.com/magic-studio","Canva 内集成的生成式设计功能。"],
 ["Figma AI","https://www.figma.com/ai","Figma 中的界面生成、编辑与协作 AI 能力。"],
 ["Miro AI","https://miro.com/ai","Miro 白板中的总结、聚类和内容生成工具。"],
 ["Tana","https://tana.inc","结构化笔记、知识图谱和 AI 工作流工具。"],
 ["Mem","https://mem.ai","强调自动组织与检索的 AI 笔记工具。"],
 ["Glean","https://www.glean.com","企业内部知识搜索与 AI 助手。"],
 ["Granola","https://www.granola.ai","自动整理会议笔记的 AI 工具。"]
]);

const key = (x) => String(x.url || x.name).trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const seen = new Set();
export const AI_CATALOG = [...AI_TOOLS, ...rows].filter((x) => {
  const k = key(x); if (seen.has(k)) return false; seen.add(k); return true;
});
export const AI_CATALOG_IMPORT_COUNT = AI_CATALOG.length - AI_TOOLS.length;
