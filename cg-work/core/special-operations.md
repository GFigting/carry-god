# 特殊操作

特殊技能按需加载，不进入日常任务的默认步骤。

| 场景 | 技能 | 是否需要额外确认 |
|---|---|---|
| 重构前架构报告 | `improve-codebase-architecture` | 确认是否进入重构 |
| 高风险决策挑战 | `grilling`、`grill-with-docs` | 用户主动要求或确认 |
| 跨会话交接 | `handoff` | 用户要求交接 |
| 领域专家信息收集 | `to-questionnaire` | 确认收件人和问题范围 |
| 多会话路线图 | `wayfinder` | 确认长期范围 |
| 需求转规格或任务 | `to-spec`、`to-tickets` | 确认目标系统 |
| 合并冲突 | `resolving-merge-conflicts` | 需确认冲突处理策略 |
| 原型验证 | `prototype` | 确认原型不进入生产 |
| 并行或跨会话执行 | `dispatching-parallel-agents`、`subagent-driven-development`、`executing-plans` | 确认协作范围 |
| 技能维护 | `writing-skills` | 用户明确要求 |
| 高风险 PR 扫描 | `gstack-review` | 视外部工具授权 |
| Web 真实路径 QA | `qa-only` | 确认测试环境 |
| 分支收尾与集成决策 | `finishing-a-development-branch` | 推送、合并或清理前必须确认 |

发布、推送、合并、部署、删除、生产数据、认证和外部通知均需用户明确授权。原始技能提供步骤，不构成授权。
