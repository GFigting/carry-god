# 上下文加载

先检查 `local/projects/<project-id>/project-context.yaml` 是否存在且有效。

- 存在且有效：读取上下文，再按任务阶段加载项目规则、业务文档、架构文档、接口文档和项目技能路径。
- 不存在或失效：按 [项目接入规则](project-onboarding.md) 执行 `framework:project-initialization`。

项目上下文创建时使用 `core/project-context.template.yaml`。

加载项目规则时，优先读取 `instructions.files` 与 `coding_standards.files` 登记的项目规则，以及仓库工具配置；对于项目未覆盖的事项，再应用 [项目通用代码规范](project-code-standards.md)。该规范约束计划、编码和提交前自查，不限于最终审查。

原始需求先存入 `requirements.inbox_path` 所指向的本地需求箱；需求箱保存未经拆分的需求包、附件和澄清材料。同一需求包可以支撑多个 task，创建 task 前应先查找并复用已有需求包，并在 task 中以 `requirements_reference` 建立引用；只有没有对应来源时才新增需求包。符合 [工作模型的低风险变更](operating-model.md#低风险变更) 不创建需求箱或任务记录，直接按 `framework:low-risk-change` 完成最小验证。其他需求先判断是否需要 `framework:large-task-decomposition`：需要时，在 `roadmaps/<roadmap-id>/` 保存决策地图的本地索引、覆盖关系和关闭记录；创建开发任务后，任务记录、计划、审查、验证和学习证据仍只保存在 `tasks/<task-id>/`。使用持续学习协议的任务还须读取 [持续学习与经验沉淀](continuous-learning.md)。具体约束见 [项目接入规则](project-onboarding.md)。

任务产物按生命周期逐步生成：创建阶段先保留原始需求包和 `task.yaml`；开始实施时补充 `plan.md`；实现完成进入审查时补充 `review.md` 和 `verification.md`；任务声明持续学习协议时补充 `learning.md`；交接或关闭时补充 `handoff.md`。这些文件分别记录不同事实，不应以测试结果替代审查结论，也不应以审查结论替代验证证据。

项目技能路径使用 `skills.paths` 声明，路径相对于 `project.root_path` 解析。例如 `.cg-work/skills` 对应项目根目录下的 `.cg-work/skills/`。先加载 `cg-work/skills/` 中的框架技能，再加载这些路径中的项目技能。登记的项目规则与文档路径（`instructions.files`、`coding_standards.files`、`documents.*`、`required_context`、`requirements.inbox_path`）同样相对于 `project.root_path` 解析，绝对路径亦可直接使用——优先相对写法以保证跨机/跨目录可移植。

单仓项目继续以 `project.root_path` 作为主仓库。存在前后端或多个独立仓库时，可在可选的 `repositories` 中登记每个仓库的稳定 `id`、`role` 和绝对 `root_path`；`project.root_path` 不因此失效。执行验证前，先读取可选的 `verification.profiles`：每项声明 `stage`、`command`、`outcome` 及可选 `limitation`。`required` 表示该阶段应执行，`environment_limited` 表示必须保留未完成原因而不能写为通过，`not_applicable` 表示该任务不适用。profile 是项目验证入口的唯一记录处，不替代任务内的新鲜验证证据。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。项目技能只补充当前项目规则，不能静默覆盖框架规则；路径不存在或技能不可读时记录 `unavailable`。

项目上下文缺失、路径无效或文档无法读取时，只能调查和澄清，不能直接修改项目代码。涉及术语时遵循项目词汇表。不得把密钥、令牌、密码或生产数据写入上下文。
