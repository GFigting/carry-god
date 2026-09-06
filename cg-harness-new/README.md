---
type: framework
id: CGHN-000
title: CG Harness New
version: 1.0.0
status: active
---

# CG Harness New

面向 AI 辅助软件开发的轻量工作框架。

本框架以目标驱动、任务可追踪、角色协作和质量门禁为骨架，吸收成熟的需求澄清、架构设计、TDD、调试、代码审查、验证和知识沉淀方法。核心规则与具体宿主无关，当前提供 Codex 优先的加载入口。

## 快速开始

1. 读取 `AGENTS.md`。
2. 按 `core/loading-protocol.md` 加载当前任务需要的上下文。
3. 在 `workflow/software-delivery.md` 中定位任务阶段。
4. 从 `registry/capabilities.yaml` 选择能力，按需读取对应文件。
5. 使用 `templates/` 创建任务记录，并在结束时留下验证证据和学习记录。

## 目录

| 目录 | 作用 |
|---|---|
| `core/` | 全局行为、边界和加载协议 |
| `workflow/` | 需求到交付的流程、状态机和质量门禁 |
| `roles/` | 角色职责、派发和交接规则 |
| `capabilities/` | 可按需挂载的工程能力 |
| `templates/` | 功能、Bug、调研任务模板 |
| `registry/` | 能力和来源注册表 |
| `adapters/` | 宿主入口，当前为 Codex |
| `migration/` | 整理范围和验证记录 |

## 边界

本目录不保存具体项目注册信息、业务知识、历史日志、示例项目产物或 Obsidian 展示配置。项目自身的规则应由项目仓库提供，不能写入通用框架。
