# 项目上下文

项目上下文是项目稳定事实和执行入口的唯一登记处：`local/projects/<project-id>/project-context.yaml`。本文件按 Agent 的实际顺序组织：识别门禁 → 接入与初始化 → 字段规范 → 加载规则。

## 识别与初始化门禁

项目开发请求先经过 `framework:project-discovery`。通过门禁前，不创建项目任务或修改项目。

- 先运行 `framework:project-discovery` 判断当前请求属于既有项目（`existing-project`）、新项目（`new-project`）或信息不足（`needs-clarification`）。既有项目唯一匹配时，Agent 自查 `local/projects/*/project-context.yaml` 候选后展示识别摘要并直接进入下一步，不等待确认，摘要标注「已自动继续，可随时打断纠正」；新项目与信息不足必须取得用户对识别摘要的确认。该阶段只确认项目归属，与需求澄清分开，不能用"新增功能"或目录是否为空替代项目身份判断。
- 需要向用户提问时一问一答收集缺失事实；摘要包含分类、项目名、根路径、已知目标和缺失项。既有项目唯一匹配以外的分类，用户明确确认前状态保持等待，不创建任务或初始化产物。
- 对既有项目，再检查 `local/projects/<project-id>/project-context.yaml` 是否存在且有效。存在且有效则读取上下文并按本文「加载规则」继续；不存在或失效则直接执行 `framework:project-initialization`，确认不作为前置门禁。新项目必须在识别摘要确认后才进入初始化。
- 项目首次接入或上下文失效时，必须使用 `framework:project-initialization`。初始化只允许探测和生成本地框架产物；新项目在用户确认新的或更新后的上下文前，不得修改项目代码、项目规则、CI、Git 配置或依赖，也不得启动服务、执行迁移或创建凭据。
- 既有项目上下文失效时先生成差异报告并写入初始化任务记录供事后查阅，初始化完成即加载新上下文继续，不得静默覆盖；新项目的初始化任务保持 `pending`，后续开发工作流只能在确认后开始。

## 项目关联不变量

项目上下文是所有开发工作流的前置输入，唯一来源为 `local/projects/<project-id>/project-context.yaml`。`project-id` 使用项目根目录名转换得到的小写 `kebab-case` 标识；发生重名时追加稳定的仓库或组织标识。初始化任务记录必须记录原始项目路径、生成的 ID 和重名判断。

每个已初始化项目必须拥有原始需求箱，并把需求箱目录登记为 `requirements.inbox_path`；任务计划、审查和验证证据仍只保存在 `tasks/<task-id>/`。项目上下文、需求箱和任务记录不得写入密钥、令牌、密码、生产数据或完整个人信息。

项目上下文、需求箱和报告路径必须有效；项目规则入口明确；项目规则和代码规范文档登记在 `documentation.project_rules` 与 `documentation.development_standards`；历史上下文可继续使用 `instructions.files` 和 `coding_standards.files`。项目技能路径可解析并由项目仓库维护，不复制到 `cg-work/skills/`。后续按文档记录的 `load` 值加载，并读取 `skills.paths` 登记的项目技能。

项目上下文创建时使用 `core/templates/project-context.template.yaml`。

## 字段规范

### 顶层字段顺序

按 Agent 阅读项目的流程分为四组：

**项目边界**

1. `project`：项目身份和主仓库。
2. `repositories`：附属仓库及职责；单仓项目保留空列表。

**项目事实**

3. `documentation`：稳定文档关联及加载时机。
4. `technology`：技术栈和包管理器。
5. `runtime`：启动入口和健康检查。
6. `database`：SQL 脚本目录。

**执行入口**

7. `tooling`：按需读取的工具配置。
8. `verification`：按阶段组织的验证入口。
9. `requirements`：框架本地需求箱。

**项目产物与扩展**

10. `product`：项目级路线图。
11. `prototypes`：依赖项目代码的原型。
12. `skills`：项目专属技能目录。
13. `submission`：项目专用提交工具；没有时省略。

顺序只服务于阅读和维护，不改变 YAML 语义。校验器应校验字段结构和路径，不应把字段出现顺序当作业务条件。

### 字段职责与必需性

| 字段 | 必需性 | 职责 | 不应放入 |
|---|---|---|---|
| `project` | 必需 | 稳定 ID、名称、领域、主仓库 | 运行命令、文档清单 |
| `repositories` | 推荐保留 | 多仓角色和路径 | 模块能力说明 |
| `documentation` | 必需 | 稳定文档的分类入口；每项含 `path`、`load` | 命令、路线图单一路径、任务证据 |
| `technology` | 必需 | 语言、框架、包管理器 | 测试和构建命令 |
| `runtime` | 必需 | 启动入口、健康检查 | 部署策略、验证结论 |
| `tooling` | 可选 | MCP 和开发工具配置路径 | 凭据、常驻规则 |
| `verification` | 推荐 | 可执行验证 profile 及限制 | 某次任务的新鲜结果 |
| `requirements` | 必需 | 原始需求箱路径 | 已拆分任务 |
| `prototypes` | 可选 | 项目仓库内原型目录和入口 | 框架本地设计产物 |
| `product` | 可选 | 项目级路线图路径 | 大任务主任务（`role: parent`） |
| `database` | 可选 | SQL 变更、初始化和修复脚本目录 | 数据字典和数据库规则文档 |
| `skills` | 必需 | 项目专属技能路径 | 通用框架技能 |
| `submission` | 可选 | 项目专用提交工具和策略 | 用户临时授权 |

`required_context` 已废弃。必读文档使用 `documentation.*[].load: always`，按需文档使用 `when_relevant`，避免重复登记路径。

`documentation` 子类别固定为 `project_rules`、`development_standards`、`business`、`architecture`、`api`、`data`、`operations`、`security`；`runtime`、`verification`、`database` 和 `product.roadmap_path` 是各自领域的专属入口，不重复登记进 `documentation`。

### 验证入口探测线索

`verification.profiles` 是项目测试、静态检查与构建入口的唯一登记处。项目首次接入或上下文失效时按以下顺序探测，可信度从高到低，不得凭经验编造命令：

1. **CI/自动化配置**：`.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile` 等文件中真实执行的测试、Lint 和构建命令；与文档描述冲突时以 CI 为准并记录差异。
2. **项目自述文档**：`AGENTS.md`、`CLAUDE.md`、`CONTRIBUTING.md`、`README.md` 中的测试与验证章节。
3. **构建工具配置映射**：`package.json` 的 `scripts.test`/`test:*`（`vitest.config.*`、`jest.config.*`、`playwright.config.*` 区分单测与 E2E 入口）、`pom.xml`（`mvn test`，多模块补 `-pl <module>` 定向入口）、`build.gradle*`/`gradlew`、`pytest.ini`/`pyproject.toml [tool.pytest]`/`tox.ini`、`go.mod`、`Cargo.toml`、`*.sln`/`*.csproj`、`Makefile` 的 `test:` 目标、`docker-compose.test.yml` 等容器化测试入口。
4. **monorepo/多模块展开**：`pnpm-workspace.yaml`、`workspaces`、Maven 多模块的全量入口与模块级定向入口分别登记，工作目录与依赖前置条件写入 `limitation`。

登记时按 `stage` 区分（如 `full_test`、`targeted_test`、`targeted_compile`、`static`、`build`）。四层都无线索时 `profiles` 保持为空，在初始化任务记录缺口并一问一答向用户确认。

### 优化规则

- `documentation` 只关联稳定、可复用的文档；暂时没有某类文档时保留空列表并记录缺口，不创建占位文件。
- `runtime`、`verification`、`database` 和 `product` 是专属入口，不把它们重复登记到 `documentation`。
- `technology` 只写技术事实；测试、构建和验收命令统一写入 `verification.profiles`。
- `database.sql_paths` 只写脚本目录；表结构、数据字典和迁移规则写入 `documentation.data`。
- `repositories` 只描述仓库边界；模块地图和能力地图写入 `documentation.architecture`。
- 文件和目录路径可使用绝对路径，或相对 `project.root_path` 解析的路径；`cg-work` 相对框架根目录解析。
- 删除或改名字段时先更新模板、校验器、加载规范、所有受管上下文和测试，不能只修改单个项目文件。

## 加载规则

`documentation` 是稳定文档的唯一关联入口。每条记录包含 `path` 和 `load`：`always` 表示每项任务都必须读取，`when_relevant` 表示按任务主题读取。同一文档只登记一次；特定操作需要的说明仍放在专属字段，例如 `submission.instructions`。不再使用独立的 `required_context` 字段。文档的类别、登记边界与质量要求见 [项目文档规范](documentation-standards.md)。

`tooling.config_paths` 登记按需读取的 MCP 或开发工具配置，不作为项目规则或常驻文档加载；`database.sql_paths` 登记项目仓库内 SQL 脚本目录。验证命令统一登记在 `verification.profiles`，不在 `technology` 重复配置测试或构建命令。

加载项目规则时，优先读取 `documentation.project_rules` 与 `documentation.development_standards` 登记的项目规则，以及仓库工具配置；对于项目未覆盖的事项，再应用 [项目通用代码规范](project-code-standards.md)。历史项目对应读取 `instructions.files` 与 `coding_standards.files`。该规范约束计划、编码和提交前自查，不限于最终审查。

原始需求只由用户手动添加到 `requirements.inbox_path` 所指向的本地需求箱，Agent 不生成需求包；任务是否需要关联需求、需求引用复用的规则正文见 [需求箱与需求引用](operating-model.md#需求箱与需求引用)，新范围何时拆分新任务见 [需求范围变化与任务拆分](operating-model.md#需求范围变化与任务拆分)。符合 [工作模型的低风险变更](operating-model.md#低风险变更) 不创建需求箱或任务记录，直接按 `framework:low-risk-change` 完成最小验证。其他需求先判断是否需要 `framework:parent-child-decomposition`：需要时按 [大任务主从拆分](operating-model.md#大任务主从拆分) 创建主任务（`role: parent`）与挂靠的子任务。使用持续学习协议的任务还须读取 [持续学习与经验沉淀](continuous-learning.md)。

任务产物按生命周期逐步生成，计划、审查、验证、学习各文件记录不同事实，不互相替代（例如不以测试结果替代审查结论）；阶段、必要产物与内容的规则正文见 [工作模型的任务证据生命周期](operating-model.md#任务证据生命周期)。字段职责与必需性见本文「字段规范」。

项目技能路径使用 `skills.paths` 声明。项目上下文中登记的文件和目录路径可使用绝对路径，或相对 `project.root_path` 解析的路径，覆盖 `documentation.*`、历史文档字段、运行文件入口、需求箱、技能路径、原型路径、SQL 脚本目录和项目路线图路径；术语表归入 `documentation.business`；URL 与执行命令按各自字段语义处理。`cg-work` 的相对路径相对框架目录解析，并可用字面量 `project.root_path: .` 保持已提交上下文跨机可用。先加载 `cg-work/skills/` 中的框架技能，再加载项目技能路径中的技能。

项目上下文可选声明 `submission`，登记业务仓库的提交工具、工具说明、默认参数和推送/合并/部署策略。进入提交或分支收尾流程前，Agent 必须先读取 `submission.instructions`，优先使用 `submission.tool`；`submission.policies` 只表达项目边界，不替代用户对推送、合并、部署等外部操作的明确授权。

依赖业务项目代码的多页面原型可以放在 `<project.root_path>/prototypes/<design-name>/`。此类原型必须在项目上下文的可选 `prototypes.paths` 中登记 `id`、`path` 和 `entrypoint`，并由 `scripts/check-project.mjs` 校验。放在 `local/projects/<project-id>/design/<design-name>/` 的框架目录原型不写入该字段，直接由任务的 `prototype_reference` 引用。

项目级路线图是可选的常驻产物，但**存放在原项目仓库内**：登记在项目上下文的可选字段 `product.roadmap_path`，由 `framework:product-management` 维护，内容由 `scripts/check-product.mjs` 校验，路径存在性由 `scripts/check-project.mjs` 校验。它与框架本地大任务的主任务（`role: parent`，单个大需求的拆分与覆盖记录）是两种产物，不要混用。

单仓项目继续以 `project.root_path` 作为主仓库。存在前后端或多个独立仓库时，可在可选的 `repositories` 中登记每个仓库的稳定 `id`、`role` 和绝对 `root_path`；`project.root_path` 不因此失效。执行验证前，先读取可选的 `verification.profiles`：每项声明 `stage`、`command`、`outcome` 及可选 `limitation`。`required` 表示该阶段应执行，`environment_limited` 表示必须保留未完成原因而不能写为通过，`not_applicable` 表示该任务不适用。profile 是项目验证入口的唯一记录处，不替代任务内的新鲜验证证据。`verification.profiles` 缺失或为空而任务需要执行验证时，先按 [验证入口探测线索](#验证入口探测线索) 探测并补登记；仍无法确认时记录为环境限制并请求补充上下文，不得凭经验编造验证命令。

启动、停止或重启项目时，必须先读取项目上下文的 `runtime.entrypoints` 和相关 `runtime.health_checks`。`runtime.entrypoints` 每项可以是可执行命令（例如 `npm run dev`、`mvn spring-boot:run`），也可以是已存在的启动脚本路径；优先执行上下文登记的入口，不得凭经验另造启动命令。框架工具可以将入口指向 `tools/` 下的共享脚本。若入口为空、路径失效或命令需要未登记的参数，先记录环境限制并请求补充上下文，不得静默绕过上下文启动。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。同名前缀按字段区分：`task.yaml` 的 `workflow` 字段指向 `workflows/<name>.md`，技能字段与正文指向 `skills/<name>/`。项目技能只补充当前项目规则，不能静默覆盖框架规则；路径不存在或技能不可读时记录 `unavailable`。

项目上下文缺失、路径无效或文档无法读取时，只能调查和澄清，不能直接修改项目代码。涉及术语时遵循项目词汇表。不得把密钥、令牌、密码或生产数据写入上下文。
