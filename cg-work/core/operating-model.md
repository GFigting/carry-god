# 工作模型

核心对象为 Goal、Task、Context、Plan、Evidence、Artifact、Decision、Learning、Roadmap 和 NextAction。

## 原型与任务记录

原型是 Artifact 的一种，任务的唯一原型字段是 `prototype_reference`。原型不单独建档，写入任务已有的两份记录：

- **计划记录**（`plan.md`；compact 任务为其主产物）在进入 `in_progress` 前必须包含 `## 原型实现契约` 章节，说明问题与目标、状态与场景、视觉与响应式约束、资源与依赖、交互与业务规则、验收映射，并保持到任务关闭。
- **评审记录**（`review.md`；compact 任务为其主产物）在进入 `review` 或 `done` 前必须包含 `## 原型采纳` 章节，说明采纳结论、原型到实现的映射、原型到验证证据的映射，以及未采纳项及原因。

章节骨架：

```markdown
## 原型实现契约

### 问题与目标
### 状态与场景
### 视觉与响应式约束
### 资源与依赖
### 交互与业务规则
### 验收映射

## 原型采纳

### 采纳结论
### 实现映射
### 验证映射
### 未采纳项
```

`prototype_contract_reference` 与 `prototype_disposition_reference` 字段不再使用，不应写入。原型实现契约与采纳结论的唯一格式见本节任务章节。

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
- `done`：验证通过、审查结论已处理，并已确定保留、合并、推送或暂缓集成方式。标准任务还必须有用户接受结果；满足“轻量自动完成”条件的任务可由 Agent 完成该状态转换。
- `blocked`：缺少信息、权限、环境或外部依赖；记录阻塞原因和解除条件。
- `cancelled`：用户明确取消；记录取消原因和已有产物位置。

### 需求范围变化与任务拆分

同一原始需求包可以被多个任务复用，但任务不是可无限追加范围的工作日志。出现新的业务规则、接口/数据结构变化、独立验收标准或明显不同的交付物时，必须创建新任务，并在存在来源需求包时通过 `requirements_reference` 复用原始需求来源；不得只修改旧任务的 `next_action` 或继续堆叠旧的 `plan.md`。

任务需要延续既有范围时，可在 `task.yaml` 声明 `scope_decision.mode: continuation`，同时填写 `rationale`（如需指向前序任务，用 `depends_on` 记录路径），并为当前任务维护独立的计划和验证证据。新范围任务可声明 `scope_decision.mode: independent`，说明拆分理由。

### 新模块与历史兼容决策

判断需求时，必须分别记录“模块生命周期”和“本次变更性质”：模块尚未上线验收时可标记为新模块开发阶段，但其中新增业务规则、接口或数据结构仍属于需求变更；已确认规则未实现属于原需求实现，实现结果偏离规则才属于缺陷修复。

新模块开发阶段默认以当前确认的新模型为唯一业务模型，不因旧代码、旧测试数据或未发布的旧接口自动引入兼容分支。只有正式业务数据、已对外发布的接口契约或审计记录，才构成必须评估的兼容对象。

涉及字段删除、历史数据迁移、历史语义转换、旧接口兼容或测试数据清理时，必须先向用户提供可选方案并记录决策。未经用户确认，不得删除、迁移或重新解释历史数据。用户选择应写入任务的 `decisions` 或等价决策记录，并成为计划、实现和验收的依据。

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

### 任务归档

历史任务可以使用独立的归档标记退出日常验收与生命周期校验，但归档不等同于用户验收完成：

```yaml
archived: true
archived_at: 2026-10-07T16:00:00
archive_reason: 用户授权归档历史任务
```

归档任务移动到项目 `tasks/archive/<task-id>/`，保留原状态和全部证据，不得改写为 `done`，也不得删除任务文件。仅被归档任务引用的需求包同步移动到 `requirements-inbox/archive/`，共享需求包留在原位置；任务内的相对引用随目录深度同步改写。`npm run queue` 不列出已归档任务；`npm run check` 和单任务校验对归档记录只要求 YAML 可解析。使用 `node scripts/archive-tasks.mjs --before YYYY-MM-DD` 预览归档范围，追加 `--include-requirements` 纳入需求包，只有显式追加 `--apply` 才执行移动和写入归档字段；已有归档任务可用 `--relocate-archived` 补做目录迁移。

归档可以覆盖 `review` 状态的验收积压（脚本默认 `--status review`），但归档不等于验收：被归档任务如仍需用户验收，必须先恢复归档（移回 `tasks/<task-id>/` 并移除归档元数据）再进入验收队列；不恢复时视为暂缓验收，其 `next_action` 中的用户提示保持原意，不得由 Agent 代验收。

### 状态历史格式

状态历史只使用结构化项，`at` 使用本地时间（`YYYY-MM-DDTHH:mm:ss`，不带时区后缀）；历史迁移无法恢复的时间使用 `null`，不得用文件修改时间猜测。旧的字符串数组简写不再接受：

```yaml
status_history:
  - status: pending
    at: 2026-10-07T09:00:00
    reason: 任务创建
  - status: in_progress
    at: 2026-10-07T09:30:00
    reason: 开始实施
```

结构化项必须包含非空 `status`、`reason`，`at` 可以是不带时区的本地时间字符串或 `null`；不再接受旧的字符串数组简写。

`created_at` 和 `status_history[].at` 必须由 `scripts/task-stamp.mjs` 写入真实本地墙钟时间（`create` 与 `transition` 子命令自动盖章），禁止手工填写或占位（如 `T00:00:00`、缺秒的纯日期仅允许用于历史 `created_at` 的创建日语义）。无法还原的历史占位时间使用 `null`，用 `scripts/task-stamp.mjs fix-placeholders` 识别，追加 `--apply` 写入；已归档任务不处理。该规则由 `npm run check` 对所有项目的活跃任务强制校验（YAML 可解析为前提）：`T00:00:00` 占位、时区后缀、`at` 使用纯日期或 `created_at` 缺失语义的空值都会直接报错，占位存量同样用 `fix-placeholders --apply` 修复。

### review 阶段统一收尾

`review` 不只是代码意见检查，也是进入 `done` 前的统一收尾阶段。适用的标准顺序为：

1. 完成新鲜验证并记录事实结果；
2. 按仓库类型处理测试文件：原项目按提交规范清理全部测试，框架自身只清理确认无效、临时或重复的测试；
3. 清理本次变更直接相关的冗余代码、字段、注释、配置和脚本，并整合已确认属于本次变更的 SQL；
4. 同步受影响的业务、架构、接口或维护文档，或记录无需更新的理由；
5. 记录删除清单、审查结论、遗留项和保留、合并、推送或暂缓集成的决定；
6. 仅声明 `delivery_path: lightweight` 且满足以下全部条件的轻量任务，可以在完成上述收尾并验证通过后由 Agent 更新为 `done`：单模块；不改变业务规则、接口、数据、权限或外部副作用；没有迁移、删除或未决决策；定向验证已通过。其他任务必须完成用户验收后才能更新为 `done`。

这些步骤不是状态切换后的自动动作；缺少相应证据时任务必须保持 `review`，需要外部授权或环境条件时可转为 `blocked`。

### 任务元数据摘要

任务可选使用以下字段补充机器可校验的摘要信息；未声明时不校验这些字段：

- `acceptance_summary`：非空字符串数组，记录任务级可观察验收条件的短摘要。详细验收仍保存在 `plan.md` 或需求包（如有），该字段不替代它们。
- `documentation`：`impact` 取 `add`、`update` 或 `none`；`files` 表示受影响路径数组，`impact: none` 使用 `reason` 说明无需文档更新。
- `decisions`：已确认决策数组，用于记录历史数据删除、迁移、语义转换、旧接口兼容等需要用户拍板的决策。每项必须包含非空 `name` 和 `detail`，可选 `confirmed_by` 与 `confirmed_at`（`YYYY-MM-DD`）。
- `role`：仅取 `parent`，声明本任务是大任务的主任务（见 [大任务主从拆分](#大任务主从拆分)）；普通任务省略。
- `parent_reference`：指向主任务 `task.yaml` 的相对路径，声明本任务是某主任务的子任务；与 `role: parent` 互斥（主任务自身不写）。已废弃字段 `roadmap_reference` 不再使用，历史存量迁移为本字段。
- 标准编码前置检查不是任务字段：它是 `plan.md` 与 `verification.md` 中「标准编码前置检查」的证据段落，不应写入 `task.yaml`。

`task.yaml` 使用封闭 schema：顶层及 `artifacts.*`、`documentation.*`、`lightweight_evidence.*` 嵌套键均限定为本文件与 [项目上下文](project-context.md) 登记的字段，schema 外的任何字段（包括历史遗留字段名）都不应写入。

`next_action` 同时承载 Agent 的下一步与用户侧提示，是一个映射对象：`required`（布尔，是否需要用户操作）、`action`（动作标识）和 `message`（说明文字，可为空）。任务进入 `review`、`blocked`、`done` 时 `required` 与 `action` 必填，`done`/`cancelled` 终态可省略整个字段。

## 计划、审查与验证的边界

- `plan.md`：说明实施方案；复杂或用户要求审查时，在同一文件增加“计划审核”章节，记录需求覆盖、范围、依赖、步骤、验收标准和风险检查结论。
- `review.md`：实施完成后的结果审查，判断实现是否符合需求、计划和项目规范。
- `verification.md`：记录测试、静态检查、构建和页面或接口验收等事实证据。

计划审核不是新的任务状态，也不要求新增独立文件；子智能体的意见由主 Agent 汇总后写回 `plan.md`。

## 任务证据生命周期

新任务通过 `delivery_path` 字段三选一声明交付路径，省略时默认为 `standard`。三种取值决定证据门禁的强度和组织方式：

- `delivery_path: lightweight`（轻量执行）：证据合并进 `task.yaml` 的 `lightweight_evidence`，不创建独立产物文件。只允许 `framework:bugfix` 和 `framework:feature-development` 声明。
- `delivery_path: standard`（标准执行，默认）：按阶段生成 `plan.md`、`review.md`、`verification.md`、`learning.md`、`handoff.md`、`closure.md` 等独立产物，路径统一在 `task.yaml` 的 `artifacts` 分组下引用。
- `delivery_path: compact`（紧凑执行）："任务索引 + 一个主产物"的轻量证据模型。`task.yaml` 保存机器可读状态和 `artifacts.primary` 路径指向主产物（`product.md`、`plan.md`、`research.md` 等），验证、学习和交接结论默认回写主产物或 `task.yaml`，不强制生成独立文件。

标准执行的产物引用分组进 `task.yaml` 的 `artifacts` 对象：

```yaml
artifacts:
  primary: plan.md          # compact 任务主产物（仅此一个键）
  plan: plan.md             # standard 任务
  review: review.md
  verification: verification.md
  handoff: handoff.md
  learning: learning.md
  closure: closure.md
```

外部关联引用（`prototype_reference`、`requirements_reference`、`parent_reference`、`depends_on` 等）保持顶层不动，不属于产物文件路径。

三种交付路径天然互斥，不存在组合规则；`delivery_path` 是单一枚举值。

标准任务的证据按阶段逐步生成，不要求创建任务时一次性生成全部文件：

| 阶段 | 必要产物 | 主要内容 |
|---|---|---|
| 接收需求 | `task.yaml` | 目标、范围、状态 `pending`；需求原文写入任务记录，或在用户已手动添加需求包时以引用指向 |
| 开始实施 | `plan.md`（含测试用例章节） | 方案、步骤、验收、依赖、风险和计划审核结论（如适用）；测试用例在任务进入验证阶段前写在同一文件 |
| 完成实现 | `review.md`、`verification.md` | 实现结果审查和新鲜验证事实 |
| 需要持续学习 | `learning.md` | 观察、结论、去向和可复用经验 |
| 完成交接 | `handoff.md` | 集成方式、遗留项、用户下一步和关闭索引 |

低风险变更不进入该生命周期；轻量执行的任务可将根因（缺陷类）、范围、验证、自审和集成结论合并在 `task.yaml` 的 `lightweight_evidence` 中。

小任务使用最小充分流程；跨模块、不确定或高风险任务增加计划、审查或专门技能，但不改变状态机。用户确认和项目规则优先，技能不能自行改变状态。

## 低风险变更

低风险变更不属于开发任务状态机，不创建需求箱、`task.yaml`、计划、审查、学习或交接记录，也不强制新增自动化测试。仅当修改同时满足以下条件时适用：

- 仅调整已存在页面或文档的文案、样式、静态布局，或不改变行为的可访问性标记；
- 不改变业务规则、交互行为、路由或菜单、接口、数据、权限、配置语义、依赖或外部副作用；
- 可通过受影响文件的静态检查、页面视觉验收或文档链接检查直接验证。

低风险变更必须使用 `framework:low-risk-change`，并完成与改动匹配的最小验证：前端页面至少执行受影响文件的 lint 和页面验收；纯文档改动至少执行链接或格式检查。任一条件不满足、需要新增或调整逻辑，或验证暴露行为变化时，立即停止免记录路径：按「交付路径升级」新建 `pending` 任务记录并转入相应标准工作流，已完成的改动纳入该任务范围。

## 最小充分流程

任务按影响面选择**交付路径**，从轻到重：**免记录路径**（低风险变更，不进入任务状态机）→ **轻量执行**（`delivery_path: lightweight`，单条 `task.yaml` 合并证据）→ **标准执行**（`delivery_path: standard` 或省略，全套产物与技能）→ **紧凑执行**（`delivery_path: compact`，一个主产物替代全套）。交付路径按影响面与风险选择，不按任务名选择；`framework:bugfix` 与 `framework:feature-development` 都可使用轻量执行，其证据字段以各自工作流为唯一来源，升级触发器以本节的「轻量执行决策清单」为唯一来源。

### 交付路径声明

交付路径通过单一字段 `delivery_path` 取值决定（`lightweight` / `standard` / `compact`），三者天然互斥。不再使用 `execution_profile` 和 `artifact_profile` 两个独立字段。

### 轻量执行决策清单

“小任务”“可逆的小功能”“高风险”等主观判断按下面五项升级触发器判定，任一项为“是”即不得使用（或必须退出）轻量执行，自动进入标准执行：

1. 是否跨模块（改动或验证超出单一模块/业务边界）？
2. 是否改变业务规则、接口、数据或权限？
3. 是否存在迁移、删除或其他不可逆写入？
4. 是否有未决业务决策？
5. 是否产生外部副作用？

五项全部为“否”才允许轻量执行。`framework:bugfix` 仍须根因已确认且仅恢复既有行为；`framework:feature-development` 仍须是单模块小功能。

### 需求箱与需求引用

需求箱（`requirements-inbox/`）在初始化时创建目录，但**内容只允许用户手动添加**：Agent 不生成、不写入需求包，只读取用户已放入的原始需求作为上下文。

- 任务**不需要关联需求**：需求原文、范围和取舍直接写入任务 `plan.md`（compact 任务写入其主产物）或 `decisions` 决策记录，不创建 `requirements_reference`。
- 用户已手动放入需求箱的原始需求可被复用：任务用 `requirements_reference` 指向对应需求包，同一需求包可以支撑多个 task；引用前应先查找已有需求包，不重复复制需求。
- 归档：`scripts/archive-tasks.mjs` 可把仅被归档任务引用的需求包一并移入 `requirements-inbox/archive/`。

本清单与「轻量执行决策清单」正交：本节管**需求来源口径**（需求从哪来、要不要引用），决策清单管**执行风险**（走轻量还是标准），两者结论可以互不影响。

### 交付路径升级

路径只向重的方向升级，不降级；升级保留原记录与历史，不重开任务：

- **免记录路径 → 标准执行**：低风险变更实施或验证中发现行为变化、或任一低风险条件不再满足时，立即停止免记录路径，新建 `pending` 任务记录，把已完成改动纳入该任务范围后按对应标准工作流继续。
- **轻量执行 → 标准执行**：决策清单任一项转为"是"、无法取得针对性验证，或改动扩展到多个业务边界时，在原 `task.yaml` 内升级：保留原 `task.yaml`、`status_history` 和已写的 `lightweight_evidence`，把 `delivery_path` 改为 `standard`，在 `status_history` 追加带原因的升级记录，并补建 `plan.md`、`review.md`、`verification.md`（按需 `learning.md`、`handoff.md`）。
- **产生可复用经验即升级**：轻量执行一旦产生可复用经验，必须升级为标准执行，并按 [持续学习与经验沉淀](continuous-learning.md) 记录去向。

各路径通用的比例原则：

- **测试按价值分层**：只为三类行为配自动化测试——数据不可逆（快照/落库被改写）、红线（内部字段外泄、客观态被写、凭据或权限外泄等）、真会悄悄坏的核心逻辑；界面、交互、文案改动以人工验收为准，不强制自动化测试。
- **现状证据保鲜**：计划、路线图与文档中的"当前/已实现/未实现/仍有限制"断言必须标注核对日期与核对方式；定范围前用一手核查（如 `git log -S`、grep 能力标记）确认，发现证据过期时显式记录修正，不沿用旧断言。
- **验证绑定交付点**：全量验证在交付与提交节点执行；过程汇报引用最近一次同代码状态的验证证据并注明时点，不以重复全量验证为代价。

## 大任务主从拆分

当需求跨模块、跨会话或不能作为一个独立任务验收，且包含 2 个以上可独立验收的切片时，创建**主任务**承载拆分，而非建立独立索引目录。生命周期是：`决策（必要时 wayfinder）→ 主任务记录覆盖 → 可验收子任务 → 集成核对 → 主任务关闭`。

主任务是普通任务目录中的 `role: parent` 任务：决策写入其 `task.yaml` 的 `decisions`，需求覆盖、排除范围、依赖与遗留写入其 `plan.md`（格式见 [主任务计划模板](templates/parent-plan.template.md)）。子任务通过 `parent_reference` 挂靠，集合以该反向关系为准，不维护第二份清单；子任务仍保持各自的状态机和证据目录。主任务 `next_action` 必须与前沿子任务联动：存在等待验收、停滞或需要决策的子任务时必须 `required: true`。全部子任务终态并完成集成核对后主任务进入 `review`，遗留与后续写入其审查记录；关闭主任务不删除、不移动子任务证据。框架存量路线图（`roadmaps/<roadmap-id>/` 三件套）双轨保留可继续使用，但不再新建，迁移按项目另立任务进行。

## 用户下一步提醒

任务以 `next_action` 向用户表达当前是否需要其操作。该对象含有 `required`（布尔值）、`action`（动作标识）和 `message`（面向用户的提示，可为空字符串）。任务进入 `review`、`blocked` 或 `done` 时必须提供 `required` 与 `action`：审查阶段请求验收或补充决定；阻塞阶段说明解除动作；完成阶段明确无需操作或给出后续入口。没有需要用户操作时，`required: false`，可在 `message` 中说明 Agent 将继续什么或任务已关闭。

大任务的主任务同样维护 `next_action`。当没有可执行的无依赖子任务、需要范围确认或关键决策时，主任务的该字段必须转为 `required: true`，而不是静默等待。

### 待验收清单与批量验收

等待用户验收的任务不应靠翻目录发现。`npm run queue` 一次性列出所有处于 `review` 或声明了 `next_action.required: true` 的任务，并显示各自的项目、动作和说明。

用户可以用 `node scripts/acceptance-queue.mjs --accept <task-id>[,<task-id>...] --note "<验收说明>"` 一次验收多条记录。批量验收只合并交互次数，不改变 `done` 的证据要求；验收说明必须如实记录用户给出的结论，证据缺口仍由 `review` 阶段的验证记录兜底。

验收不是由 Agent 代做的判断：标准任务仍只能记录用户已经给出的接受结论；轻量自动完成任务不以用户验收作为状态门禁，但必须在 `review`/验证记录中写明自动完成依据和验证证据。涉及业务规则、接口、数据、权限、外部副作用或跨模块的任务，不得适用自动完成例外。
