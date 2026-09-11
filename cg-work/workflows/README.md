# 工作流

本目录只定义流程顺序、状态门禁和技能引用。原始技能正文以 `skills/` 中的镜像为准；框架自有技能以其目录内容为准。

所有开发工作流遵循同一阶段契约：

| 阶段 | 必须完成的事情 | 必须留下的记录 |
|---|---|---|
| `pending` | 建立任务、目标、范围和验收标准，并评估文档影响 | `task.yaml` |
| `in_progress` | 完成计划（复杂任务）、实现和过程验证 | `plan.md`（需要时），必要时补充任务记录 |
| `review` | 完成代码审查和新鲜验证，完成文档同步或记录无需更新的理由，处理或记录遗留问题 | `review.md`、`verification.md` |
| `done` | 用户接受结果并确定集成方式 | `task.yaml` 中的终态和下一步 |

验证失败或审查发现问题时回到 `in_progress`；缺少外部条件进入 `blocked`；用户取消进入 `cancelled`。不得跳过 `review` 直接标记 `done`。

文档同步门禁：业务规则、用户流程、接口、数据模型或架构发生变化时，`documentation.impact` 必须为 `update` 或 `add`，并记录受影响文档和变更内容；确认现有文档仍准确时使用 `none` 并填写 `not_needed_reason`。`not_assessed` 不能进入 `done`。

| 文件 | 使用场景 |
|---|---|
| `feature-development.md` | 新功能和行为变更 |
| `bugfix.md` | 缺陷、回归和性能问题 |
| `refactor.md` | 保持外部行为的结构调整 |
| `review.md` | 代码、变更和交付前审查 |
