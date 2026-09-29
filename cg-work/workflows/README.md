# 工作流

本目录只定义流程顺序、状态门禁和技能引用。原始技能正文以 `skills/` 中的镜像为准；框架自有技能以其目录内容为准。

所有任务型开发工作流遵循同一阶段契约：

新任务优先使用 `artifact_profile: compact`：保留 `task.yaml` 作为唯一机器索引，并按任务意图选择一个主产物（产品需求用 `product.md`，技术设计用 `plan.md`，评审用 `review.md`，调研用 `research.md`）。验证、学习和交接信息默认回写主产物或 `task.yaml`，只有需要独立复用、正式交接或外部报告时才新增附属文件。未声明 compact 的历史任务继续使用原有引用规则，不要求迁移。

| 阶段 | 必须完成的事情 | 必须留下的记录 |
|---|---|---|
| `pending` | 建立任务、目标、范围和验收标准，并评估文档影响 | `task.yaml` |
| `in_progress` | 完成计划（复杂任务）、实现、过程验证，并记录会影响当前任务或未来复用的候选经验 | `plan.md`（需要时），必要时补充任务记录和 `learning.md` |
| `review` | 完成审查和新鲜验证，完成文档同步或记录无需更新的理由，处理或记录遗留问题，并判定候选经验去向 | 标准任务为 `review.md`、`verification.md`、`learning.md`（使用学习协议时）；轻量缺陷使用 `task.yaml` 的精简证据 |
| `done` | 用户接受结果、确定集成方式，并完成学习记录的交接或明确无可复用经验 | 标准任务为 `task.yaml` 中的终态和下一步、`learning.md`（使用学习协议时）；轻量缺陷使用 `task.yaml` 的集成结论 |

验证失败或审查发现问题时回到 `in_progress`；缺少外部条件进入 `blocked`；用户取消进入 `cancelled`。不得跳过 `review` 直接标记 `done`。

原型落地门禁：任务声明 `prototype_reference` 时，进入 `in_progress` 前必须以 `prototype_contract_reference` 引用实现契约，并在 `review` 或 `done` 时保持有效；进入 `review` 或 `done` 前还必须以 `prototype_disposition_reference` 引用采纳记录。实现契约必须有“问题与目标”“状态与场景”“视觉与响应式约束”“资源与依赖”“交互与业务规则”“验收映射”六节；采纳记录必须有“采纳结论”“实现映射”“验证映射”“未采纳项”四节。格式分别见 `core/prototype-implementation-contract.template.md` 和 `core/prototype-disposition.template.md`。未创建原型的任务不受此门禁影响。

## 执行模式

任务可通过 `execution_profile` 显式声明执行模式：

- `standard`：标准任务路径，保留计划、审查、验证和学习证据门禁。
- `lightweight`：仅适用于 `framework:bugfix` 的轻量缺陷，使用 `task.yaml` 内的精简证据替代独立记录。

省略 `execution_profile` 仍表示标准任务，用于兼容历史任务记录；新任务可显式填写 `standard` 以避免歧义。

## 标准编码前置检查

标准任务在进入审查前，必须完成 `standards_preflight`：

- 计划中列出需要常量化的状态、类型、路由、接口、阈值和重复业务字面量，并说明允许保留的例外。
- 编码时先完成常量、枚举、领域值或配置定义，再使用这些符号。
- 提交前运行项目已有静态检查；没有合适工具时，对当前差异做定向人工检查，并如实记录为人工检查，不得伪称自动通过。
- 原项目提交时默认保留测试文件，不自动删除或排除；仅覆盖简单映射、直通委托、样板代码或无独立回归价值的简单逻辑测试类和测试方法，在确认没有独立保护价值且用户或任务范围明确授权清理时，才在验证后删除、记录类/方法删除清单并复核差异；框架自身同样保留仍有保护价值的回归测试。两类提交都要整合最新 SQL 到正式脚本并移除直接相关冗余；提交后同步受影响文档，再重新执行文档引用和任务记录校验；不得误删无法确认归属的改动，且不默认推送、合并或部署。
- 审查只复核上述证据，不把首次发现硬编码作为唯一发现渠道。

`standards_preflight` 是标准任务计划/验证记录中的统一证据段落，不新增任务 YAML 必填字段；历史任务无需迁移。

## 轻量缺陷路径

仅 `framework:bugfix` 可声明 `execution_profile: lightweight`。适用条件、禁止项和证据字段以 [缺陷修复流程](bugfix.md) 为唯一来源；任务校验器负责执行这些门禁。

文档同步门禁：业务规则、用户流程、接口、数据模型或架构发生变化时，`documentation.impact` 必须为 `update` 或 `add`，并记录受影响文档和变更内容；确认现有文档仍准确时使用 `none` 并填写 `not_needed_reason`。`not_assessed` 不能进入 `done`。

## 低风险变更路径

`framework:low-risk-change` 用于纯文案、样式、静态布局或不改变行为的可访问性标记调整。适用条件与最低验证以 [工作模型](../core/operating-model.md#低风险变更) 为唯一来源；该路径不创建需求箱、task 或自动化测试。任何行为、路由、接口、数据、权限、配置语义、依赖或外部副作用变化都不适用，必须切换到对应标准工作流。

持续学习门禁：历史标准任务可声明 `learning_protocol: v1` 并引用 `learning.md`；compact 任务将可复用经验写入主产物或 `task.yaml`，不强制单独学习文件。`framework:bugfix` 的轻量缺陷不得声明该协议，发现可复用经验时必须转为标准任务。规则、格式和提升边界见 [持续学习与经验沉淀](../core/continuous-learning.md)。

用户下一步提醒：新任务必须声明 `interaction_protocol: v1` 并维护 `next_user_action`。进入 `review`、`blocked` 或 `done` 时，该对象必须说明是否需要用户操作、动作标识和一条可直接执行的提示；路线图没有可执行前沿任务时也必须更新同名字段。

| 文件 | 使用场景 |
|---|---|
| `project-discovery.md` | 在上下文加载前判断既有项目、新项目或信息不足，并在确认后路由 |
| `feature-development.md` | 新功能和行为变更 |
| `low-risk-change.md` | 纯文案、样式和静态布局调整 |
| `bugfix.md` | 缺陷、回归和性能问题 |
| `refactor.md` | 保持外部行为的结构调整 |
| `review.md` | 代码、变更和交付前审查 |
| `framework-optimization.md` | 框架规则、流程、模板、校验器和框架自有技能的演进 |
| `large-task-decomposition.md` | 多会话、跨模块或未决关键决策的大需求路线图、任务拆分和关闭归档 |
