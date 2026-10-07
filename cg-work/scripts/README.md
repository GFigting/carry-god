# 校验脚本

默认校验只检查框架结构、工作流引用、链接与锚点、框架受管项目记录和本地工作区边界，不扫描技能正文或镜像内容。

统一入口：`npm run check`（等价于 `node scripts/check-all.mjs`）。

等待验收时运行 `npm run queue`，列出所有处于 `review` 或要求用户操作的任务及其 `next_user_action`。一次验收多条使用 `node scripts/acceptance-queue.mjs --accept <task-id>[,<task-id>...] --note "<验收说明>"`：命令在写入前先用任务校验预演"置为 `done`"的结果，证据不全的记录会被拒绝并保持 `review`。该命令不替代用户判断，只记录用户已给出的验收结论。

历史任务归档使用 `node scripts/archive-tasks.mjs --before YYYY-MM-DD` 预览，追加 `--apply` 才写入 `archived: true`、`archived_at` 和 `archive_reason` 并将任务移动到 `tasks/archive/<task-id>/`；追加 `--include-requirements` 会把仅被归档任务引用的需求包移动到 `requirements-inbox/archive/`，共享需求包保留原位。需要把历史已归档任务补移入目录时加 `--relocate-archived`；需要精确补归档时可用 `--ids id1,id2`。归档不改变任务 `status`，不删除证据；已归档任务不进入验收队列，常规任务校验只要求其 YAML 可解析。

任务元数据迁移使用 `node scripts/migrate-task-metadata.mjs --documentation --project cg-work` 或 `--status-history` 预览，追加 `--apply` 才写入；已归档任务自动跳过。新 documentation 使用 `files`、`reason`；历史 `targets`、`not_needed_reason` 继续兼容。新状态历史使用带 `status`、`at`、`reason` 的结构化项；历史字符串数组迁移时未知时间写为 `null`，未知原因显式标记，不猜测文件时间。

技能镜像维护时单独运行 `node scripts/check-skills.mjs`，检查上游与镜像的文件清单和内容哈希。内容哈希按 LF 归一化后比较，避免 Windows 检出（`core.autocrlf`）把换行符差异误报成内容漂移；含 NUL 字节的二进制文件按原字节比较。该检查不属于日常默认校验。

项目路线图存放在原项目仓库内并在项目上下文以 `product.roadmap_path` 登记；创建或更新后运行 `node scripts/check-product.mjs <path>`，检查六个必需章节、切片表头与状态取值、版本/主题登记、需求来源与任务引用路径，以及未决决策是否写明需要的用户动作。路径存在性由 `check-project.mjs` 一并校验；框架本地不保存项目路线图，因此 `check-all.mjs` 不巡检它。

项目接入或上下文更新后运行 `node scripts/check-project.mjs <path-to-project-context.yaml>`，检查上下文字段、项目根路径和已登记路径。项目校验不属于日常框架校验。

任务创建或状态更新后运行 `node scripts/check-task.mjs <path-to-task.yaml>`，检查任务字段、日期格式、工作流引用、文档影响、`review`/`done` 状态门禁，以及 `learning_protocol: v1` 的学习记录引用。`execution_profile` 可显式填写 `standard` 或 `lightweight`；省略时按标准任务兼容处理。`framework:bugfix` 与 `framework:feature-development` 均可声明 `execution_profile: lightweight`，进入 `review` 或 `done` 时必须在 `lightweight_evidence` 中填写范围、针对性验证、自审和集成结论，缺陷类还需根因（功能类免填），以替代独立审查、验证和交接文件。`lightweight` 与 `artifact_profile: compact` 不能同时声明（组合规则见 [工作模型的最小充分流程](../core/operating-model.md#最小充分流程)）。任务声明 `interaction_protocol: v1` 时，进入 `review`、`blocked` 或 `done` 必须有结构正确的 `next_user_action`。任务声明 `prototype_reference` 时，校验器会检查原型文件存在，并要求进入 `in_progress` 后计划记录含 `## 原型实现契约`、进入 `review`/`done` 时评审记录含 `## 原型采纳`（compact 任务查其主产物）；已废弃的 `prototype_contract_reference` 与 `prototype_disposition_reference` 会被明确拒绝。任务可选的路线图、父任务、需求来源、依赖、覆盖和后续任务引用也会校验路径存在性与禁止自引用；`requirements_reference` 可让多个 task 复用同一需求箱原始需求包；带 `roadmap_reference` 的 `done` 任务必须提供 `closure_reference`。任务校验不扫描整个 `local/projects/`，避免把本地项目数据纳入框架结构检查；`check-all.mjs` 只额外巡检随框架提交的框架受管项目 `local/projects/cg-work/` 的上下文和全部任务记录，业务项目的本地记录仍不纳入。`requirements_reference_note` 用于记录确实不可恢复的需求包缺失原因，仅在引用目标缺失时允许填写。

标准任务的常量化前置检查记录在计划/验证文档的 `standards_preflight` 段落；该段落应区分项目自动检查、当前差异人工检查和不适用项，不能把人工检查写成自动化通过。它**不是 `task.yaml` 字段**，写成任务字段会被校验器拒绝。显式声明 `execution_profile: standard` 且未声明 `artifact_profile: compact` 的任务进入 `review`/`done` 前，`check-task.mjs` 会校验这两个记录都包含该段落；compact 任务将该段落写入主产物，校验器不强制；历史上未声明执行模式的任务保持兼容。

仓库 CI 会在 `cg-work/` 发生变化时自动运行回归测试、框架结构校验和技能镜像校验。CI 不读取 `local/projects/` 下的本地项目数据。

任务还可以声明 `acceptance_summary` 和 `open_decisions`：前者是非空验收摘要数组，后者的每项包含唯一 kebab-case `id`、问题和布尔 `blocking`。这两个字段均为可选，历史任务无需迁移。
