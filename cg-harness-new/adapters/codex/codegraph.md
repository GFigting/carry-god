---
type: adapter-guide
id: CGHN-CODEGRAPH-001
---

# CodeGraph MCP 使用与安装

## 首次使用提醒

首次进入一个需要代码结构探索、调用链分析或影响分析的项目时，先检查 CodeGraph MCP：

1. 检查 `codegraph-mcp` 是否可用。
2. 不可用时提醒用户安装，并提供下面的安装命令。
3. 安装后确认 Codex 已登记名为 `codegraph` 的 MCP 服务。
4. 检查当前项目是否存在 `.codegraph/` 索引目录，或通过 MCP 索引工具确认索引状态。
5. 没有索引或索引过期时，使用 MCP 工具重建索引；服务不可用时先记录限制。

在 CodeGraph 未安装或未连接前，可以继续做文本级探索，但必须明确说明结构化代码分析能力暂不可用。

## Windows 安装

在 PowerShell 中执行：

```powershell
npm install --global @astudioplus/codegraph-mcp@0.20.1
codex mcp add codegraph -- codegraph-mcp --workspace "D:\绝对路径\项目目录"
```

安装后重启 Codex，或者重新打开当前会话。

## 验证安装

```powershell
Get-Command codegraph-mcp
codex mcp list
```

预期结果：系统能够找到 `codegraph-mcp`，Codex 的 MCP 列表中存在 `codegraph`。

## 初始化项目索引

优先通过已连接的 CodeGraph MCP 工具处理索引：

- `reindex_workspace`：重建当前已登记 workspace 的索引。
- `index_directory`：对指定绝对路径建立或更新索引。
- `index_files`：只更新明确列出的文件。

当前 npm 包不提供名为 `codegraph` 的独立 CLI；不要在流程中使用历史版的独立初始化或状态检查命令。若 MCP 服务尚未连接，只能记录“结构化代码分析不可用”，并降级为文本级探索。

## 使用顺序

| 问题 | 优先能力 |
|---|---|
| 修改前需要编辑上下文 | `get_edit_context` |
| 修改某处会影响什么 | `analyze_impact` |
| 模块整体结构 | `get_module_summary` 或 `get_ai_context` |
| 查找代码模式或符号线索 | `search_by_pattern` |
| 查找错误信息相关代码 | `search_by_error` |
| 重建当前 workspace 索引 | `reindex_workspace` |
| 索引指定目录或文件 | `index_directory` / `index_files` |

文本、注释、日志和配置内容仍使用普通文本搜索。CodeGraph 查询为空时，先用 `reindex_workspace` 或 `index_directory` 重建索引，再重新查询；仍为空时才降级为普通搜索。

## 安全边界

- 安装全局包、修改用户级 Codex 配置和初始化项目索引前，先提醒用户。
- 项目路径必须使用绝对路径。
- 不把 `.codegraph/` 数据库内容复制进通用框架。
- 不把代码、凭据或项目资料上传到未确认的外部服务。
