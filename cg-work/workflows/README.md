# 工作流

本目录只定义流程顺序、状态门禁和技能引用。原始技能正文以 `skills/` 中的镜像为准；框架自有技能以其目录内容为准。

## 阶段契约

所有任务型开发工作流遵循同一阶段契约：各阶段的必要产物与记录内容以 [工作模型的任务证据生命周期](../core/operating-model.md#任务证据生命周期) 为唯一来源（`delivery_path` 三档声明、compact 的主产物组织方式与历史任务不迁移也在该节）；状态流转与异常状态——验证失败回 `in_progress`、缺外部条件 `blocked`、用户取消 `cancelled`、不得跳过 `review` 直接进入 `done`——以工作模型的状态机为唯一来源；三档互斥、轻量决策清单与升级规则见 [最小充分流程](../core/operating-model.md#最小充分流程)。原型任务的实现契约与采纳门禁以 [原型与任务记录](../core/operating-model.md#原型与任务记录) 为唯一来源（compact 任务写入其主产物）。

## 执行模式

任务通过单一字段 `delivery_path` 声明交付路径（`standard` / `lightweight` / `compact`，省略时默认 `standard`）：三档定义、证据门禁与历史任务兼容以 [工作模型的任务证据生命周期](../core/operating-model.md#任务证据生命周期) 为唯一来源，路径选择、互斥规则、轻量执行决策清单与升级规则以 [最小充分流程](../core/operating-model.md#最小充分流程) 为唯一来源；轻量档的证据字段以 [缺陷修复](bugfix.md) 与 [功能开发](feature-development.md) 为唯一来源。

## 标准编码前置检查

标准任务在进入审查前，必须完成「标准编码前置检查」：

- 计划中列出需要常量化的状态、类型、路由、接口、阈值和重复业务字面量，并说明允许保留的例外。
- 编码时先完成常量、枚举、领域值或配置定义，再使用这些符号。
- 提交前运行项目已有静态检查；没有合适工具时，对当前差异做定向人工检查，并如实记录为人工检查，不得伪称自动通过。
- 提交收尾的仓库边界（测试处理、SQL 整合、冗余清理、文档同步和授权范围）以 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 为唯一来源，本节不重复正文。
- 审查只复核上述证据，不把首次发现硬编码作为唯一发现渠道。

「标准编码前置检查」是标准任务计划/验证记录中的统一证据段落，不新增任务 YAML 必填字段；历史任务无需迁移。

## 轻量执行路径

`framework:bugfix` 与 `framework:feature-development` 可声明 `delivery_path: lightweight`。适用条件、禁止项和证据字段以对应工作流（[缺陷修复](bugfix.md)、[功能开发](feature-development.md)）为唯一来源；是否允许轻量执行按 [轻量执行决策清单](../core/operating-model.md#轻量执行决策清单) 判定。

文档同步门禁：业务规则、用户流程、接口、数据模型或架构发生变化时，`documentation.impact` 必须为 `update` 或 `add`，并记录受影响文档和变更内容；确认现有文档仍准确时使用 `none` 并填写 `reason`。`not_assessed` 不能进入 `done`。

## 低风险变更路径

`framework:low-risk-change` 用于纯文案、样式、静态布局或不改变行为的可访问性标记调整。适用条件与最低验证以 [工作模型](../core/operating-model.md#低风险变更) 为唯一来源；该路径不创建需求箱、task 或自动化测试。任何行为、路由、接口、数据、权限、配置语义、依赖或外部副作用变化都不适用，必须切换到对应标准工作流。

持续学习门禁：标准任务在 `artifacts.learning` 引用 `learning.md` 即视为启用；compact 任务将可复用经验写入主产物或 `task.yaml`，不强制单独学习文件。轻量执行任务不得引用学习记录，发现可复用经验时必须按 [交付路径升级](../core/operating-model.md#交付路径升级) 升级为标准执行。规则、格式和提升边界见 [持续学习与经验沉淀](../core/continuous-learning.md)。

用户下一步提醒：新任务必须维护 `next_action`（`required`/`action`/`message`）。进入 `review`、`blocked` 或 `done` 时，`required` 与 `action` 必填，说明是否需要用户操作、动作标识和一条可直接执行的提示；主任务没有可执行前沿子任务时也必须更新同名字段。等待验收的积压用 `npm run queue` 查看，用户可一次验收多条；批量验收在写入前会先校验证据完整性，不改变 `done` 的门禁。

| 文件 | 使用场景 |
|---|---|
| `project-discovery.md` | 在上下文加载前判断既有项目、新项目或信息不足，既有项目唯一匹配自动路由，其余确认后路由 |
| `feature-development.md` | 新功能和行为变更（小功能可走轻量执行） |
| `low-risk-change.md` | 纯文案、样式和静态布局调整 |
| `bugfix.md` | 缺陷、回归和性能问题 |
| `refactor.md` | 保持外部行为的结构调整 |
| `review.md` | 代码、变更和交付前审查 |
| `framework-optimization.md` | 框架规则、流程、模板、校验器和框架自有技能的演进 |
| `parent-child-decomposition.md` | 多会话、跨模块或未决关键决策的大需求：主任务创建、子任务拆分、推进与关闭 |
