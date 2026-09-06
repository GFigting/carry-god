# 外部能力吸收矩阵

`cg-harness` 借鉴仓库内其他目录的工作方法，但不复制它们的任务状态或存储协议。

| 来源 | 吸收的优点 | 在 Harness 中的落点 |
|---|---|---|
| GGFrame | 项目注册、按工作类型选模板、Goal/Task/Artifact、阻塞与返工区分 | `.cg/project.json`、Task 元数据、类型路由、Artifact 字段 |
| superpowers | 澄清、计划、TDD、系统调试、完成前验证 | `skills/`、`protocols/`、验收证据门槛 |
| skills | Context Package、需求分诊、领域词汇、可组合技能 | `context_package`、`intake`、技能契约 |
| gstack | 产品、设计、浏览器 QA、安全、性能和发布视角 | 外部适配器与按类型路由 |
| compound-engineering-plugin | 决策型计划、幂等恢复、证明、经验沉淀 | `decisions`、事件日志、`evidence`、`learn` |

## 本地化原则

1. 任务状态、证据和完成判定只由 CG Harness 负责。
2. 外部能力只能返回结构化结果，不能直接修改任务状态。
3. 需求分类不确定时保留 `draft`，记录置信度和待确认问题。
4. 项目规则和上下文先进入项目注册与 Context Package，再交给技能执行。
5. 已验证且具有长期价值的经验进入知识目录，避免只留在对话记录中。
