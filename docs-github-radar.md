# GitHub AI Project Radar

## 自动采集
- Cron Trigger：建议每 6 小时。
- GitHub Search API：按 Agent、LLM、MCP、RAG、AI 编程、模型推理、图像/视频分片查询。
- 使用 GitHub App 或 Token，避免匿名限流。

## 持久化字段
`owner/repo`、总 Star、Star 增量、Fork、topics、创建/更新时间、分类、置信度、审核状态、最后抓取时间。

## 排名
- 高星经典：总 Star。
- 本周爆发：当前 Star - 上次快照 Star。
- 新晋项目：新建时间、增长率、活跃度。
- 持续活跃：最近 push、release、issue 活跃度。

## 上线前配置
当前 Worker 已有请求触发的 GitHub Trending。要启用历史涨星和 Cron，需要在 Cloudflare 绑定 D1 或 KV，并配置 Cron Trigger；此项目保留了 `src/github-radar-pipeline.js` 的标准化与分类逻辑。
