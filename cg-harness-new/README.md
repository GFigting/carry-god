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

## 目录

| 目录 | 作用 |
|---|---|
| `core/` | 全局行为、边界和加载协议 |
| `workflow/` | 需求到交付的流程、状态机和质量门禁 |
| `roles/` | 角色职责、派发和交接规则 |
| `capabilities/` | 可按需挂载的工程能力 |
| `templates/` | 功能、缺陷、调研任务模板 |
| `registry/` | 能力和来源注册表 |
| `adapters/` | 宿主入口，当前为 Codex |
| `migration/` | 整理范围和验证记录 |

## 边界

本目录不保存具体项目注册信息、业务知识、历史日志、示例项目产物或 Obsidian 展示配置。项目自身的规则应由项目仓库提供，不能写入通用框架。

项目关联规则：项目源码、前端、后端、数据库、文档和部署路径统一使用绝对路径；框架内部文档引用可以使用相对路径。

项目相关配置规则：`registry/project-context.yaml` 和 `registry/domain-glossary.yaml` 只作为本机配置使用，已加入 Git 忽略。仓库中提交的是 `.template.yaml` 模板，不包含真实项目路径、业务文档或领域术语。
