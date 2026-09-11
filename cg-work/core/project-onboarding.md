# 项目接入规则

项目首次接入或上下文失效时，加载 `framework:project-initialization` 执行探测和生成。技能使用 `core/project-context.template.yaml`，将结果写入 `local/projects/<project-id>/project-context.yaml`。

`project-id` 使用项目根目录名转换得到的小写 `kebab-case` 标识；发生重名时追加稳定的仓库或组织标识。初始化报告必须记录原始项目路径、生成的 ID 和重名判断。

项目上下文是所有开发工作流的前置输入。先检查路径和文档是否存在，再根据任务阶段加载 `required_context` 和 `skills.paths`。项目技能必须由项目仓库维护，不复制到 `cg-work/skills/`。

接入完成标准是上下文可读、路径有效、规则入口明确、项目技能路径可解析且不包含敏感数据。已有上下文失效时先生成差异报告，用户确认后再更新；不直接覆盖已有上下文。
