---
type: skill_index
id: SKL-SQL-001
title: SQL 模板索引
domain: sql

tags:
  - type/skill_index
  - domain/sql
created: 2026-07-03
updated: 2026-07-03
---

# SQL 模板索引

## 概述

本目录存放**跨项目共享的 SQL 生成模板**（离线 skill 库）。所有基于芋道框架的项目（fms-rear、lasen-rear 等）共用同一套表结构约定，模板在此统一维护。

TL 模式下 Agent 在生成 SQL 脚本时，按需读取对应模板，按项目实际表结构微调。

## 模板一览

| 模板 | 文件 | 涉及表 | 说明 |
|------|------|--------|------|
| 菜单模板 | `menu-template/SKILL.md` | `system_menu` | 菜单、目录、按钮的幂等 INSERT |
| 字典模板 | `dict-template/SKILL.md` | `system_dict_type` + `system_dict_data` | 字典类型 + 字典数据的幂等 INSERT |
| 权限模板 | `perm-template/SKILL.md` | `system_role_menu` | 角色-菜单权限关联，批量分配菜单+按钮 |
| 编码规则模板 | `ecd-template/SKILL.md` | `infra_ecd_tp` + `infra_ecd_dtl` | 业务单号编码规则的幂等 INSERT/UPDATE |

## 使用协议

```
Agent 生成 SQL 时
    ↓
1. 识别 SQL 类型（菜单/字典/权限/编码规则/DDL）
    ↓
2. 读取本目录下对应 SKILL.md
    ↓
3. 按模板生成 SQL，同时遵循 UTIL-SQL管理规范.md 的文件组织规则
    ↓
4. SQL 写入项目 sql_dir 目录（查 配置与元数据/项目注册表.yaml）
```

## 项目适配

模板默认基于 FMS/Lasen 的芋道表结构。若其他项目的表名或字段有差异：
1. 先查项目实际表结构（MCP MySQL 或 codegraph）
2. 按差异调整模板中的表名和字段名
3. 差异较大的项目考虑在项目 `docs/skills/` 下维护独立副本

## 相关文档

- `通用能力层/工具手册/UTIL-SQL管理规范.md` — SQL 文件管理与命名规范
- `配置与元数据/项目注册表.yaml` — 项目 `sql_dir` 配置
