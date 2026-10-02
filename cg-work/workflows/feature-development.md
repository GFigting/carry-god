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
  - framework:large-task-decomposition
---

# 功能开发

先按 [工作模型的低风险变更](../core/operating-model.md#低风险变更) 筛选：符合条件时改用 `framework:low-risk-change`，不得创建需求箱或任务记录。其余功能开发读取项目上下文和 `requirements.inbox_path` 中的原始需求包；创建 `pending` 任务记录，澄清目标、范围和验收标准，并评估业务文档影响。一个原始需求包可关联多个任务，但任务产物不得写回需求箱；再完成设计、计划、实现、文档同步、验证和集成决策。若需求跨模块、跨会话、存在未决关键决策或无法作为一个独立任务验收，先切换至 [大任务拆分与关闭](large-task-decomposition.md)，不得直接并列创建无路线图的任务。若创建原型，任务记录须写入 `prototype_reference` 和实现契约引用 `prototype_contract_reference`，并在进入 `in_progress` 前完成契约；将原型作为正式设计输入，在进入 `review` 前按 `core/prototype-implementation-contract.template.md` 记录状态、视觉、资源、交互和验收映射，并按 `core/prototype-disposition.template.md` 记录采纳结论、实现映射、验证映射和未采纳项。完成实现后必须经过新鲜验证和审查，再进入统一收尾流程。

### 轻量功能

单模块边界、业务规则无未决、无数据迁移且可逆的小功能，可声明 `execution_profile: lightweight`：保留需求箱与 `task.yaml`，把范围、验证、自审与集成结论合并进 `lightweight_evidence`（功能类免填 `root_cause`），不创建独立计划、审查、验证、学习或交接文件，不做计划审核章节；测试按 [工作模型的最小充分流程](../core/operating-model.md#最小充分流程) 价值分层执行。任一条件不满足（跨模块、规则未决、迁移、不可逆）立即转标准路径。

技能加载按需化：`framework:verification-before-completion` 恒加载；`brainstorming`、`writing-plans`、`codebase-design`、`test-driven-development`、`code-review` 在跨模块、高风险或用户明确要求审查时加载，轻量档与单模块小刀不强制。子任务派发（含子智能体）沿用同一比例原则：默认最小交付，明确测试口径与决断边界；需要并行时按文件所有权切分任务边界，实现类子代理不并行派发（文件冲突），审查类可并行。

原项目提交收尾属于 `review` 阶段，仓库边界按 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 执行：先完成验证和差异检查，再创建本地 Git commit；推送、合并、部署仍需单独授权。

进入实现前，跨模块、高风险或用户明确要求审查的任务，应参考 [`core/plan.template.md`](../core/plan.template.md) 在 `plan.md` 增加“计划审核”章节。该章节至少回看需求覆盖、范围、依赖、实施步骤、验收标准和风险；必要时由子智能体按规范审查和需求审查两个角度提出意见。计划审核结论直接留在 `plan.md`，不新增 `plan-review.md`、任务状态或额外校验门禁。

调用子智能体时，主 Agent 应分别提供同一份 `plan.md` 和需求引用：

- **需求审核线**：只判断需求覆盖、验收标准、范围遗漏或越界，并按“问题—依据—建议”输出。
- **规范审核线**：只判断计划结构、依赖、步骤、风险、验证可执行性和项目规范，并按“问题—依据—建议”输出。
- **主 Agent**：合并重复意见，决定是否修改计划，将最终结论写入“计划审核”章节；涉及业务取舍时交由用户确认。

两条审核线可以并行，但同一子智能体不应同时代表需求方和规范方作最终结论。

功能开发的测试按 [最小充分流程](../core/operating-model.md#最小充分流程) 的价值分层执行：数据不可逆、红线和真会悄悄坏的核心逻辑，必须新增或更新自动化测试；界面、交互与文案改动以人工验收为准。测试类与测试方法的生成标准见 [命名与提交](../core/naming-and-submission.md#测试类与测试方法生成标准)；需求迭代删除旧行为时，先检查并保留或改写相关测试，只有确认没有独立保护价值时才删除，并在审查记录中说明测试处理结论。

进入实现前，计划必须包含 `standards_preflight`：列出本次变更需要常量化的业务字面量及允许例外；编码完成后，验证记录必须补充项目静态检查或当前差异人工检查结果。审查阶段复核该证据，不以审查作为首次发现硬编码的时点。
