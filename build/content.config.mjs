export const USE_CASES = [
  { id:"write", icon:"✍️", title:"写出更好的内容", desc:"从研究、提纲到发布，把写作流程交给 AI。", tags:["AI writing","SEO","editing"], href:"/workflows.html#content" },
  { id:"design", icon:"✦", title:"设计与视觉创作", desc:"找灵感、生成图像、整理素材，再完成交付。", tags:["image","UI","brand"], href:"/workflows.html#design" },
  { id:"build", icon:"⌘", title:"构建并发布产品", desc:"从想法、原型到代码和上线的一套工具链。", tags:["coding","product","deploy"], href:"/workflows.html#build" },
  { id:"research", icon:"◌", title:"快速研究与学习", desc:"收集来源、验证观点、把复杂问题讲清楚。", tags:["research","learn","notes"], href:"/workflows.html#research" },
  { id:"operate", icon:"↗", title:"自动化日常工作", desc:"处理表格、文档、沟通和重复性的运营事务。", tags:["office","ops","automation"], href:"/workflows.html#operate" },
  { id:"api", icon:"{ }", title:"发现免费 API", desc:"按认证、HTTPS 与 CORS 条件寻找可用接口。", tags:["developer","data","API"], href:"/tools/free-api-directory.html" },
];

export const WORKFLOWS = [
  { id:"content", num:"01", title:"从空白到发布一篇内容", desc:"适合博客、社媒、产品文案与知识型内容。", outcome:"一篇有明确受众、结构和可发布版本的内容", steps:[
    ["研究","用 Perplexity 或搜索工具收集 3–5 个可靠来源。"],
    ["提纲","用“研究型文章结构师”提示词搭建读者问题与章节。"],
    ["初稿","用写作工具生成版本，再用清晰度改写提示词做一轮压缩。"],
    ["发布检查","用字数、可读性、UTM 和 Meta Tag 工具完成交付。"]
  ], links:["/tools/prompt-library.html","/tools/word-counter.html","/tools/meta-tag-generator.html"] },
  { id:"design", num:"02", title:"把想法变成视觉方案", desc:"适合落地页、海报、UI 概念和品牌素材。", outcome:"一套可评审的视觉方向与规范化导出文件", steps:[
    ["定义方向","明确受众、场景、情绪与视觉禁区。"],
    ["生成与筛选","在 AI 工具目录中选择图像或设计工具，先生成多个方向。"],
    ["建立系统","用调色板、对比度、渐变和圆角工具统一基础样式。"],
    ["交付","压缩、裁剪并转换文件，保证质量和体积。"]
  ], links:["/tools/ai-tools-directory.html","/tools/palette-generator.html","/tools/contrast-checker.html","/tools/image-compressor.html"] },
  { id:"build", num:"03", title:"从产品想法到可发布原型", desc:"适合独立开发、内部工具与小型产品实验。", outcome:"可运行的原型、干净的数据接口和发布检查清单", steps:[
    ["拆解需求","用产品经理提示词把想法拆成用户、流程、边界与验收标准。"],
    ["实现","选择 AI 编程助手；使用 JSON、正则、UUID 和假数据工具加速开发。"],
    ["接入数据","从 API 目录按认证、HTTPS、CORS 条件筛选服务。"],
    ["上线检查","生成 Meta、robots、UTM；用文本差异检查发布说明。"]
  ], links:["/tools/prompt-library.html","/tools/json-formatter.html","/tools/fake-data.html","/tools/free-api-directory.html"] },
  { id:"research", num:"04", title:"把复杂主题研究清楚", desc:"适合市场调查、竞品研究、学习与决策前准备。", outcome:"可追溯的研究笔记、结论和下一步建议", steps:[
    ["定义问题","写下要决定什么、证据标准和不研究什么。"],
    ["建立来源表","先找一手资料，再补行业分析；记录出处和日期。"],
    ["提炼","使用提示词把证据与观点分开，标注不确定项。"],
    ["输出","用一页摘要呈现结论、反例、风险与建议。"]
  ], links:["/tools/prompt-library.html","/tools/text-diff.html","/tools/word-frequency.html"] },
  { id:"operate", num:"05", title:"把重复工作变成可复用流程", desc:"适合运营、行政、销售支持与资料处理。", outcome:"一套可复制的模板、数据格式与核对步骤", steps:[
    ["收集","把原始资料统一成 CSV 或 JSON。"],
    ["清洗","去重、查找替换、格式化字段并验证输入。"],
    ["生成","用提示词输出邮件、摘要、表格字段或任务清单。"],
    ["复盘","记录耗时、错误点与下一次可自动化的环节。"]
  ], links:["/tools/csv-to-json.html","/tools/remove-duplicates.html","/tools/find-replace.html","/tools/prompt-library.html"] }
];

export const LEARNING = [
  { level:"入门", time:"5 分钟", title:"如何判断一个 AI 工具是否值得使用", text:"先看任务匹配、输出可控性、数据边界、价格与迁移成本。工具多并不等于工作流更好。", href:"/workflows.html#research" },
  { level:"提示词", time:"8 分钟", title:"高质量提示词的四段式结构", text:"角色、目标、上下文、输出格式。给模型明确的判断标准，而不是只给一个命令。", href:"/tools/prompt-library.html" },
  { level:"构建", time:"6 分钟", title:"选择 API 前必须检查的三件事", text:"认证方式、跨域限制和可维护性；免费 API 的限制与稳定性必须在接入前验证。", href:"/tools/free-api-directory.html" },
  { level:"隐私", time:"3 分钟", title:"哪些工作应优先在浏览器本地完成", text:"密码、源文件、私人文本与敏感数据，优先使用 ToolHub 的本地处理工具。", href:"/about.html" }
];

export const EDITOR_PICKS = [
  { kind:"AI", name:"Cursor", why:"适合需要理解代码库、持续迭代的开发工作流。", href:"https://cursor.com", icon:"C" },
  { kind:"AI", name:"Perplexity", why:"适合带来源的快速研究；仍需回到原始资料验证。", href:"https://www.perplexity.ai", icon:"P" },
  { kind:"Tool", name:"JSON Repair", why:"把常见的模型输出 JSON 问题快速修复为可用数据。", href:"/tools/json-repair.html", icon:"{ }" },
  { kind:"Tool", name:"Image Compressor", why:"本地压缩交付资源，保护文件隐私且无需登录。", href:"/tools/image-compressor.html", icon:"◈" }
];
