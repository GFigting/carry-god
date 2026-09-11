# 校验脚本

默认校验只检查框架结构、工作流引用、链接和本地工作区边界，不扫描技能正文或镜像内容。

统一入口：`node scripts/check-all.mjs`。

技能镜像维护时单独运行 `node scripts/check-skills.mjs`，检查上游与镜像的文件清单和内容哈希。该检查不属于日常默认校验。

项目接入或上下文更新后运行 `node scripts/check-project.mjs <path-to-project-context.yaml>`，检查上下文字段、项目根路径和已登记路径。项目校验不属于日常框架校验。

任务创建或状态更新后运行 `node scripts/check-task.mjs <path-to-task.yaml>`，检查任务字段、日期格式、工作流引用、文档影响和 `review`/`done` 状态门禁。任务校验不扫描整个 `local/projects/`，避免把本地项目数据纳入框架结构检查。

仓库 CI 会在 `cg-work/` 发生变化时自动运行回归测试、框架结构校验和技能镜像校验。CI 不读取 `local/projects/` 下的本地项目数据。
