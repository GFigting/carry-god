# 工作流

本目录只定义流程顺序、状态门禁和技能引用。原始技能正文以 `skills/` 中的镜像为准；框架自有技能以其目录内容为准。

所有开发工作流遵循同一阶段契约：

| 阶段 | 必须完成的事情 | 必须留下的记录 |
|---|---|---|
| `pending` | 建立任务、目标、范围和验收标准，并评估文档影响 | `task.yaml` |
| `in_progress` | 完成计划（复杂任务）、实现、过程验证，并记录会影响当前任务或未来复用的候选经验 | `plan.md`（需要时），必要时补充任务记录和 `learning.md` |
| `review` | 完成审查和新鲜验证，完成文档同步或记录无需更新的理由，处理或记录遗留问题，并判定候选经验去向 | `review.md`、`verification.md`、`learning.md`（使用学习协议时） |
| `done` | 用户接受结果、确定集成方式，并完成学习记录的交接或明确无可复用经验 | `task.yaml` 中的终态和下一步、`learning.md`（使用学习协议时） |

验证失败或审查发现问题时回到 `in_progress`；缺少外部条件进入 `blocked`；用户取消进入 `cancelled`。不得跳过 `review` 直接标记 `done`。

原型采纳门禁：任务声明 `prototype_reference` 时，进入 `review` 或 `done` 前必须以 `prototype_disposition_reference` 引用采纳记录。记录必须有“采纳结论”“实现映射”“验证映射”“未采纳项”四节；格式见 `core/prototype-disposition.template.md`。未创建原型的任务不受此门禁影响。

文档同步门禁：业务规则、用户流程、接口、数据模型或架构发生变化时，`documentation.impact` 必须为 `update` 或 `add`，并记录受影响文档和变更内容；确认现有文档仍准确时使用 `none` 并填写 `not_needed_reason`。`not_assessed` 不能进入 `done`。

持续学习门禁：新任务必须声明 `learning_protocol: v1`。该任务进入 `review` 或 `done` 时必须以 `learning_reference` 引用 `learning.md`；该文件可记录提升后的经验，也可明确无可复用经验。规则、格式和提升边界见 [持续学习与经验沉淀](../core/continuous-learning.md)。

用户下一步提醒：新任务必须声明 `interaction_protocol: v1` 并维护 `next_user_action`。进入 `review`、`blocked` 或 `done` 时，该对象必须说明是否需要用户操作、动作标识和一条可直接执行的提示；路线图没有可执行前沿任务时也必须更新同名字段。

| 文件 | 使用场景 |
|---|---|
| `feature-development.md` | 新功能和行为变更 |
| `bugfix.md` | 缺陷、回归和性能问题 |
| `refactor.md` | 保持外部行为的结构调整 |
| `review.md` | 代码、变更和交付前审查 |
| `framework-optimization.md` | 框架规则、流程、模板、校验器和框架自有技能的演进 |
| `large-task-decomposition.md` | 多会话、跨模块或未决关键决策的大需求路线图、任务拆分和关闭归档 |
