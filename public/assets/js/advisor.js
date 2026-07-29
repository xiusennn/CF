// advisor.js — data for the AI selector engine and the model arena.
// TASK -> stack/skill keywords are matched fuzzily against the live catalogs
// (ecosystem.js / skills.js / data.js) so nothing breaks if those evolve.
// MODEL_TRAITS (open weight / multimodal) are compiled from public docs and
// may change with new releases — always verify against official pages.

export const ADVISOR_TASKS = [
  { id:"rag", icon:"📚", name:"知识库问答 / RAG", desc:"让模型基于你的文档、FAQ 或知识库回答。",
    prefer:"context", stackKw:["RAG","向量","vector","编排","抄取","extract","可观测"], skillKw:["研究","数据","代码"],
    why:"检索质量往往比模型参数更关键：先把文档解析、分块、嵌入做好，再选长上下文、中文理解强的模型。" },
  { id:"chatbot", icon:"💬", name:"智能客服 / 对话助手", desc:"面向用户的多轮对话、工单分流与人工兼容。",
    prefer:"chinese", stackKw:["聊天","chat","编排","workflow","可观测","自动化"], skillKw:["客服","商业","品牌","提示词"],
    why:"客服重中文口径、延迟与成本；用中文强的中档模型做主力，搭配人工升级与知识库兼容。" },
  { id:"code", icon:"⌨️", name:"代码生成 / 编程助手", desc:"代码补全、重构、审查与测试生成。",
    prefer:"code", stackKw:["编排","framework","可观测","网关","MCP"], skillKw:["代码","重构","测试","审查","Git"],
    why:"编码看重推理与指令遵循；首选代码专项或顶级推理模型，配合代码审查 / 测试类 Skill。" },
  { id:"agent", icon:"🤖", name:"Agent / 自动化工作流", desc:"多步骤、可中断、工具调用的自动化。",
    prefer:"context", stackKw:["agent","状态","MCP","自动化","webhook","编排","可观测"], skillKw:["提示词","商业","自动化","代码"],
    why:"Agent 需要稳定的工具调用与长上下文；用支持函数调用、并发稳定的模型，搭配状态机 / MCP 框架。" },
  { id:"content", icon:"✍️", name:"内容创作 / 营销文案", desc:"博客、社媒、产品文案与知识型内容。",
    prefer:"chinese", stackKw:["编排","workflow","抄取"], skillKw:["内容","品牌","长文","SEO","增长","翻译"],
    why:"内容创作看中文表达与风格控制；用中文强的模型，配合品牌语气 / 长文编辑类 Skill。" },
  { id:"data", icon:"📊", name:"数据分析 / 报表洞察", desc:"从表格、日志与指标中提取结论。",
    prefer:"context", stackKw:["数据","编排","可观测","database","PostgreSQL"], skillKw:["数据","研究","财务","商业"],
    why:"数据任务常需长上下文容纳大表格与可复现的推理；优先长上下文与推理能力。" },
  { id:"vision", icon:"🖼️", name:"多模态 / 图文理解", desc:"图片、截图、扫描件的理解与抽取。",
    prefer:"multimodal", stackKw:["编排","抄取","extract"], skillKw:["研究","数据","内容"],
    why:"需要原生多模态（视觉）能力；仅列出支持图像输入的模型。" },
  { id:"cheap", icon:"⚡", name:"高并发 / 成本敏感", desc:"大批量、低单价、对质量容忍度适中的场景。",
    prefer:"cheap", stackKw:["网关","gateway","可观测","本地","推理"], skillKw:["后端","代码"],
    why:"成本敏感场景先看单价；用模型网关做预算 / 限额 / 回退，主力模型选最低成本档。" },
];

const DOMESTIC = ["阿里通义","月之暗面","智谱","MiniMax","DeepSeek"];
export const isDomestic = (provider) => DOMESTIC.includes(provider);

export const MODEL_TRAITS = {
  "gpt-5.6-sol":{open:false,modal:true},
  "gpt-5.6-terra":{open:false,modal:true},
  "gpt-5.6-luna":{open:false,modal:true},
  "gpt-5.4-nano":{open:false,modal:true},
  "claude-opus-4.8":{open:false,modal:true},
  "claude-sonnet-5":{open:false,modal:true},
  "claude-haiku-4.5":{open:false,modal:true},
  "claude-fable-5":{open:false,modal:true},
  "gemini-3.1-pro":{open:false,modal:true},
  "gemini-3.5-flash":{open:false,modal:true},
  "gemini-3-flash":{open:false,modal:true},
  "gemini-3-flash-lite":{open:false,modal:true},
  "deepseek-v4-pro":{open:true,modal:false},
  "deepseek-v4-flash":{open:true,modal:false},
  "grok-4.5":{open:false,modal:true},
  "grok-4.1-fast":{open:false,modal:true},
  "llama-4-maverick":{open:true,modal:true},
  "llama-4-scout":{open:true,modal:true},
  "mistral-large":{open:false,modal:false},
  "mistral-small":{open:true,modal:false},
  "qwen3.7-max":{open:false,modal:false},
  "qwen3-coder-plus":{open:false,modal:false},
  "qwen3.6-flash":{open:false,modal:false},
  "kimi-k2.6":{open:true,modal:true},
  "glm-5":{open:true,modal:false},
  "minimax-m3":{open:true,modal:false},
};
