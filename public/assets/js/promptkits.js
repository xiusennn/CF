// promptkits.js — parameterized prompt templates for the prompt builder.
// Each kit turns a proven prompt into fill-in-the-blank fields; the tool
// assembles a ready-to-paste prompt. [[key]] tokens are replaced at runtime;
// unfilled tokens fall back to a labeled placeholder.

export const PROMPT_KITS = [
  { id:"blog", cat:"内容写作", name:"长文 / 博客创作", desc:"输出有受众、有结构、可发布的长文。",
    vars:[{k:"topic",label:"主题",ph:"例：小团队如何落地 RAG"},{k:"audience",label:"目标读者",ph:"例：初创公司技术负责人"},{k:"tone",label:"语气",ph:"例：专业但不殍板"},{k:"words",label:"字数",ph:"例：1200"}],
    template:`你是一位资深内容编辑。请就主题「[[topic]]」写一篇面向「[[audience]]」的文章。
要求：
- 语气：[[tone]]；篇幅约 [[words]] 字。
- 开头用一个具体场景或痛点引入，不要套话。
- 用小标题分段，每段围绕一个读者问题。
- 至少给出一个可操作的步骤或清单。
- 结尾给出下一步行动建议。
先输出提纲征求我确认，再写全文。`},
  { id:"seo", cat:"内容写作", name:"SEO / AEO 优化", desc:"面向搜索与 AI 回答的内容结构。",
    vars:[{k:"keyword",label:"核心关键词",ph:"例：免费大模型 API"},{k:"intent",label:"搜索意图",ph:"例：比较与选型"},{k:"lang",label:"语言",ph:"例：简体中文"}],
    template:`你是 SEO/AEO 专家。围绕关键词「[[keyword]]」（搜索意图：[[intent]]）用 [[lang]] 给出：
1. 5 个符合意图的标题（含主关键词，不堆砌）。
2. 一个 H2/H3 大纲，覆盖用户真正会问的问题。
3. 一段适合被 AI 直接引用的简洁答案（40-60 字）。
4. 5 个相关长尾词与内部链接建议。`},
  { id:"code-review", cat:"工程", name:"代码审查", desc:"结构化、分优先级的代码评审。",
    vars:[{k:"lang",label:"语言 / 框架",ph:"例：TypeScript + React"},{k:"focus",label:"关注重点",ph:"例：安全与性能"}],
    extra:[{k:"code",label:"粘贴代码",ph:"在此粘贴代码…"}],
    template:`你是资深工程师，请审查以下 [[lang]] 代码，重点关注 [[focus]]。
按严重程度分级（阻断 / 严重 / 建议）列出问题，每条给出：位置、原因、修复方案与示例代码。
最后给出一个“合并前必改”清单。不要笼统地说“很好”，只指出问题。

代码：
[[code]]`},
  { id:"prd", cat:"产品", name:"PRD / 需求拆解", desc:"把一个想法拆成可开发的需求。",
    vars:[{k:"idea",label:"产品想法",ph:"例：面向开发者的 AI 选型工具"},{k:"user",label:"目标用户",ph:"例：独立开发者"},{k:"goal",label:"业务目标",ph:"例：提升留存"}],
    template:`你是资深产品经理。请把想法「[[idea]]」拆解为一份简明 PRD：
- 目标用户：[[user]]；核心业务目标：[[goal]]。
- 用户痛点与使用场景（3 条）。
- MVP 功能清单（必做 / 不做，各列出原因）。
- 关键用户流程（分步）。
- 验收标准与风险。
输出用表格和列表，保持可执行。`},
  { id:"research", cat:"研究", name:"深度研究", desc:"可追溯、区分事实与观点的研究。",
    vars:[{k:"question",label:"研究问题",ph:"例：国内团队该用哪个向量库"},{k:"depth",label:"深度要求",ph:"例：给出至少 5 个来源"}],
    template:`你是严谨的研究员。针对问题「[[question]]」：
- 先列出要回答的子问题与评估标准。
- [[depth]]，区分一手与二手来源，标注不确定项。
- 把事实与推断分开写，给出反例与风险。
- 最后输出一页摘要：结论 + 依据 + 下一步。
若信息不足，明确说明缺什么，不要编造。`},
  { id:"support", cat:"运营", name:"客服回复", desc:"共情、准确、可直接发送的回复。",
    vars:[{k:"tone",label:"品牌语气",ph:"例：专业友好"},{k:"lang",label:"语言",ph:"例：简体中文"}],
    extra:[{k:"message",label:"客户消息",ph:"粘贴客户原话…"}],
    template:`你是客服专家，语气：[[tone]]，语言：[[lang]]。阅读下方客户消息，输出：
1. 一句话共情 + 确认问题。
2. 分步解决方案（若需信息，列出要问什么）。
3. 兵底方案与升级路径。
不允许承诺无法确认的事。

客户消息：
[[message]]`},
  { id:"translate", cat:"运营", name:"翻译与本地化", desc:"保留语气与术语的翻译。",
    vars:[{k:"from",label:"源语言",ph:"例：英文"},{k:"to",label:"目标语言",ph:"例：简体中文"},{k:"style",label:"风格",ph:"例：产品官网语气"}],
    extra:[{k:"source",label:"原文",ph:"粘贴待翻译内容…"}],
    template:`将以下 [[from]] 内容翻译为 [[to]]，风格：[[style]]。
要求：保留专有名词与代码 / 变量不译；不逐字硬译，要符合目标语习惯；专业术语首次出现可附原文。
先给译文，再用一两句说明你处理了哪些难点。

原文：
[[source]]`},
  { id:"competitor", cat:"商业", name:"竞品分析", desc:"结构化拆解竞品与差异化机会。",
    vars:[{k:"me",label:"我的产品",ph:"例：ToolHub"},{k:"rivals",label:"竞品",ph:"例：A、B、C"},{k:"segment",label:"目标市场",ph:"例：中文开发者"}],
    template:`你是市场分析师。对比「[[me]]」与竞品「[[rivals]]」在市场「[[segment]]」的表现：
- 用表格对比定位、核心功能、定价、优势、短板。
- 指出 3 个我可以切入的差异化机会，各附依据。
- 给出一个 90 天行动建议。
只基于常识与我提供的信息，不确定的标注出来。`},
  { id:"meeting", cat:"运营", name:"会议纪要", desc:"从杂乱记录提炼决议与待办。",
    vars:[], extra:[{k:"notes",label:"会议记录",ph:"粘贴会议记录…"}],
    template:`把下方会议记录整理为：
1. 一句话总结。
2. 关键决议（带负责人）。
3. 待办事项（任务 / 负责人 / 截止日期，表格）。
4. 待确认的开放问题。
不要遗漏数字与日期。

记录：
[[notes]]`},
  { id:"prompt-opt", cat:"提示词工程", name:"提示词优化器", desc:"把一段粗糙提示词改写得更专业。",
    vars:[{k:"goal",label:"你想让 AI 做什么",ph:"例：写产品更新邮件"}],
    extra:[{k:"draft",label:"你的初稿提示词",ph:"粘贴你现在的提示词…"}],
    template:`你是提示词工程专家。我的目标是「[[goal]]」，下面是我的初稿提示词。
请：
1. 指出它的模糊与缺失约束（角色 / 受众 / 格式 / 质量标准 / 示例）。
2. 给出一个重写后的高质量提示词（可直接用）。
3. 再给出 2 个可选变体（更简 / 更严格）。

初稿：
[[draft]]`},
];
