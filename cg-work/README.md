# cg-work

`cg-work` 是内部 AI 软件开发框架的唯一推荐入口。它提供核心规则、按开发意图选择的工作流、框架自有/本地化技能与原始技能镜像、项目上下文和结构校验。框架自有说明使用中文；原始镜像技能保持上游原样。

## 使用顺序

1. 读取 `AGENTS.md` 和本文件。
2. 先执行 `framework:project-discovery`：先自查已有项目候选再一问一答，判断请求属于既有项目、新项目或信息不足；既有项目唯一匹配时展示识别摘要后直接继续，新项目与信息不足等待确认识别摘要。
3. 对既有项目检查 `local/projects/<project-id>/project-context.yaml`，缺失或失效时直接执行 `framework:project-initialization`；对新项目确认识别摘要后执行 `framework:project-initialization`。
4. 再按 `core/operating-model.md` 识别低风险变更：纯文案、样式或静态布局调整使用 `framework:low-risk-change`，不创建需求箱、task 或自动化测试；其他变更创建 `pending` task，需求原文与取舍直接写入任务 `plan.md` 或决策记录。需求箱只接受用户手动添加的原始需求，Agent 不生成需求包；任务无需关联需求，用户已放入对应需求包时按 [需求箱与需求引用](core/operating-model.md#需求箱与需求引用) 复用引用。
5. 按流程声明加载 `skills/` 中的 required skills。
6. 进入工作流前展示决策预检简报；低风险或可逆事项可自动继续，高风险或不可逆事项等待用户确认，并在需要时再加载 `grilling` 或其他特殊技能。
7. 标准任务在同一任务目录保存计划、审查、验证、学习证据、风险和下一步行动；跨模块、高风险或用户要求审查的任务在 `plan.md` 内增加计划审核章节，不另建计划审查文件；满足 `workflows/bugfix.md` 轻量条件的缺陷仅在 `task.yaml` 保留根因、范围、验证、自审和集成结论，满足 `workflows/feature-development.md` 轻量条件的小功能同样在 `task.yaml` 合并范围、验证、自审与集成结论（见 [最小充分流程](core/operating-model.md#最小充分流程)）。大任务创建主任务（`role: parent`）承载决策、覆盖与遗留，子任务以 `parent_reference` 挂靠（见 [大任务主从拆分](core/operating-model.md#大任务主从拆分)）。
   新任务可使用 `delivery_path: compact`：先有 `task.yaml`，再按任务意图生成一个主产物；验证、学习和交接默认回写任务记录或主产物。历史任务继续按原有产物引用规则运行；详见 [任务证据生命周期](core/operating-model.md#任务证据生命周期)。
   若创建原型，记录原型引用及其采纳结论、实现映射和验证映射。
8. 在 `review` 阶段完成统一收尾（验证、测试处理、冗余清理、文档同步和集成决策）后：轻量、单模块且不改变业务规则/接口/数据/权限的任务，验证通过后可由 Agent 自动标记为 `done`；其他任务必须等待用户验收。
9. 运行 `npm run check`（等价于 `node scripts/check-all.mjs`），确认框架结构、文档锚点、工作流引用和框架受管项目记录有效；单文件校验使用 `node scripts/check-project.mjs <project-context.yaml>`。需要交付验收时用 `npm run queue` 查看待验收清单，并用 `node scripts/acceptance-queue.mjs --accept <id>[,<id>...] --note "<说明>"` 一次验收多条。
10. 涉及外部系统、破坏性、生产数据、认证、部署或跨会话操作时，先读取 `core/special-operations.md`，按其场景表完成决策预检并取得用户授权；集成前的分支收尾同样适用。

涉及新旧模型、历史数据、字段删除、接口兼容或数据迁移时，先区分模块生命周期与本次变更性质；新模块默认采用新模型，不自动兼容未发布旧实现。任何历史数据迁移、删除或语义转换必须提供选项并取得用户确认，再将选择记录为任务决策。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。`framework:<name>` 的含义由所在位置决定：在 `task.yaml` 的 `workflow` 字段中指向 `workflows/<name>.md`，在工作流的技能字段和正文中指向 `skills/<name>/`——按字段判定，不按名字猜。项目技能目录由项目上下文的 `skills.paths` 指定，登记绝对路径或相对 `project.root_path` 解析的路径。

产品需求、用户故事、验收标准、优先级、路线图或版本验收尚未成形时，可显式调用 `framework:product-management`。该技能只负责产品定义和交付边界，不自动修改业务代码或外部系统；项目级路线图写入**原项目仓库内**并登记到项目上下文的 `product.roadmap_path`（格式见 [项目路线图模板](core/templates/product-roadmap.template.md)），确认后的定义可继续交给 `framework:to-spec` 或 `framework:to-tickets`，实现仍遵循 `framework:feature-development`。

## 目录边界

| 目录 | 唯一职责 |
|---|---|
| `core/` | 核心对象、上下文、命名、提交和维护规则 |
| `workflows/` | 按开发意图的流程和技能引用 |
| `skills/` | 框架自有技能、框架本地化技能与原始技能镜像；仅镜像不作本地改写 |
| `scripts/` | 结构、命名、链接和镜像一致性校验 |
| `local/` | 项目上下文、原始需求箱与任务产物，不提交真实数据 |

`local/tools/` 是本机工具副本目录，默认不入库；例外：`local/tools/browser-test/` 是 Web 项目共用的浏览器验收测试工具（配置驱动、证据可校验），随框架提交，用法见 [browser-test README](local/tools/browser-test/README.md)，各项目的套件配置在工具内 `<project>/test-suites.json` 并登记到项目上下文的 `tooling.config_paths`。

单页面原型和不依赖业务仓库的多页面原型存放在 `local/projects/<project-id>/design/<design-name>/`；根目录 `designs/` 已废弃，不再用于新产物。依赖真实项目路由、组件或运行入口的多页面原型，可由用户选择存放在关联项目的 `<project.root_path>/prototypes/<design-name>/`，并在项目上下文的 `prototypes.paths` 中登记路径和入口。

跨模块、跨会话、未决关键决策较多或不能作为单个任务验收的需求，使用 `framework:parent-child-decomposition`：先按决策分级明确关键决策（模糊时经 `framework:wayfinder`），再创建主任务（`role: parent`），其 `task.yaml` 记录决策、`plan.md` 记录需求覆盖与拆分（格式见 [主任务计划模板](core/templates/parent-plan.template.md)），最后创建以 `parent_reference` 挂靠、可独立验收的研发任务。关闭主任务只在其审查记录留存结论，不迁移或删除子任务证据。存量路线图（`roadmaps/` 三件套）双轨保留可继续使用，但不再新建。

**项目路线图**是另一种产物：它存放在**原项目仓库内**（惯例 `docs/roadmap.md`），登记在项目上下文的 `product.roadmap_path`，按版本与主题编排整个项目的切片、状态与验收，由 `framework:product-management` 维护，格式见 [项目路线图模板](core/templates/product-roadmap.template.md)，内容校验见 `scripts/check-product.mjs`。主任务服务于"一个大需求"且留在框架本地任务目录内，项目路线图服务于"整个项目"且随项目代码版本化，两者不互相替代。

新任务使用 `next_action` 记录面向用户的下一步（`required`/`action`/`message`）。等待确认、外部输入、审查验收或完成交接时，必须明确说明用户是否需要操作以及具体动作；没有操作时说明 Agent 将继续处理什么。

历史任务如需退出日常验收清单，可使用 `scripts/archive-tasks.mjs` 的归档路径。归档任务移动到 `tasks/archive/<task-id>/`，仅被归档任务引用的需求包移动到 `requirements-inbox/archive/`；归档保留原任务状态和证据，不代表 `done` 或用户验收。归档任务不再进入验收队列和常规生命周期校验，具体用法见 [脚本说明](scripts/README.md)。

任务字段演进使用 `scripts/migrate-task-metadata.mjs` 的迁移路径：新任务的文档影响字段使用 `files`/`reason`，状态历史使用结构化 `status`/`at`/`reason`；历史别名（`targets`、`not_needed_reason`、字符串数组简写）已废弃，需先运行迁移再按 [工作模型](core/operating-model.md) 使用新字段。

原型是任务的正式设计产物，不是可选的演示附件。声明 `prototype_reference` 的任务在进入实现前必须在计划记录写 `## 原型实现契约` 章节，在审查或完成前必须在评审记录写 `## 原型采纳` 章节，说明采纳、部分采纳或不采纳的结论，并链接对应实现和验证证据；规则与章节骨架见 [原型与任务记录](core/operating-model.md#原型与任务记录)。

## 提交规则

`cg-work/` 内框架内容默认全部提交，包括框架受管项目 `local/projects/cg-work/` 的上下文、需求包、任务与报告；只有业务项目 `local/projects/<project-id>/` 下的真实数据、原始需求、任务、报告和运行产物保持本地。项目业务规则、密钥和生产数据不得写入框架。

提交收尾的仓库边界以 [命名与提交](core/naming-and-submission.md#原项目提交口径) 为唯一来源，本文件不重复正文。提交收尾在 `review` 阶段完成，仅创建本地 commit；推送、合并、部署和删除无法确认归属的改动仍需单独授权。

根目录下以 `.` 开头的目录属于本机工具、编辑器或运行时状态，默认隐藏、忽略且不参与框架结构校验；不得将其中内容作为框架规则来源。

需求箱保存未经拆分的原始需求，内容只允许用户手动添加，Agent 不生成需求包；任务不需要关联需求，存在用户手动放入的对应需求包时通过 `requirements_reference` 指向来源，同一需求包可以关联多个 task，避免重复复制需求。新增业务规则、接口/数据结构或独立验收标准时必须创建新 task，不能只在旧 task 上追加 `next_action`；可用 `scope_decision` 记录新建或延续决策，确保计划、审查和验证证据独立。新任务可声明 `delivery_path: compact`，使用 `task.yaml` 加一个按意图选择的主产物，避免预创建分散文件。

项目上下文只有一个来源：`local/projects/<project-id>/project-context.yaml`。不要在工作流、技能或其他目录复制一份项目上下文。

项目代码规范以仓库自身声明为准；未覆盖的事项遵循 [项目通用代码规范](core/project-code-standards.md)。

多仓项目仍以 `project.root_path` 作为兼容的主仓库，可选 `repositories` 登记前后端等附属仓库；项目的验证入口、阶段和环境限制写在同一上下文的 `verification.profiles`。任务验证记录必须区分已通过、环境受限未执行和不适用，不能以替代检查冒充完整检查。

项目若登记了上下文 `submission`，业务仓库提交必须优先使用其中的工具和说明；没有登记时才按 [命名与提交](core/naming-and-submission.md) 使用通用 Git 收尾流程。

## 规则优先级

用户明确要求 > 项目自身规则 > `core/` > `workflows/` > 原始 `skills/` 建议。
