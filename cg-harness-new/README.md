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

## 目录

| 目录 | 作用 |
|---|---|
| `core/` | 全局行为、边界和加载协议 |
| `workflow/` | 需求到交付的流程、状态机和质量门禁 |
| `roles/` | 角色职责、派发和交接规则 |
| `capabilities/` | 可按需挂载的工程能力 |
| `templates/` | 功能、缺陷、调研任务模板 |
| `requirements-inbox/` | 按项目隔离的原型、需求文档和附件组成的多文件需求包入口 |
| `reports/` | 按项目和任务隔离的分析、计划、验证证据 |
| `designs/` | 按项目和原型名称隔离的设计过程原型 |
| `registry/` | 能力和来源注册表 |
| `adapters/` | 宿主入口，当前为 Codex |
| `migration/` | 整理范围和验证记录 |

## 边界

本目录不保存具体项目注册信息、业务知识、历史日志、示例项目产物或 Obsidian 展示配置。项目自身的规则应由项目仓库提供，不能写入通用框架。

提交边界：提交内容仅包括通用核心规则、工作流、角色、能力、模板、注册表模板和宿主适配器。`requirements-inbox/`、`reports/` 与 `designs/` 只提交入口 README；具体需求包、原型、附件、任务报告、验证记录和迁移记录属于本地工作产物，不进入框架提交集。

关联项目边界：项目名称、真实项目路径、业务术语、项目能力地图和项目文档索引保存在项目仓库或本机 `registry/project-context.yaml` 中，不写入通用框架。框架中的示例只能使用去标识化的通用描述。

项目关联规则：项目源码、前端、后端、数据库、文档和部署路径统一使用绝对路径；框架内部文档引用可以使用相对路径。

项目相关配置规则：`registry/project-context.yaml` 和 `registry/domain-glossary.yaml` 只作为本机配置使用，已加入 Git 忽略。仓库中提交的是 `.template.yaml` 模板，不包含真实项目路径、业务文档或领域术语。

启动入口规则：项目的前端和后端启动方式登记在对应的 `entrypoints` 中。每个入口至少包含 `name`、`kind`、`command` 和 `working_directory`；前端入口还应登记固定 `url` 和 `health_path`，Spring Boot 入口应补充 `main_class`，并在 `backend.health_checks` 登记就绪检查。当依赖较多导致 Windows 命令行过长时，将 `shorten_command_line` 设为 `MANIFEST`，表示使用 IntelliJ IDEA 的“JAR 清单”模式；`prerequisites` 用于记录启动前必须准备的依赖服务或环境变量。

运行时验证规则：始终先执行已登记的健康探测，再决定是否启动。运行对象健康时默认复用；后端源码、资源、配置或依赖变更后重启后端；前端业务代码优先依赖开发服务器热更新，只有环境变量、构建配置、依赖或启动参数变更时才重启前端。健康检查失败但端口已被占用时，必须先诊断现有进程，不得直接启动第二个实例；每次启动或重启后必须重新执行健康检查。
