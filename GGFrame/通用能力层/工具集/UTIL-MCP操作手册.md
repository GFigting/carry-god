---
type: config
id: UTIL-MCP-001
title: MCP 操作手册
aliases: [MCP Manual, MCP 手册, MCP]
domain: infrastructure

tags:
  - type/config
  - domain/infrastructure
  - tool/mcp
created: 2026-05-25
updated: 2026-05-25
---

# MCP 操作手册

## 概述

Model Context Protocol (MCP) 是 AI Agent 与外部数据源交互的标准协议。本框架通过 MCP Server 使 Agent 能够直接查询远程 MySQL 数据库的表结构和数据。

## 已安装组件

| 组件 | 包名 | 版本 |
|------|------|------|
| MySQL MCP Server | `@benborla29/mcp-server-mysql` | 2.0.8 |

## MySQL MCP Server 配置

### 添加 MCP Server

使用 Claude Code CLI 注册 MySQL MCP Server：

```bash
claude mcp add mcp_server_mysql \
  --env MYSQL_HOST="<数据库地址>" \
  --env MYSQL_PORT="3306" \
  --env MYSQL_USER="<用户名>" \
  --env MYSQL_PASS="<密码>" \
  --env MYSQL_DB="<数据库名>" \
  -- npx -y @benborla29/mcp-server-mysql
```

### 配置参数说明

| 环境变量 | 必填 | 默认值 | 说明 |
|----------|------|--------|------|
| `MYSQL_HOST` | 是 | — | 远程 MySQL 服务器地址 |
| `MYSQL_PORT` | 否 | `3306` | MySQL 端口 |
| `MYSQL_USER` | 是 | — | 数据库用户名 |
| `MYSQL_PASS` | 是 | — | 数据库密码 |
| `MYSQL_DB` | 是 | — | 默认连接的数据库名 |

### 配置文件位置

执行 `claude mcp add` 后，配置存储在以下位置：

| 级别 | 路径 | 说明 |
|------|------|------|
| **全局** | `~/.claude/config/mcp.json` | 影响所有项目 |
| **项目** | `<项目根>/.mcp.json` | 仅当前项目生效 |

使用 `claude mcp list` 查看已注册的 MCP Server。

### 移除/更新

```bash
# 查看已注册
claude mcp list

# 查看详情
claude mcp get mcp_server_mysql

# 移除
claude mcp remove mcp_server_mysql

# 移除后重新 add 即可更新配置
```

## MCP 查询的工作流

```
用户提问 "查一下 fms 对账结算中心的表结构"
    ↓
Agent 判断需要查数据库
    ↓
Agent 调用 MCP 工具:
  - mcp__mcp_server_mysql__list-tables
  - mcp__mcp_server_mysql__describe-table
    ↓
Agent 获得表结构信息
    ↓
（可选）Agent 将结果写入
  5.知识沉淀/技术文档/数据库/{项目}/
    ↓
Agent 回复用户
```

## 多数据库场景

若需连接多个数据库，注册多个 MCP Server 实例：

```bash
# FMS 数据库
claude mcp add mcp_server_mysql_fms \
  --env MYSQL_HOST="..." --env MYSQL_DB="fms_db" \
  -- npx -y @benborla29/mcp-server-mysql

# LASEN 数据库
claude mcp add mcp_server_mysql_lasen \
  --env MYSQL_HOST="..." --env MYSQL_DB="lasen_db" \
  -- npx -y @benborla29/mcp-server-mysql
```

## 安全注意事项

- 生产环境数据库建议使用**只读账号**
- 密码会存储在 `~/.claude/config/mcp.json` 中，注意文件权限
- 框架文档中的表结构快照可以脱敏，只保留表名+字段名+类型
- 不要在框架文档中写入数据库连接密码

## 关联

- [[📑_数据库文档索引]] — 表结构文档存放位置
- [[8.配置与元数据/标签体系]] — 标签定义
- [[8.配置与元数据/项目注册表]] — 项目元数据
