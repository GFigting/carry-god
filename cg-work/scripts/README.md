# 校验脚本

默认校验只检查框架结构、工作流引用、链接和本地工作区边界，不扫描技能正文或镜像内容。

统一入口：`node scripts/check-all.mjs`。

技能镜像维护时单独运行 `node scripts/check-skills.mjs`，检查上游与镜像的文件清单和内容哈希。该检查不属于日常默认校验。

项目接入或上下文更新后运行 `node scripts/check-project.mjs <path-to-project-context.yaml>`，检查上下文字段、项目根路径和已登记路径。项目校验不属于日常框架校验。

任务创建或状态更新后运行 `node scripts/check-task.mjs <path-to-task.yaml>`，检查任务字段、日期格式、工作流引用、文档影响、`review`/`done` 状态门禁，以及 `learning_protocol: v1` 的学习记录引用。`execution_profile` 可显式填写 `standard` 或 `lightweight`；省略时按标准任务兼容处理。轻量缺陷可声明 `execution_profile: lightweight`，仅限 `framework:bugfix`，进入 `review` 或 `done` 时必须在 `lightweight_evidence` 中填写根因、范围、针对性验证、自审和集成结论，以替代独立审查、验证和交接文件。任务声明 `interaction_protocol: v1` 时，进入 `review`、`blocked` 或 `done` 必须有结构正确的 `next_user_action`。任务声明 `prototype_reference` 时，校验器还会检查原型文件存在，并在 `review`/`done` 阶段要求符合模板的 `prototype_disposition_reference`。任务可选的路线图、父任务、依赖、覆盖和后续任务引用也会校验路径存在性与禁止自引用；带 `roadmap_reference` 的 `done` 任务必须提供 `closure_reference`。任务校验不扫描整个 `local/projects/`，避免把本地项目数据纳入框架结构检查。
标准任务的常量化前置检查记录在计划/验证文档的 `standards_preflight` 段落；该段落应区分项目自动检查、当前差异人工检查和不适用项，不能把人工检查写成自动化通过。显式声明 `execution_profile: standard` 的任务进入 `review`/`done` 前，`check-task.mjs` 会校验这两个记录都包含该段落；历史上未声明执行模式的任务保持兼容。

仓库 CI 会在 `cg-work/` 发生变化时自动运行回归测试、框架结构校验和技能镜像校验。CI 不读取 `local/projects/` 下的本地项目数据。
