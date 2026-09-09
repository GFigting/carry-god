---
type: framework
id: CGHN-000
title: CG 开发框架新版
version: 1.0.0
status: active
---

# CG 开发框架新版

面向 AI 辅助软件开发的轻量工作框架。

本框架以目标驱动、任务可追踪、角色协作和质量门禁为骨架，吸收成熟的需求澄清、架构设计、测试驱动开发、调试、代码审查、验证和知识沉淀方法。核心规则与具体宿主无关，当前提供 Codex 优先的加载入口。

## 快速开始

1. 读取 `AGENTS.md`。
2. 按 `core/loading-protocol.md` 加载当前任务需要的上下文。
3. 在 `workflow/software-delivery.md` 中定位任务阶段。
4. 从 `registry/capabilities.yaml` 选择能力，按需读取对应文件。
5. 使用 `templates/` 创建任务记录，并在结束时留下验证证据和学习记录。
6. 每次状态变化或阶段结束时，按照 `workflow/next-action.md` 记录并输出下一步行动。
7. 新项目或首次接入项目时，按 `workflow/project-initialization.md` 初始化项目级需求箱、报告根目录、原型设计根目录和文档入口。
8. 需求确认后加载 `capabilities/requirements-to-development.md`，建立 `AC-*` 到切片、代码和测试的追踪基线。
9. 修改框架规则、模板或注册表后运行 `scripts/validate-framework.ps1`，确认路径、映射和关键门禁仍一致。

## 目录

| 目录 | 作用 |
|---|---|
| `core/` | 全局行为、边界和加载协议 |
| `workflow/` | 需求到交付的流程、状态机和质量门禁 |
| `roles/` | 角色职责、派发和交接规则 |
| `capabilities/` | 可按需挂载的工程能力 |
| `skills/` | 可独立加载的本地化深度执行技能 |
| `templates/` | 功能、缺陷、调研任务模板 |
| `requirements-inbox/` | 按项目隔离的原型、需求文档和附件组成的多文件需求包入口 |
| `reports/` | 按项目和任务隔离的分析、计划、验证证据 |
| `designs/` | 按项目和原型名称隔离的设计过程原型 |
| `registry/` | 能力和来源注册表 |
| `adapters/` | 宿主入口，当前为 Codex |
| `migration/` | 整理范围和验证记录 |

## 边界

本目录不保存项目业务规则、历史日志、示例项目产物或 Obsidian 展示配置。框架本机关联表保存项目背景和定位信息；项目业务文档与专属规范由项目仓库维护。

提交边界：提交内容仅包括通用核心规则、工作流、角色、能力、模板、注册表模板和宿主适配器。`requirements-inbox/`、`reports/` 与 `designs/` 只提交入口 README；具体需求包、原型、附件、任务报告、验证记录和迁移记录属于本地工作产物，不进入框架提交集。

关联项目边界：项目名称、背景、真实路径、启动入口、健康检测和业务文档索引保存在本机 `registry/project-context.yaml` 中；业务术语、能力地图和项目文档内容保存在项目仓库。框架中的示例只能使用去标识化的通用描述。

项目关联规则：项目关联表的最小必填项是项目标识、显示名称、领域、背景、根路径、业务文档和 `required_context`。仓库、运行、集成和运维信息仅在任务实际需要时登记；所有已登记的项目路径使用绝对路径，框架内部文档引用可以使用相对路径。

项目相关配置规则：`registry/project-context.yaml` 和 `registry/domain-glossary.yaml` 只作为本机配置使用，已加入 Git 忽略。仓库中提交的是 `.template.yaml` 模板，不包含真实项目路径、业务文档或领域术语。

启动入口规则：仅对需要由框架启动或验证的运行对象登记 `runtime`。每个入口至少包含 `name`、`command` 和 `working_directory`；需要健康检测时补充检查地址与预期结果。项目可按技术栈补充 `kind`、`url`、`health_path`、`main_class`、`shorten_command_line` 或 `prerequisites`，但不要求静态站点、脚本项目或未参与本轮任务的服务填写这些字段。

运行时验证规则见 `workflow/project-initialization.md`：先探测，后启动，按需重启；项目初始化协议是该规则的唯一正文。

## 框架自检

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-framework.ps1
```

自检覆盖核心文件存在性、能力注册表路径、深度技能 frontmatter、技能来源记录、功能和缺陷任务模板的追踪字段、状态恢复规则、CodeGraph 适配器中的当前工具名称，以及本地产物忽略规则。自检不能替代人工审查，但应在修改框架协议、模板或注册表后运行。
