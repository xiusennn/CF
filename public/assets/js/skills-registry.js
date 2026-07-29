import { LOCAL_SKILLS } from "./skills.js";
import { RR_RECOMMENDED_SKILLS } from "./external-catalogs.js";
export const SKILL_REGISTRY_SOURCES=[
 {name:"SkillsMP",url:"https://skillsmp.com/",known:283000,refresh:"持续发现",mode:"索引",trust:"外部索引",note:"GitHub 开源 Skill 大型索引，仅同步元数据。"},
 {name:"Skillshub",url:"https://github.com/ComeOnOliver/skillshub",known:5000,refresh:"高频",mode:"注册表",trust:"开源注册表",note:"聚合 500+ GitHub 仓库的可解析 Skill 注册表。"},
 {name:"rrskill",url:"https://rrskill.cn/",known:77575,refresh:"持续更新",mode:"国内目录",trust:"外部目录",note:"中文 Skill 目录与公开推荐榜。"},
 {name:"Agentic Awesome Skills",url:"https://github.com/sickn33/agentic-awesome-skills",known:1935,refresh:"版本发布",mode:"内容库",trust:"开源集合",note:"跨 Claude、Codex、Cursor 与 Gemini CLI 的可安装集合。"},
 {name:"Scientific Agent Skills",url:"https://github.com/K-Dense-AI/scientific-agent-skills",known:148,refresh:"活跃维护",mode:"内容库",trust:"开源集合",note:"科研、医学、化学和数据分析 Skills。"},
 {name:"Anthropic Skills",url:"https://github.com/anthropics/skills",known:0,refresh:"官方维护",mode:"官方内容",trust:"官方",note:"官方 Skill 格式与参考实现。"},
 {name:"NVIDIA Skills",url:"https://github.com/nvidia/skills",known:0,refresh:"每日同步",mode:"官方目录",trust:"官方",note:"CUDA-X 与 AI Blueprint 官方目录。"}
];
export const SKILL_REGISTRY=[...LOCAL_SKILLS.map(x=>({name:x.name,category:x.cat,summary:x.desc,source:"ToolHub Local",content:"local",risk:"reviewed",url:"/tools/ai-ecosystem-directory.html",tags:x.tags||[]})),...RR_RECOMMENDED_SKILLS.map(x=>({name:x.name,category:x.cat,summary:x.desc,source:"rrskill",content:"metadata",risk:"unreviewed",url:x.url,tags:[x.slug]}))];
export const REGISTRY_POLICY={metadata:"索引层只保存名称、摘要、来源、许可证、更新时间与分类。",local:"本地内容层只保存已审核且允许公开保存的内容。",quarantine:"脚本、网络访问、密钥、高权限或可疑指令进入隔离区，不自动执行。"};
