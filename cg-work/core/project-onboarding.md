# 项目接入规则

## 识别与初始化门禁

项目开发请求先经过 `framework:project-discovery`。该阶段只确认项目归属：`existing-project`、`new-project` 或 `needs-clarification`。它与需求澄清分开，不能用“新增功能”或目录是否为空替代项目身份判断。

识别阶段必须一问一答收集缺失事实，并展示包含分类、项目名、根路径、已知目标和缺失项的摘要。用户明确确认前，状态保持等待，不创建任务或初始化产物。

项目首次接入或上下文失效时，必须使用 `framework:project-initialization`。初始化只允许探测和生成本地框架产物；在用户确认新的或更新后的上下文前，不得修改项目代码、项目规则、CI、Git 配置或依赖，也不得启动服务、执行迁移或创建凭据。

已有上下文失效时先生成差异报告，等待确认后再更新；不得直接覆盖。初始化任务保持 `pending`，后续开发工作流只能在确认后开始。

## 项目关联不变量

项目上下文是所有开发工作流的前置输入，唯一来源为 `local/projects/<project-id>/project-context.yaml`。`project-id` 使用项目根目录名转换得到的小写 `kebab-case` 标识；发生重名时追加稳定的仓库或组织标识。初始化报告必须记录原始项目路径、生成的 ID 和重名判断。

每个已初始化项目必须拥有原始需求箱，并把绝对路径登记为 `requirements.inbox_path`；任务计划、审查和验证证据仍只保存在 `tasks/<task-id>/`。项目上下文、需求箱和初始化报告不得写入密钥、令牌、密码、生产数据或完整个人信息。

项目上下文、需求箱和报告路径必须有效；项目规则入口明确；项目代码规范文件使用可选的 `coding_standards.files` 以绝对路径登记并由校验器检查存在性；项目技能路径可解析并由项目仓库维护，不复制到 `cg-work/skills/`。后续加载按 `required_context`、`coding_standards.files` 和 `skills.paths` 执行。
