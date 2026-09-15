---
name: project-initialization
description: 首次接入项目、项目上下文缺失或上下文失效时使用；探测项目事实并生成可复用的项目上下文。
disable-model-invocation: true
---

# 项目初始化

## 执行步骤

1. 读取用户提供的项目根路径；没有明确路径时，使用当前工作区并记录这个判断。
2. 检查项目根路径是否存在、是否为目录，以及是否能识别为项目仓库。
3. 根据项目根目录名生成小写 `kebab-case` 的 `project-id`；重名时追加稳定的仓库或组织标识，并记录判断依据。
4. 探测项目自身的 `AGENTS.md`、`CLAUDE.md`、`CODING_STANDARDS.md`、`CONTRIBUTING.md`、`README.md`、包管理文件、格式化/Lint 配置、测试配置、构建配置和文档目录。
5. 识别技术栈、包管理器、测试命令和构建命令；无法确认的字段保持为空并记录缺口，不猜测。
6. 识别启动入口、健康检查、业务文档、架构文档、接口文档、词汇表和项目技能路径。
7. 创建 `local/projects/<project-id>/requirements-inbox/`，写入固定 `README.md` 和 `.gitkeep`；只在此目录保存原始需求包与附件，不写入任务过程产物。
8. 使用 `core/project-context.template.yaml` 生成 `local/projects/<project-id>/project-context.yaml`，将需求箱绝对路径登记到 `requirements.inbox_path`，并将已发现的项目代码规范文件以绝对路径登记到可选字段 `coding_standards.files`。未发现专门规范时保留空列表并在初始化报告中说明。
9. 生成 `local/projects/<project-id>/initialization-report.md`，记录探测范围、事实来源、未确认项、未读取文件、ID 判断和后续建议。
10. 检查所有登记路径是否存在，项目根路径、项目文档路径和需求箱路径使用绝对路径。

执行时遵循 [项目接入规则](../../core/project-onboarding.md)；该规则定义确认门禁、数据边界和完成不变量。无法确认的技术或业务信息保持为空，并在初始化报告中记录缺口。
