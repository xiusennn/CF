# Skills 目录（/skills.html）交付说明

## 一个脚本完成全流程

根目录只保留 **`toolhub.bat`**（ASCII + CRLF）。旧的 `deploy.bat`、
`deploy_with_root_skills_data.bat`、`extract_skills_data_to_root.bat` 已删除，全部合并为六步：

| 步骤 | 动作 |
| --- | --- |
| 1 | 定位数据：优先 `skills-data\index.json`；没有就从 `toolhub-skills-pipeline\work\site\` 自动导入 |
| 2 | 生成紧凑目录（`build/build-skills-catalog.mjs`） |
| 3 | `npm install` |
| 4 | `node build/build.mjs`（含 `/skills.html`、导航、页脚、sitemap） |
| 5 | 发布门禁：release-check + 静态审计 + 5 套单元测试 + selfcheck（任一失败即中止） |
| 6 | `wrangler deploy` + 重试 + 预热 `/`、`/skills.html`、`meta.json`、`/healthz` |

顶部开关：`CF_TOKEN` / `PROXY_URL` / `DEPLOY_RETRIES` / `RUN_TESTS` / `DO_DEPLOY=0`（只本地构建）/ `PUBLIC_SITE_URL`。
日志统一写到 `.toolhub-logs\`，不再写 `%TEMP%`。

命令行等价写法：`npm run build:all`（= `build:skills` + `build`）、`npm run verify:release`。

## 数据为何能上 Cloudflare

原始分页数据 183.8 MiB / 318 个文件；构建后为 **72.4 MiB / 51 个分片 + `meta.json`**，
最大分片 1.4 MiB，远低于 Cloudflare 单文件 25 MiB / 单次部署 20k 文件的限制。

压缩手法（无损于页面实际渲染的字段）：

- 短键名：`n/o/r/p/d/s/u/l/c/q/t/f/h`
- URL 推导：只存 commit sha，前端拼出仓库 / Skill 目录 / `SKILL.md` 原文链接；推导不一致时才写入 `S/M/R` 覆盖字段
- 描述截断到 240 字（`SKILLS_DESC_MAX` 可调）
- 按质量分降序排序，使“精选优先”只需前几个分片
- 分面目标 1.5 MB（`SKILLS_SHARD_BYTES` 可调），超过 25 MiB 直接报错而不是默默上传失败

`meta.json` 同时预计算了分面（许可证 Top 40、作者 Top 300），因此筛选器无需先下载数据就能渲染。

## 前端行为

- 首屏只下载 `meta.json`（~13 KB）+ 第一个分片（1.4 MiB）
- 关键词搜索：多词空格 = AND，180 ms 防抖
- 分面筛选：层级 / 安全等级 / 许可证 / 作者 / 最低 Star；四种排序
- 两档范围：“精选优先”扫前 2 万条（瞬时）；“全库搜索”流式加载 15.8 万条，带进度条、增量出结果，切换查询自动取消旧任务
- 结果每 40 条分页，每条给出 Skill 目录 / `SKILL.md` 原文 / 仓库 / 复制链接
- 合规：core（许可证明确）与 index（未声明许可证，仅索引外链）分开标注，命中安全规则的条目带红色标签；站内不转存正文
- `sw.js` 缓存名升到 `toolhub-v57-skills`，并直接跳过 `/assets/data/skills/`（分片由 `?v=` 时间戳破缓存）

## 域名

全项目已统一为 `tool.cnagt.com`（原来默认值误为 `cngat`），canonical、sitemap、robots、
release-check、静态审计、联系邮箱均同步；静态审计现在跟随 `SITE_URL` 而不再硬编码。

## 交付前已验证

- 紧凑目录：158,731 条 → 51 分片，最大 1.4 MiB，3.4 s
- 静态审计：100 个 HTML 页面，4,805 个本地引用，0 断链
- 单元测试：core / v2 / v3 / v4（28）/ Worker（13）全部通过；RELEASE CHECK PASSED；SELFCHECK PASS
- 本地 HTTP：`/skills.html` 200、`meta.json` 200、`shard-0001.json` 200（2,073 条）
- 无头浏览器：统计卡 158,731 / 104,449 / 54,282 / 35,179；搜“pdf”得 155 条；core + 最近更新得 94 条；
  全库搜索扫完 158,731 条得 817 条；日期显示为完整 `2026-07-26`；控制台 0 错误
