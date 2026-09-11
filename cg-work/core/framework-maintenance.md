# 框架维护

新增或修改规则和工作流时，只修改其唯一来源，并同步更新版本、README 和相关引用。新增镜像技能必须完整复制上游目录，不能修改、翻译或补充其中的文件；同时在 `scripts/check-skills.mjs` 添加来源与目标映射。

每次变更必须运行 `node scripts/check-all.mjs`。项目上下文变更后运行 `node scripts/check-project.mjs`，任务状态变更后运行 `node scripts/check-task.mjs`。废弃内容保留替代说明，不删除仍被历史任务引用的文件。框架自身不保存项目业务资料。

项目任务记录的唯一位置是 `local/projects/<project-id>/tasks/<task-id>/`。原始技能提出的其他计划或报告路径属于上游默认建议；在本框架中统一以任务记录为准，避免出现两份计划或验证报告。

`VERSION` 使用语义化版本：破坏现有流程、模板或技能调用约定时升级主版本；新增兼容能力时升级次版本；仅修正文档或校验时升级修订版本。
