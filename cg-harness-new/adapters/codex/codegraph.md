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
4. 检查当前项目是否存在 `.codegraph/` 索引目录。
5. 没有索引时，提醒用户使用绝对路径初始化索引。

在 CodeGraph 未安装或未连接前，可以继续做文本级探索，但必须明确说明结构化代码分析能力暂不可用。

## Windows 安装

在 PowerShell 中执行：

```powershell
npm install --global @astudioplus/codegraph-mcp@0.20.1
codex mcp add codegraph -- codegraph-mcp
```

安装后重启 Codex，或者重新打开当前会话。

## 验证安装

```powershell
Get-Command codegraph-mcp
codex mcp list
```

预期结果：系统能够找到 `codegraph-mcp`，Codex 的 MCP 列表中存在 `codegraph`。

## 初始化项目索引

对已登记项目使用绝对路径：

```powershell
Set-Location -LiteralPath 'D:\项目\项目目录'
codegraph init -i
```

初始化完成后检查索引状态：

```powershell
codegraph status
```

## 使用顺序

| 问题 | 优先能力 |
|---|---|
| 某个符号在哪里定义 | `codegraph_search` |
| 谁调用了某个符号 | `codegraph_callers` |
| 某个符号调用了什么 | `codegraph_callees` |
| 从入口到目标的调用路径 | `codegraph_trace` |
| 修改某处会影响什么 | `codegraph_impact` |
| 模块整体结构 | `codegraph_context` |
| 批量读取多个符号源码 | `codegraph_explore` |
| 索引是否健康 | `codegraph_status` |

文本、注释、日志和配置内容仍使用普通文本搜索。CodeGraph 查询为空时，先执行 `codegraph init -i` 重建索引，再重新查询；仍为空时才降级为普通搜索。

## 安全边界

- 安装全局包、修改用户级 Codex 配置和初始化项目索引前，先提醒用户。
- 项目路径必须使用绝对路径。
- 不把 `.codegraph/` 数据库内容复制进通用框架。
- 不把代码、凭据或项目资料上传到未确认的外部服务。
