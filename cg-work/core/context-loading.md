# 上下文加载

先检查 `local/projects/<project-id>/project-context.yaml` 是否存在且有效。

- 存在且有效：读取上下文，再按任务阶段加载项目规则、业务文档、架构文档、接口文档和项目技能路径。
- 不存在或失效：先执行 `framework:project-initialization`；初始化完成并经用户确认前，不得修改项目代码。

项目上下文创建时使用 `core/project-context.template.yaml`。

项目技能路径使用 `skills.paths` 声明，路径相对于 `project.root_path` 解析。例如 `.cg-work/skills` 对应项目根目录下的 `.cg-work/skills/`。先加载 `cg-work/skills/` 中的框架技能，再加载这些路径中的项目技能。

工作流使用 `framework:<skill-name>` 引用框架技能，使用 `project:<skill-name>` 引用项目技能。项目技能只补充当前项目规则，不能静默覆盖框架规则；路径不存在或技能不可读时记录 `unavailable`。

项目上下文缺失、路径无效或文档无法读取时，只能调查和澄清，不能直接修改项目代码。涉及术语时遵循项目词汇表。不得把密钥、令牌、密码或生产数据写入上下文。
