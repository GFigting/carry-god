# 工作模型

核心对象为 Goal、Task、Context、Plan、Evidence、Artifact、Decision、Learning、Roadmap 和 NextAction。

原型是 Artifact 的一种。任务声明 `prototype_reference` 后，原型不能只作为演示文件保留：进入 `review` 或 `done` 前，必须通过 `prototype_disposition_reference` 指向任务目录内的采纳记录，说明采纳结论、原型到实现的映射、原型到验证证据的映射，以及未采纳项及原因。记录格式见 [原型采纳记录模板](prototype-disposition.template.md)。

Learning 是由任务执行中的观察形成、经审查判定去向的经验记录。它不替代需求、计划、审查或验证；具体的连续记录、证据和提升规则见 [持续学习与经验沉淀](continuous-learning.md)。

任务状态为：

```text
pending -> in_progress -> review -> done
```

异常状态为 `blocked` 和 `cancelled`。验证失败或审查发现问题时回到 `in_progress`，不新增 `revision` 状态。

状态门禁：

- `pending`：目标、范围和验收标准已记录，尚未开始实施。
- `in_progress`：已满足执行前置条件，正在设计、编码或测试。
- `review`：实现已完成，必须有审查记录和新鲜的验证证据；声明原型的任务还必须有原型采纳记录。
- `done`：验证通过、审查结论已处理、用户接受结果，并已确定保留、合并、推送或暂缓集成方式。
- `blocked`：缺少信息、权限、环境或外部依赖；记录阻塞原因和解除条件。
- `cancelled`：用户明确取消；记录取消原因和已有产物位置。

### 需求范围变化与任务拆分

同一原始需求包可以被多个任务复用，但任务不是可无限追加范围的工作日志。出现新的业务规则、接口/数据结构变化、独立验收标准或明显不同的交付物时，必须创建新任务，并通过 `requirements_reference` 复用原始需求来源；不得只修改旧任务的 `next_action` 或继续堆叠旧的 `plan.md`。

任务需要延续既有范围时，可在 `task.yaml` 声明 `scope_decision.mode: continuation`，同时填写 `prior_task_reference`、`rationale`，并为当前任务维护独立的计划和验证证据。新范围任务可声明 `scope_decision.mode: independent`，说明拆分理由。该字段用于让 `check-task.mjs` 检查拆分决策和证据边界。

允许的状态转移：

| 当前状态 | 可转移到 |
|---|---|
| `pending` | `in_progress`、`blocked`、`cancelled` |
| `in_progress` | `review`、`blocked`、`cancelled` |
| `review` | `in_progress`、`done`、`blocked`、`cancelled` |
| `blocked` | `pending`、`in_progress`、`cancelled` |
| `done` | 无；后续变更创建新任务 |
| `cancelled` | 无；重新开始时创建新任务 |

不得跳过 `review` 直接进入 `done`。`done` 和 `cancelled` 是终态。

## 计划、审查与验证的边界

- `plan.md`：说明实施方案；复杂或用户要求审查时，在同一文件增加“计划审核”章节，记录需求覆盖、范围、依赖、步骤、验收标准和风险检查结论。
- `review.md`：实施完成后的结果审查，判断实现是否符合需求、计划和项目规范。
- `verification.md`：记录测试、静态检查、构建和页面或接口验收等事实证据。

计划审核不是新的任务状态，也不要求新增独立文件；子智能体的意见由主 Agent 汇总后写回 `plan.md`。

## 任务证据生命周期

标准任务的证据按阶段逐步生成，不要求创建任务时一次性生成全部文件：

| 阶段 | 必要产物 | 主要内容 |
|---|---|---|
| 接收需求 | 需求包、`task.yaml` | 原始需求、目标、范围、状态 `pending`、需求引用 |
| 开始实施 | `plan.md` | 方案、步骤、验收、依赖、风险和计划审核结论（如适用） |
| 完成实现 | `review.md`、`verification.md` | 实现结果审查和新鲜验证事实 |
| 需要持续学习 | `learning.md` | 观察、结论、去向和可复用经验 |
| 完成交接 | `handoff.md` | 集成方式、遗留项、用户下一步和关闭索引 |

低风险变更不进入该生命周期；轻量缺陷可将根因、范围、验证、自审和集成结论合并在 `task.yaml` 的 `lightweight_evidence` 中。

小任务使用最小充分流程；跨模块、不确定或高风险任务增加计划、审查或专门技能，但不改变状态机。用户确认和项目规则优先，技能不能自行改变状态。

## 低风险变更

低风险变更不属于开发任务状态机，不创建需求箱、`task.yaml`、计划、审查、学习或交接记录，也不强制新增自动化测试。仅当修改同时满足以下条件时适用：

- 仅调整已存在页面或文档的文案、样式、静态布局，或不改变行为的可访问性标记；
- 不改变业务规则、交互行为、路由或菜单、接口、数据、权限、配置语义、依赖或外部副作用；
- 可通过受影响文件的静态检查、页面视觉验收或文档链接检查直接验证。

低风险变更必须使用 `framework:low-risk-change`，并完成与改动匹配的最小验证：前端页面至少执行受影响文件的 lint 和页面验收；纯文档改动至少执行链接或格式检查。任一条件不满足、需要新增或调整逻辑，或验证暴露行为变化时，立即转为相应标准工作流并创建任务记录。

## 大任务路线图

当需求跨模块、跨会话、存在关键未决决策，或不能作为一个独立任务验收时，先建立 Roadmap，而非直接拆分研发任务。Roadmap 的生命周期是：`wayfinder 决策 → 结构化需求覆盖 → 可验收子任务 → 集成核对 → 关闭归档`。

Roadmap 是项目级索引，不是任务目录的替代品。其唯一默认位置为 `local/projects/<project-id>/roadmaps/<roadmap-id>/`；`roadmap.yaml` 保存目标、决策、任务和依赖，`coverage.md` 记录原始需求覆盖，`closure.md` 记录关闭结论与遗留项。子任务仍保持各自的状态机和证据目录，通过可选引用字段关联路线图。路线图关闭不删除、不移动历史任务。

## 用户下一步提醒

任务使用 `interaction_protocol: v1` 时，以 `next_user_action` 向用户表达当前是否需要其操作。该对象必须含有 `required`（布尔值）、`action`（动作标识）和 `message`（面向用户的明确提示）。任务进入 `review`、`blocked` 或 `done` 时必须提供该对象：审查阶段请求验收或补充决定；阻塞阶段说明解除动作；完成阶段明确无需操作或给出后续入口。没有需要用户操作时，`required: false`，并在 message 中说明 Agent 将继续什么或任务已关闭。

大任务路线图也维护同名字段。当没有可执行的无依赖任务、需要范围确认或关键决策时，路线图的该字段必须转为 `required: true`，而不是静默等待。
