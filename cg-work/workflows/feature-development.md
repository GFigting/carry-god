---
required_skills:
  - framework:verification-before-completion
optional_skills:
  - framework:domain-modeling
  - framework:research
  - framework:prototype
  - framework:using-git-worktrees
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:brainstorming
  - framework:writing-plans
  - framework:codebase-design
  - framework:test-driven-development
  - framework:code-review
  - framework:project-initialization
  - framework:parent-child-decomposition
  - framework:subagent-dispatch-timing
---

# 功能开发

先按 [工作模型的低风险变更](../core/operating-model.md#低风险变更) 筛选：符合条件时改用 `framework:low-risk-change`，不得创建需求箱或任务记录。其余功能开发按 [需求箱与需求引用](../core/operating-model.md#需求箱与需求引用) 处理需求来源（需求原文与取舍写入 `plan.md` 或决策记录；用户已手动添加对应需求包时以 `requirements_reference` 引用，任务产物不得写回需求箱）。创建 `pending` 任务记录，澄清目标、范围和验收标准，并评估业务文档影响，再完成设计、计划、实现、文档同步、验证和集成决策。若需求跨模块、跨会话、存在未决关键决策或无法作为一个独立任务验收，先按 [大任务拆分与关闭](parent-child-decomposition.md) 创建主任务，不得并列创建未挂靠主任务的子任务。若创建原型，任务记录只写 `prototype_reference`，实现契约与采纳章节的门禁见 [原型与任务记录](../core/operating-model.md#原型与任务记录)。完成实现后必须经过新鲜验证和审查，再进入 [review 阶段统一收尾](../core/operating-model.md#review-阶段统一收尾)。

### 轻量功能

满足 [轻量执行决策清单](../core/operating-model.md#轻量执行决策清单) 五项全部为“否”的单模块小功能，可声明 `delivery_path: lightweight`：保留 `task.yaml`，把范围、验证、自审与集成结论合并进 `lightweight_evidence`（功能类免填 `root_cause`），不创建独立计划、审查、验证、学习或交接文件，不做计划审核章节；测试按 [最小充分流程](../core/operating-model.md#最小充分流程) 价值分层执行。适用条件与升级触发以该节的决策清单和 [交付路径升级](../core/operating-model.md#交付路径升级) 为唯一来源。

技能加载按需化：`framework:verification-before-completion` 恒加载；`brainstorming`、`writing-plans`、`codebase-design`、`test-driven-development`、`code-review` 在跨模块、高风险或用户明确要求审查时加载，轻量执行与单模块小刀不强制。子任务与子智能体的派发时机、判据与反模式以 [`framework:subagent-dispatch-timing`](../skills/subagent-dispatch-timing/SKILL.md) 为唯一来源，本文件不重复正文。

原项目提交收尾属于 `review` 阶段，仓库边界按 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 执行：先完成验证和差异检查，再创建本地 Git commit；推送、合并、部署仍需单独授权。

进入实现前，跨模块、高风险或用户明确要求审查的任务，应参考 [`core/templates/plan.template.md`](../core/templates/plan.template.md) 在 `plan.md` 增加“计划审核”章节。该章节至少回看需求覆盖、范围、依赖、实施步骤、验收标准和风险。需要子智能体做需求与规范两线计划审核时，派发时机、两线分工与主 Agent 汇总职责以 [`framework:subagent-dispatch-timing`](../skills/subagent-dispatch-timing/SKILL.md) 分阶段判据为准。计划审核结论直接留在 `plan.md`，不新增 `plan-review.md`、任务状态或额外校验门禁。

功能开发的测试按 [最小充分流程](../core/operating-model.md#最小充分流程) 的价值分层执行：数据不可逆、红线和真会悄悄坏的核心逻辑，必须新增或更新自动化测试；界面、交互与文案改动以人工验收为准。测试类与测试方法的生成标准见 [命名与提交](../core/naming-and-submission.md#测试类与测试方法生成标准)；需求迭代删除旧行为时，先检查并保留或改写相关测试，只有确认没有独立保护价值时才删除，并在审查记录中说明测试处理结论。

计划与验证记录中「标准编码前置检查」的内容与写入时点以 [标准编码前置检查](README.md#标准编码前置检查) 为唯一来源。
