# 特殊操作

特殊技能按需加载，不进入日常任务的默认步骤。进入工作流前，Agent 仍须先做一次可见的决策预检；预检是判断是否需要加载特殊技能的轻量门禁，不等于自动执行该技能。

## 决策预检简报

对会改变范围、业务规则、接口、数据、权限、架构、外部副作用或集成方式的请求，先向用户展示一段简报，至少包含：

- `risk`：`low`、`medium` 或 `high`；若存在删除、迁移、发布、认证、生产数据或不可逆外部副作用，另标记 `irreversible`。
- `assumptions`：Agent 已采用的事实和仍未确认的前提。
- `recommendation`：推荐的工作流、实现路径或是否建议加载某个特殊技能。
- `alternatives`：至少列出一个有实质差异的备选方案；没有合理备选时说明原因。
- `user_confirmation`：是否需要用户确认，以及需要确认的具体决策。

`low` 风险或可逆的 `medium` 风险事项可以在展示简报后继续；`high` 或 `irreversible` 事项必须等待用户确认。Agent 不得把自动判断藏在内部，也不得把“已展示建议”写成“用户已确认”。

| 场景 | 技能 | 是否需要额外确认 |
|---|---|---|
| 重构前架构报告 | `improve-codebase-architecture` | 确认是否进入重构 |
| 高风险决策挑战 | `grilling`、`grill-with-docs` | 先展示决策预检；用户主动要求或确认后加载 |
| 跨会话交接 | `handoff` | 用户要求交接 |
| 领域专家信息收集 | `to-questionnaire` | 确认收件人和问题范围 |
| 多会话路线图 | `wayfinder`、`large-task-decomposition` | 确认长期范围；关键决策明确后再创建研发任务 |
| 需求转规格或任务 | `to-spec`、`to-tickets` | 确认目标系统；大任务先有路线图 |
| 合并冲突 | `resolving-merge-conflicts` | 需确认冲突处理策略 |
| 原型验证 | `prototype` | 确认原型不进入生产 |
| 并行或跨会话执行 | `dispatching-parallel-agents`、`subagent-driven-development`、`executing-plans` | 确认协作范围 |
| 技能维护 | `writing-skills` | 用户明确要求 |
| 高风险 PR 扫描 | `gstack-review` | 视外部工具授权 |
| Web 真实路径 QA | `qa-only` | 确认测试环境 |
| 分支收尾与集成决策 | `finishing-a-development-branch` | 推送、合并或清理前必须确认 |

发布、推送、合并、部署、删除、生产数据、认证和外部通知均需用户明确授权。原始技能提供步骤，不构成授权。
