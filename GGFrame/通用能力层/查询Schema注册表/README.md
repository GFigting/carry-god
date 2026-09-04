---
type: tool_manual
tags:
  - type/tool
  - type/schema
updated: 2026-06-24
---

# 查询 Schema 注册表

## 概述

为每个列表页面的查询条件建立结构化描述文件（YAML），供 AI Agent 在以下场景使用：

1. **口语→JSON**：用户自然语言描述查询需求 → AI 匹配 Schema → 输出可粘贴的 JSON 查询条件
2. **测试数据配套**：生成测试 SQL 的同时，输出配套的页面查询条件 JSON
3. **跨页面查询复用**：同一业务概念（如"供应商"）在不同页面的参数名和字典可能不同，Schema 提供统一语义层

## 文件组织

```
查询Schema注册表/
├── README.md                  ← 本文件
├── {项目key}/                  ← 对应 项目注册表.yaml 中的 key
│   ├── {页面名}-{简短描述}.yaml
│   └── ...
```

## Schema 文件格式规范

### 必填字段

| 字段 | 说明 |
|------|------|
| `page.route` | 前端路由路径 |
| `page.title` | 页面中文标题 |
| `page.api` | 后端分页查询 API 路径 |
| `page.db_main_table` | 主查询表名 |
| `params` | 查询参数列表（数组） |

### 参数字段 (params[].*)

| 字段 | 必需 | 说明 |
|------|------|------|
| `key` | ✅ | 前端 queryParams 中的字段名（QueryParamClipboard 导出/导入使用的 key） |
| `type` | ✅ | 参数类型：`dict_single` / `dict_array` / `table_single` / `text` / `text_array` / `daterange` / `number` |
| `label` | ✅ | 中文标签（页面上显示的 placeholder/label） |
| `semantic` | ✅ | 语义描述，用于 AI 理解这个字段代表什么业务概念 |
| `dict` | 条件 | `type=dict_*` 时必填，字典标识符（如 `FMS_ARAP_BIZ_TYPE`） |
| `dict_values` | 推荐 | 常用字典值列表（key: label），避免每次查字典 |
| `table` | 条件 | `type=table_*` 时必填，关联的表名（如 `fc_supplier`） |
| `db_column` | 推荐 | 对应的数据库列名（用于 AI 写 SQL 探查） |
| `db_table` | 条件 | 当字段来自 JOIN 表时，标注来源表 |
| `format` | 条件 | `type=daterange` 时标注格式，如 `YYYY-MM-DD HH:mm:ss` |
| `cascade` | 可选 | 联动的其他字段 key |
| `depends_on` | 可选 | 依赖的前置字段 key |
| `exposed` | 可选 | `true`（前端可见）/ `false`（仅后端 API 支持，前端未暴露），默认 true |
| `example` | 推荐 | 示例值 |
| `notes` | 可选 | 补充说明（如值的来源、特殊处理逻辑） |

### 语义索引 (semantic_index)

为 AI 提供"用户口语 → 参数 key"的快速映射。

| 字段 | 说明 |
|------|------|
| `words` | 用户可能使用的同义词列表 |
| `maps_to` | 映射到的参数 key |
| `precondition` | 前置条件（如"需先设置 customerType=SUPPLIER"） |
| `resolver` | 解析策略：`direct`（直接映射）/ `dict_lookup`（查字典翻译）/ `db_probe`（需 SQL 探查）/ `relative_date`（相对日期计算） |

### db_probe 提示 (db_probe_hints)

为 AI 提供常见探查场景的 SQL 模板，减少每次重复编写。

| 字段 | 说明 |
|------|------|
| `scenario` | 探查场景描述 |
| `sql_template` | SQL 模板，使用 `{param}` 占位符 |
| `output_maps_to` | 探查结果映射到哪个参数 |

## Agent 使用协议

### 加载时机

1. 用户使用 `/withQuery` 指令时
2. 用户口语化描述查询需求时（如"我想查 XXX 列表里 YYY 的数据"）
3. `/withMock` 生成测试数据时，同步生成配套 JSON 查询条件

### 执行流程

```
1. 用户口语 → 关键词匹配 → 定位 Schema 文件（按 page.title / params[].semantic / semantic_index[].words）
2. 解析口语 → 区分"直接映射"和"需 DB 探查"
3. 直接映射 → 填入 JSON
4. DB 探查 → 连接 MySQL → 使用 db_probe_hints 或自行编写 SQL → 获取具体值 → 填入 JSON
5. 组装完整 JSON → 输出（剪贴板 / 产物文件）
```

### 输出格式

输出的 JSON 格式与页面 `queryParams` 对象一致，可直接通过 QueryParamClipboard 导入。

不包含分页字段（`pageNo`、`pageSize`），这些由 QueryParamClipboard 的 `excludeKeys` 默认过滤。

## 维护策略

- **新增页面**：手动创建 Schema 文件，或使用 AST 提取脚本生成初稿后人工补充语义标注
- **页面新增查询字段**：同步更新 Schema 文件的 `params` 列表和 `semantic_index`
- **字典值变更**：更新 `dict_values`
- **过时检测**：对比前端 `LocalQueryParams` 接口与 Schema `params[].key` 列表，发现差异时标记 `## Agent 反馈` 区
