// Single source of truth for the tool catalog. build.mjs turns this into pages.
// category ids map to homepage sections. `ui` handlers live in ui.js.
export const CATEGORIES = [
  { id: "text", name: "文本与数据", emoji: "\uD83D\uDCDD" },
  { id: "dev", name: "开发者", emoji: "\u26A1" },
  { id: "ai", name: "AI 与提示词", emoji: "🤖" },
  { id: "convert", name: "换算与单位", emoji: "\uD83D\uDD01" },
  { id: "image", name: "图像", emoji: "\uD83D\uDDBC\uFE0F" },
  { id: "color", name: "颜色与设计", emoji: "\uD83C\uDFA8" },
  { id: "seo", name: "网站与 SEO", emoji: "\uD83D\uDD0D" },
  { id: "calc", name: "计算器", emoji: "\uD83D\uDCCA" },
];

export const TOOLS = [
  // ---------- Text & Data ----------
  { id: "word-counter", cat: "text", emoji: "\uD83D\uDD22", name: "字数与字符统计", desc: "实时统计字数、字符、句子、段落与阅读时长。", kw: "word count character counter reading time", tag: "热门" },
  { id: "case-converter", cat: "text", emoji: "\uD83D\uDD24", name: "大小写转换", desc: "支持大写、小写、标题、句首、camelCase、snake_case、kebab 等多种格式。", kw: "case converter uppercase lowercase title camel snake" },
  { id: "remove-duplicates", cat: "text", emoji: "\uD83E\uDDF9", name: "删除重复行", desc: "即时去重并排序列表，支持去空格与忽略大小写。", kw: "remove duplicate lines dedupe sort list" },
  { id: "find-replace", cat: "text", emoji: "\uD83D\uDD0E", name: "查找与替换", desc: "支持普通或正则匹配替换文本，可忽略大小写。", kw: "find replace text regex substitute" },
  { id: "reverse-text", cat: "text", emoji: "\u21C4", name: "文本反转", desc: "按字符、单词或行反转任意文本。", kw: "reverse text characters words lines flip" },
  { id: "whitespace-remover", cat: "text", emoji: "\u2702\uFE0F", name: "空白清理", desc: "去除行首尾空格、合并多余空格并删除空行。", kw: "remove whitespace trim spaces blank lines" },
  { id: "text-repeater", cat: "text", emoji: "\uD83D\uDD01", name: "文本重复生成", desc: "按自定义分隔符将文本重复 N 次。", kw: "repeat text duplicate string generator" },
  { id: "word-frequency", cat: "text", emoji: "\uD83D\uDCCA", name: "词频统计", desc: "统计每个词出现的次数并按词频排序。", kw: "word frequency counter keyword density" },
  { id: "rot13", cat: "text", emoji: "\uD83D\uDD13", name: "ROT13 / 凯撒密码", desc: "用 ROT13 或自定义位移对文本进行编码/解码。", kw: "rot13 caesar cipher shift encode" },
  { id: "lorem-ipsum", cat: "text", emoji: "\uD83D\uDCC4", name: "Lorem Ipsum 占位文本", desc: "为原型与排版生成占位段落文本。", kw: "lorem ipsum placeholder text generator" },
  { id: "text-diff", cat: "text", emoji: "\uD83D\uDD00", name: "文本差异对比", desc: "逐行对比两段文本并高亮差异。", kw: "text diff compare difference checker" },

  // ---------- Developer ----------
  { id: "json-formatter", cat: "dev", emoji: "{ }", name: "JSON 格式化与校验", desc: "美化、压缩并校验 JSON，错误信息清晰。", kw: "json formatter beautify validate minify", tag: "热门" },
  { id: "json-to-csv", cat: "dev", emoji: "\uD83D\uDCD1", name: "JSON 转 CSV", desc: "将 JSON 对象数组转换为整洁的 CSV。", kw: "json to csv convert export" },
  { id: "csv-to-json", cat: "dev", emoji: "\uD83D\uDCC4", name: "CSV 转 JSON", desc: "将带表头的 CSV 转换为 JSON 对象数组。", kw: "csv to json convert parse" },
  { id: "base64", cat: "dev", emoji: "\uD83D\uDD11", name: "Base64 编码 / 解码", desc: "在浏览器中进行支持 Unicode 的 Base64 编解码。", kw: "base64 encode decode" },
  { id: "url-encode", cat: "dev", emoji: "\uD83D\uDD17", name: "URL 编码 / 解码", desc: "安全地编码或解码 URL 及查询参数。", kw: "url encode decode percent encoding" },
  { id: "html-entities", cat: "dev", emoji: "\uD83D\uDD24", name: "HTML 实体编码 / 解码", desc: "转义或还原 &、< 等 HTML 实体。", kw: "html entities encode decode escape" },
  { id: "jwt-decoder", cat: "dev", emoji: "\uD83C\uDFAB", name: "JWT 解码器", desc: "解码 JWT 的头部与载荷并检查过期时间。", kw: "jwt decoder token json web token debug", tag: "热门" },
  { id: "hash-generator", cat: "dev", emoji: "#\uFE0F\u20E3", name: "哈希生成器", desc: "基于 WebCrypto 生成 SHA-1/256/384/512 哈希。", kw: "hash sha256 sha1 sha512 generator" },
  { id: "uuid-generator", cat: "dev", emoji: "\uD83C\uDD94", name: "UUID 生成器", desc: "批量生成加密随机的 v4 UUID。", kw: "uuid guid generator v4" },
  { id: "number-base", cat: "dev", emoji: "\uD83D\uDD22", name: "进制转换", desc: "在二、八、十与十六进制间转换（2–36 进制）。", kw: "number base binary hex octal decimal converter" },
  { id: "query-parser", cat: "dev", emoji: "\u2753", name: "查询字符串解析", desc: "将 URL 查询字符串解析为结构化 JSON。", kw: "query string parser url params json" },
  { id: "regex-tester", cat: "dev", emoji: "\uD83E\uDDEA", name: "正则测试器", desc: "针对文本测试正则表达式并实时查看匹配结果。", kw: "regex tester regular expression match" },
  { id: "timestamp", cat: "dev", emoji: "\u23F1\uFE0F", name: "Unix 时间戳转换", desc: "在 Unix 时间戳与人类可读日期（ISO）间互转。", kw: "unix timestamp epoch converter date" },

  // ---------- Converters & Units ----------
  { id: "unit-length", cat: "convert", emoji: "\uD83D\uDCCF", name: "长度换算", desc: "换算米、千米、英里、英尺、英寸等单位。", kw: "length converter meters feet miles inches", tag: "热门" },
  { id: "unit-weight", cat: "convert", emoji: "\u2696\uFE0F", name: "重量换算", desc: "换算千克、克、磅、盎司与吨。", kw: "weight mass converter kg pounds ounces" },
  { id: "unit-temperature", cat: "convert", emoji: "\uD83C\uDF21\uFE0F", name: "温度换算", desc: "在摄氏度、华氏度与开尔文间换算。", kw: "temperature converter celsius fahrenheit kelvin" },
  { id: "data-size", cat: "convert", emoji: "\uD83D\uDCBE", name: "数据容量换算", desc: "换算字节、KB、MB、GB、TB 与比特。", kw: "data size bytes kb mb gb converter" },
  { id: "roman-numeral", cat: "convert", emoji: "\uD83C\uDFDB\uFE0F", name: "罗马数字转换", desc: "在阿拉伯数字与罗马数字间互转。", kw: "roman numeral converter number" },
  { id: "aspect-ratio", cat: "convert", emoji: "\uD83D\uDCFA", name: "宽高比计算", desc: "将宽度和高度化简为规整的宽高比。", kw: "aspect ratio calculator 16:9 resolution" },

  // ---------- Image ----------
  { id: "image-compressor", cat: "image", emoji: "\uD83D\uDDDC\uFE0F", name: "图片压缩", desc: "本地压缩 JPG/PNG/WebP，文件不会离开你的设备。", kw: "compress image reduce file size", tag: "热门" },
  { id: "image-resizer", cat: "image", emoji: "\uD83D\uDCD0", name: "图片缩放", desc: "按像素或百分比缩放图片，可锁定宽高比。", kw: "resize image dimensions scale" },
  { id: "image-converter", cat: "image", emoji: "\uD83D\uDD04", name: "图片格式转换", desc: "在浏览器中转换 PNG、JPEG 与 WebP。", kw: "convert image png jpg webp format" },

  // ---------- Color & Design ----------
  { id: "color-converter", cat: "color", emoji: "\uD83C\uDF08", name: "颜色转换", desc: "在 HEX ↔ RGB ↔ HSL 间转换并实时预览。", kw: "color converter hex rgb hsl" },
  { id: "palette-generator", cat: "color", emoji: "\uD83C\uDFA8", name: "调色板生成", desc: "从任意基准色生成 10 级色阶。", kw: "color palette generator shades tints" },
  { id: "contrast-checker", cat: "color", emoji: "\uD83D\uDD8D\uFE0F", name: "对比度检查", desc: "检测文字与背景的 WCAG 对比度。", kw: "contrast checker wcag accessibility color" },
  { id: "gradient-generator", cat: "color", emoji: "\uD83C\uDF07", name: "CSS 渐变生成", desc: "设计线性渐变并复制 CSS 代码。", kw: "css gradient generator linear background" },
  { id: "box-shadow", cat: "color", emoji: "\uD83D\uDD32", name: "投影生成器", desc: "可视化生成 CSS box-shadow 并复制。", kw: "css box shadow generator" },
  { id: "border-radius", cat: "color", emoji: "\u2B1C", name: "圆角生成器", desc: "分别调节四个圆角并复制 CSS border-radius。", kw: "css border radius generator rounded" },

  // ---------- Web & SEO ----------
  { id: "utm-builder", cat: "seo", emoji: "\uD83D\uDCC8", name: "UTM 链接生成", desc: "用 UTM 参数生成可追踪的活动链接。", kw: "utm builder campaign url tracking" },
  { id: "slugify", cat: "seo", emoji: "\uD83D\uDD16", name: "Slug 生成器", desc: "将标题转换为整洁、利于 SEO 的 URL slug。", kw: "slug generator url seo" },
  { id: "meta-tag-generator", cat: "seo", emoji: "\uD83C\uDFF7\uFE0F", name: "Meta 标签生成", desc: "为页面生成 SEO 与 Open Graph 元标签。", kw: "meta tag generator open graph seo" },
  { id: "robots-generator", cat: "seo", emoji: "\uD83E\uDD16", name: "Robots.txt 生成", desc: "生成含 Disallow 规则与站点地图的 robots.txt。", kw: "robots txt generator seo crawler" },
  { id: "password-generator", cat: "seo", emoji: "\uD83D\uDD10", name: "密码生成器", desc: "基于 WebCrypto 生成强随机密码。", kw: "password generator strong random secure" },
  { id: "random-string", cat: "seo", emoji: "\uD83C\uDFB2", name: "随机字符串生成", desc: "按所选字符集生成随机字符串/令牌。", kw: "random string token generator" },
  { id: "random-number", cat: "seo", emoji: "\uD83D\uDD22", name: "随机数生成", desc: "在指定范围内生成随机数，可要求不重复。", kw: "random number generator range unique" },

  // ---------- Calculators ----------
  { id: "percentage", cat: "calc", emoji: "\uD83D\uDCCA", name: "百分比计算", desc: "计算某数的百分比、占比与百分比变化。", kw: "percentage calculator percent change", tag: "热门" },
  { id: "discount", cat: "calc", emoji: "\uD83C\uDFF7\uFE0F", name: "折扣计算", desc: "计算折后价与节省的金额。", kw: "discount calculator sale price percent off" },
  { id: "tip", cat: "calc", emoji: "\uD83D\uDCB5", name: "小费计算", desc: "计算小费并在多人间平摊账单。", kw: "tip calculator gratuity split bill" },
  { id: "bmi", cat: "calc", emoji: "\u2695\uFE0F", name: "BMI 计算", desc: "计算身体质量指数并给出体重区间。", kw: "bmi calculator body mass index weight" },
  { id: "age", cat: "calc", emoji: "\uD83C\uDF82", name: "年龄计算", desc: "精确计算年龄的年、月、日与总天数。", kw: "age calculator birthday days" },
  { id: "date-diff", cat: "calc", emoji: "\uD83D\uDCC5", name: "日期间隔", desc: "计算两个日期之间的天数、周数与小时数。", kw: "date difference calculator days between" },
  { id: "sales-tax", cat: "calc", emoji: "\uD83E\uDDFE", name: "销售税 / 增值税计算", desc: "为金额加税并计算含税总额。", kw: "sales tax vat calculator" },
  { id: "compound-interest", cat: "calc", emoji: "\uD83D\uDCC8", name: "复利计算", desc: "结合每月定投预测储蓄增长。", kw: "compound interest calculator savings investment" },
  { id: "loan-calculator", cat: "calc", emoji: "\uD83C\uDFE6", name: "贷款还款计算", desc: "计算月供、总利息与贷款总成本。", kw: "loan payment calculator interest amortization" },
  { id: "profit-margin", cat: "calc", emoji: "\uD83D\uDCB0", name: "利润率计算", desc: "根据成本与售价计算利润、利润率与加价率。", kw: "profit margin markup calculator" },
  { id: "platform-fee", cat: "calc", emoji: "\uD83C\uDFEA", name: "平台费用计算", desc: "计算按比例加固定平台费后的实际到手金额。", kw: "marketplace fee calculator amazon etsy ebay payout" },
  { id: "roas-calculator", cat: "calc", emoji: "\uD83D\uDCC9", name: "ROAS / ACOS 计算", desc: "计算广告支出回报率与广告销售成本占比。", kw: "roas acos ad spend calculator" },
  { id: "break-even", cat: "calc", emoji: "\u2696\uFE0F", name: "盈亏平衡计算", desc: "计算达到盈亏平衡所需的销量与收入。", kw: "break even calculator units revenue" },

  // ---------- AI & Prompts ----------
  { id: "prompt-library", cat: "ai", emoji: "💬", name: "AI 提示词库", desc: "可搜索、可一键复制的 ChatGPT/Claude/Gemini 提示词模板。", kw: "ai prompts chatgpt prompt library templates", tag: "热门" },
  { id: "token-counter", cat: "ai", emoji: "🧮", name: "大模型 Token 计算器", desc: "估算提示词消耗的 Token 数（GPT/Claude/Gemini）。", kw: "token counter tokens tiktoken gpt llm estimate", tag: "热门" },
  { id: "ai-cost-calculator", cat: "ai", emoji: "💸", name: "AI API 成本计算", desc: "对比 GPT、Claude、Gemini 与 DeepSeek 的 API 费用。", kw: "ai api cost calculator openai claude gemini deepseek pricing tokens" },
  { id: "free-llm-api", cat: "ai", emoji: "🆓", name: "免费大模型 API 目录", desc: "汇总可免费 / 试用额度调用的大模型 API：国内直连与全球服务商、可用模型与限额。", kw: "free llm api openrouter groq gemini deepseek qwen glm 免费大模型 api 额度", tag: "新" },
  { id: "ai-selector", cat: "ai", emoji: "🧭", name: "AI 选型决策引擎", desc: "回答几个问题，立即得到模型 + 免费 API + 技术栈 + Agent Skill 的组合建议。", kw: "ai 选型 决策 推荐 模型选择 selector advisor 技术栈 stack", tag: "新" },
  { id: "ai-cost-sandbox", cat: "ai", emoji: "🧮", name: "AI 成本沙盘 What-if", desc: "调整请求量与 token，实时推演每月 / 每年成本，并估算自建的盈亏平衡点。", kw: "ai cost 成本 沙盘 what-if 预算 token 估算 自建 break-even", tag: "新" },
  { id: "model-arena", cat: "ai", emoji: "📡", name: "模型擂台雷达对比", desc: "选 2-3 个模型，在性价比、上下文、开源、多模态等真实维度做雷达对比。", kw: "model arena 雷达 对比 compare 模型对比 性价比 上下文 开源 多模态", tag: "新" },
  { id: "prompt-builder", cat: "ai", emoji: "🧩", name: "可参数化提示词生成器", desc: "选模板、填字段，实时拼出可复制的高质量提示词，覆盖写作 / 工程 / 产品等场景。", kw: "prompt builder 提示词 生成器 模板 参数化 parameterized 写作 代码 prd", tag: "新" },
  { id: "free-api-directory", cat: "dev", emoji: "🌐", name: "免费公开 API 目录", desc: "按分类浏览 40+ 个免费、多数免鉴权的公开 API。", kw: "free public apis no auth api list directory", tag: "热门" },
  { id: "password-strength", cat: "seo", emoji: "🛡️", name: "密码强度检测", desc: "在浏览器本地估算密码熵、破解耗时与弱点。", kw: "password strength checker entropy crack time" },
  { id: "md5-hash", cat: "dev", emoji: "🔑", name: "MD5 哈希生成", desc: "完全在浏览器本地计算文本的 MD5 校验值。", kw: "md5 hash checksum crypto digest crypto-js", tag: "热门" },
  { id: "html-to-markdown", cat: "dev", emoji: "📝", name: "HTML 转 Markdown", desc: "将 HTML 转换为整洁的 Markdown，适合文档与笔记。", kw: "html markdown convert turndown", tag: "热门" },
  { id: "markdown-to-html", cat: "dev", emoji: "🖋️", name: "Markdown 转 HTML", desc: "离线将 Markdown 渲染为 HTML 并实时预览。", kw: "markdown html render preview marked markdown-it" },
  { id: "json-repair", cat: "dev", emoji: "🩹", name: "JSON 修复", desc: "修复损坏的 JSON：引号、尾逗号、注释等问题。", kw: "json repair fix broken invalid jsonrepair", tag: "热门" },
  { id: "string-validator", cat: "dev", emoji: "✅", name: "字符串校验", desc: "检测文本是否为合法的邮箱、URL、IP、UUID、信用卡号等。", kw: "validator email url ip uuid credit card validate validator.js" },
  { id: "fake-data", cat: "dev", emoji: "🎲", name: "假数据生成", desc: "生成 JSON 或 CSV 格式的模拟用户数据，用于测试与演示。", kw: "faker fake mock data test json csv seed", tag: "热门" },
  { id: "image-cropper", cat: "image", emoji: "✂️", name: "图片裁剪", desc: "在浏览器中可视化裁剪图片，不上传任何文件。", kw: "image crop cropper photo picture cropperjs" },

  // ---------- AI & Prompts (directory) ----------
  { id: "ai-tools-directory", cat: "ai", emoji: "🧭", name: "AI 工具目录", desc: "按分类浏览 100+ 款精选 AI 工具：对话、图像、视频、编程、智能体、提示词等。", kw: "ai tools directory navigation list chat image video coding agents prompts open source github", tag: "热门" },
  { id: "ai-ecosystem-directory", cat: "ai", emoji: "🧩", name: "AI 技术栈与 Agent Skills", desc: "浏览经过甄选的网站 AI 组件、Agent Skill 能力地图与可信来源库。", kw: "AI stack agent skills open source RAG Dify Flowise Qdrant LiteLLM Langfuse MCP GitHub", tag: "新" },
  { id: "skills-registry", cat: "ai", emoji: "🗃️", name: "Skills Registry", desc: "全量 Skills 索引、来源、风险与本地化状态管理。", kw: "skills registry GitHub SkillsMP rrskill Agent Skill 本地化 风险 许可证 同步", tag: "新" },
];
