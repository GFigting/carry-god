# 校验脚本

默认校验只检查框架结构、工作流引用、链接与锚点、框架受管项目记录、所有项目活跃任务的时间字段和本地工作区边界，不扫描技能正文或镜像内容。

统一入口：`npm run check`（等价于 `node scripts/check-all.mjs`）。

等待验收时运行 `npm run queue`，列出所有处于 `review` 或要求用户操作的任务及其 `next_action`。一次验收多条使用 `node scripts/acceptance-queue.mjs --accept <task-id>[,<task-id>...] --note "<验收说明>"`。该命令不替代用户判断，只记录用户已给出的验收结论。

历史任务归档使用 `node scripts/archive-tasks.mjs --before YYYY-MM-DD` 预览，追加 `--apply` 才写入 `archived: true`、`archived_at` 和 `archive_reason` 并将任务移动到 `tasks/archive/<task-id>/`；追加 `--include-requirements` 会把仅被归档任务引用的需求包移动到 `requirements-inbox/archive/`，共享需求包保留原位。需要把历史已归档任务补移入目录时加 `--relocate-archived`；需要精确补归档时可用 `--ids id1,id2`。归档不改变任务 `status`，不删除证据；已归档任务不进入验收队列，常规任务校验只要求其 YAML 可解析。

任务元数据迁移使用 `node scripts/migrate-task-metadata.mjs --documentation --project cg-work` 或 `--status-history` 预览，追加 `--apply` 才写入；已归档任务自动跳过。新 documentation 使用 `files`、`reason`；历史 `targets`、`not_needed_reason` 已废弃，需先迁移。新状态历史使用带 `status`、`at`、`reason` 的结构化项；历史字符串数组同样已废弃，迁移时未知时间写为 `null`，未知原因显式标记，不猜测文件时间。`--timezones` 与 `--deprecate-fields` 是纯文本转换，即使任务 YAML 因历史残留行无法解析也会执行（归档判定退化为 `tasks/archive/` 路径判断）；其余转换需要有效 YAML，解析失败的文件报错跳过。`--all-projects` 动态扫描 `local/projects/` 下所有含 `tasks` 的项目，不再依赖硬编码清单。

任务时间字段（`created_at`、`status_history[].at`）必须由脚本写入，禁止手工填占位时间（如 `T00:00:00`）：`node scripts/task-stamp.mjs create --project <id> --task-id <task-id> --goal "<目标>" --workflow <workflow>` 创建任务并盖当前墙钟；`node scripts/task-stamp.mjs transition --project <id> --task-id <task-id> --status <status> --reason "<原因>" [--next-action <required> <action> <message>]` 流转状态并追加盖章条目；两者的时间格式均为 `YYYY-MM-DDTHH:mm:ss`（无时区后缀，见 `local-time.mjs`）。存量占位时间用 `node scripts/task-stamp.mjs fix-placeholders [--project <id>]` 预览，追加 `--apply` 后将严格 `T00:00:00` 的 `status_history.at` 置为 `null`（无法还原的时间按规则写 `null`，不编造当前时间覆盖历史），并将 `created_at` 的 `T00:00:00` 退化为纯日期（创建日可确认）；已归档任务不处理。

项目路线图存放在原项目仓库内并在项目上下文以 `product.roadmap_path` 登记；创建或更新后运行 `node scripts/check-product.mjs <path>`，检查六个必需章节、切片表头与状态取值、版本/主题登记、需求来源与任务引用路径，以及未决决策是否写明需要的用户动作。路径存在性由 `check-project.mjs` 一并校验；框架本地不保存项目路线图，因此 `check-all.mjs` 不巡检它。

项目接入或上下文更新后运行 `node scripts/check-project.mjs <path-to-project-context.yaml>`，检查上下文字段、项目根路径和已登记路径。项目校验不属于日常框架校验。

任务记录不再由脚本做字段校验：任务字段规则（`delivery_path`、`next_action`、`lightweight_evidence`、`artifacts`、`documentation`、各类引用字段等）与证据段落规则（标准编码前置检查段落）以 [工作模型](../core/operating-model.md) 和 [项目上下文](../core/project-context.md) 为唯一来源，写入或更新 `task.yaml` 后运行 `npm run check` 确认其 YAML 可解析。`framework:bugfix` 与 `framework:feature-development` 均可声明 `delivery_path: lightweight`，进入 `review` 或 `done` 时必须在 `lightweight_evidence` 中填写范围、针对性验证、自审和集成结论，缺陷类还需根因（功能类免填），以替代独立审查、验证和交接文件（见 [工作模型的最小充分流程](../core/operating-model.md#最小充分流程)）。`check-all.mjs` 只额外巡检随框架提交的框架受管项目 `local/projects/cg-work/` 的上下文和任务 YAML 可解析性，业务项目的本地记录不做字段校验；但时间字段校验（`scripts/task-time-fields.mjs`）覆盖**所有项目**的活跃任务：`created_at` 与 `status_history[].at` 出现 `T00:00:00` 占位、时区后缀，或 `at` 使用纯日期时直接报错，用于兜住绕过 `task-stamp` 直接手写 `task.yaml` 的情况；归档任务（`tasks/archive/`）与 YAML 解析失败的任务不在该检查范围（业务记录的历史损坏问题另行处理）。

标准任务的常量化前置检查记录在计划/验证文档的「标准编码前置检查」段落；该段落应区分项目自动检查、当前差异人工检查和不适用项，不能把人工检查写成自动化通过。它**不是 `task.yaml` 字段**；显式声明 `delivery_path: standard` 的任务进入 `review`/`done` 前，计划与验证记录都必须包含该段落，compact 任务将该段落写入主产物。

仓库 CI 会在 `cg-work/` 发生变化时自动运行框架结构校验。CI 不读取 `local/projects/` 下的本地项目数据。

任务还可以声明 `acceptance_summary`：非空验收摘要数组，可选，历史任务无需迁移。已删除字段（`open_decisions`、`parent_task_reference`、`requirements_coverage`、`learning_protocol`、`scope_decision.prior_task_reference`）出现即报"未知字段"。
