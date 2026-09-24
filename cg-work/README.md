# cg-work

`cg-work` 是内部 AI 软件开发框架的唯一推荐入口。它提供核心规则、按开发意图选择的工作流、框架自有/本地化技能与原始技能镜像、项目上下文和结构校验。框架自有说明使用中文；原始镜像技能保持上游原样。

## 使用顺序

1. 读取 `AGENTS.md` 和本文件。
2. 检查 `local/projects/<project-id>/project-context.yaml`；缺失或失效时先执行项目初始化并等待确认。
3. 先按 `core/operating-model.md` 识别低风险变更：纯文案、样式或静态布局调整使用 `framework:low-risk-change`，不创建需求箱、task 或自动化测试；其他变更先复用已有原始需求包，只有没有对应需求包时才新增到 `local/projects/<project-id>/requirements-inbox/`，再创建 `pending` task 并记录 `requirements_reference`。
4. 从 `workflows/` 选择项目初始化、低风险变更、功能、缺陷、重构、审查、框架优化或大任务拆分流程。
5. 按流程声明加载 `skills/` 中的 required skills。
6. 标准任务在同一任务目录保存计划、审查、验证、学习证据、风险和下一步行动；跨模块、高风险或用户要求审查的任务在 `plan.md` 内增加计划审核章节，不另建计划审查文件；满足 `workflows/bugfix.md` 轻量条件的缺陷仅在 `task.yaml` 保留根因、范围、验证、自审和集成结论。大任务额外在 `roadmaps/` 保存决策、覆盖与关闭索引。
   任务产物按生命周期逐步生成：先有需求包和 `task.yaml`，实施时补 `plan.md`，完成实现后补 `review.md` 与 `verification.md`，需要时再补 `learning.md` 和 `handoff.md`；详见 [任务证据生命周期](core/operating-model.md#任务证据生命周期)。
   若创建原型，记录原型引用及其采纳结论、实现映射和验证映射。
7. 通过新鲜验证和审查后，再确定集成方式并将任务标记为 `done`。
8. 运行 `scripts/check-all.mjs`，确认框架结构和工作流引用有效；任务或项目上下文更新后分别运行 `scripts/check-task.mjs` 和 `scripts/check-project.mjs`；维护技能镜像时另行运行 `scripts/check-skills.mjs`。

涉及新旧模型、历史数据、字段删除、接口兼容或数据迁移时，先区分模块生命周期与本次变更性质；新模块默认采用新模型，不自动兼容未发布旧实现。任何历史数据迁移、删除或语义转换必须提供选项并取得用户确认，再将选择记录为任务决策。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。项目技能目录由项目上下文的 `skills.paths` 指定，并相对于项目根路径解析。

## 目录边界

| 目录 | 唯一职责 |
|---|---|
| `core/` | 核心对象、上下文、命名、提交和维护规则 |
| `workflows/` | 按开发意图的流程和技能引用 |
| `skills/` | 框架自有技能、框架本地化技能与原始技能镜像；仅镜像不作本地改写 |
| `scripts/` | 结构、命名、链接和镜像一致性校验 |
| `local/` | 项目上下文、原始需求箱与任务产物，不提交真实数据 |

设计产物存放在 `local/projects/<project-id>/design/<design-name>/`；根目录 `designs/` 已废弃，不再用于新产物。

跨模块、跨会话、未决关键决策较多或不能作为单个任务验收的需求，使用 `framework:large-task-decomposition`：先通过 `framework:wayfinder` 明确决策，再在 `local/projects/<project-id>/roadmaps/<roadmap-id>/` 建立路线图，最后创建可独立验收的研发任务。关闭路线图时只生成索引，不迁移或删除任务证据。

新任务使用 `interaction_protocol: v1` 和 `next_user_action` 记录面向用户的下一步。等待确认、外部输入、审查验收或完成交接时，必须明确说明用户是否需要操作以及具体动作；没有操作时说明 Agent 将继续处理什么。

原型是任务的正式设计产物，不是可选的演示附件。声明 `prototype_reference` 的任务在审查或完成前，必须以 `prototype_disposition_reference` 说明采纳、部分采纳或不采纳的结论，并链接对应实现和验证证据。

## 提交规则

`cg-work/` 内框架内容默认全部提交；只有 `local/projects/` 下的真实项目数据、原始需求、任务、报告和运行产物不提交。项目业务规则、密钥和生产数据不得写入框架。

用户说“提交全部内容”时，默认表示提交当前任务范围内的全部有效实现、测试、文档和 SQL 变更；提交前应删除已确认无效或重复的测试，清理冗余实现，并将最新 SQL 变更整合到正式脚本，避免同一变更保留多份可执行脚本。提交后还要同步受影响的业务、架构、接口或维护文档，并重新执行文档引用和任务记录校验。该口径不包含自动推送、合并、部署或删除无法确认归属的改动；这些操作仍需单独授权。

根目录下以 `.` 开头的目录属于本机工具、编辑器或运行时状态，默认隐藏、忽略且不参与框架结构校验；不得将其中内容作为框架规则来源。

需求箱保存未经拆分的原始需求，不是按 task 计数的任务清单。同一需求包可以关联多个 task；task 通过 `requirements_reference` 指向来源，避免重复复制需求。新增业务规则、接口/数据结构或独立验收标准时必须创建新 task，不能只在旧 task 上追加 `next_action`；可用 `scope_decision` 记录新建或延续决策，确保计划、审查和验证证据独立。

项目上下文只有一个来源：`local/projects/<project-id>/project-context.yaml`。不要在工作流、技能或其他目录复制一份项目上下文。

项目代码规范以仓库自身声明为准；未覆盖的事项遵循 [项目通用代码规范](core/project-code-standards.md)。

多仓项目仍以 `project.root_path` 作为兼容的主仓库，可选 `repositories` 登记前后端等附属仓库；项目的验证入口、阶段和环境限制写在同一上下文的 `verification.profiles`。任务验证记录必须区分已通过、环境受限未执行和不适用，不能以替代检查冒充完整检查。

## 规则优先级

用户明确要求 > 项目自身规则 > `core/` > `workflows/` > 原始 `skills/` 建议。
