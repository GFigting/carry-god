---
type: teacher-analysis
domain: framework
version: "1.0"
created: 2026-06-24
status: draft
trigger: "fms-rear MCP 接入可行性讨论中的归纳洞察"
---

# AI 能力网关 — 配置驱动的系统接入方案

## 核心洞察

> **AI 可用的业务系统 = 现有 REST API + 语义适配层。不需要改动系统本身。**

从 fms-rear 是否要支持 MCP 的讨论出发，形成了一个更底层的认知：

1. **任何有 HTTP API 的系统**，只需要一份足够好的"说明书"，就能被 AI 使用
2. **AI 最擅长的事**之一就是：理解自然语言描述 → 映射到结构化调用
3. **决定 AI 调用质量的关键**不是协议层的代码，而是工具描述（description）、参数语义（parameter hints）、实体关系（entity relationships）
4. **账号/认证/权限**本质也是配置，不应耦合在 bridge 代码里

这条路径自然导向一个通用设计：

> **一个配置驱动的个人 AI 能力网关** — 管理某人所有的系统账号、注册所有可用 API、以 MCP 协议统一暴露给任何 AI 客户端。

---

## 概念模型

```
┌──────────────────────────────────────────────┐
│  AI 客户端 (Claude Code / GPT / OpenManus)    │
│  规划 → 推理 → 选择工具 → 执行                  │
└──────────────┬───────────────────────────────┘
               │  MCP 协议（统一语言）
               ▼
┌──────────────────────────────────────────────┐
│  AI 能力网关（配置驱动的通用引擎）               │
│                                               │
│  账号注册表 ─→ 所有系统、认证方式、凭据引用       │
│  工具注册表 ─→ 所有 API、参数语义、调用示例       │
│  流程注册表 ─→ 典型多步调用链、前置依赖           │
│  执行引擎   ─→ 解析配置 → 认证 → HTTP/SQL → 返回  │
└──────────────┬───────────────────────────────┘
               │  REST / SQL / ...
               ▼
┌──────────────────────────────────────────────┐
│  各类业务系统                                   │
│  fms-rear · lasen-rear · MySQL · XXL-JOB · ... │
└──────────────────────────────────────────────┘
```

**关键特征**：
- 网关本身是**无业务的**——不包含任何特定系统的逻辑
- 所有"系统能做什么"的信息外置在配置文件中
- 新增一个系统 = 新增一份 YAML，网关代码零改动
- 通过 MCP 协议暴露，任何 AI 客户端都能直接使用

---

## 配置文件设计草案

### 第一层：账号注册表 `accounts.yaml`

定义**你是哪些系统的用户、怎么认证**。

```yaml
accounts:
  fms:
    name: "FMS 财务业务系统"
    type: rest_api
    base_url: "http://10.0.1.5:50120"
    auth:
      method: cookie_session
      login_url: "/system/auth/login"
      credentials_ref: "env:FMS_CREDENTIALS"
    description: "FMS 后端，覆盖对账结算、库存管理、物料同步、ARAP查询"
    health_check: "/system/health"

  mysql:
    name: "FMS 数据库 (只读)"
    type: database
    host: "10.0.1.6"
    port: 3306
    database: "fms"
    credentials_ref: "env:MYSQL_READONLY"
    readonly: true

  lasen:
    name: "拉森中台后端"
    type: rest_api
    base_url: "http://10.0.2.1:8080"
    auth:
      method: bearer_token
      token_ref: "env:LASEN_TOKEN"
```

### 第二层：工具注册表 `tools.yaml`

定义**每个系统能做什么、参数怎么填**。

```yaml
tools:
  # ── FMS 查询类 ──
  - id: fms-query-arap
    account: fms
    method: GET
    path: "/fc/arap/page"
    description: |
      查询应收应付对账列表(ARAP)。
      以库存单明细行粒度返回。

      典型场景：
      - "本月所有应付明细" → direction_type="IN", start_date="本月1号", end_date="今天"
      - "某供应商的对账数据" → customer_type="SUPPLIER", 先通过 dict_search 查 customer_id
      - "某物料的所有应收应付" → material_code="M001"

      返回 arapBiz 字段：AP=应付, AP_RED=应付冲红, AR=应收, AR_RED=应收冲红, UNCLEAR=未归类
    parameters:
      - name: bill_number
        type: string
        match: exact
        hint: "库存单号，如 'INV-2026-001'"
      - name: material_code
        type: string
        match: exact
        hint: "物料编码，如 'M001'"
      - name: customer_type
        type: enum
        values: [SUPPLIER, ORG]
        hint: "SUPPLIER=供应商, ORG=主体"
      - name: direction_type
        type: enum
        values: [IN, OUT]
        hint: "IN=入库/应付, OUT=出库/应收"
      - name: start_date
        type: date
        format: yyyy-MM-dd
        map_to: "billDate"
        hint: "单据日期起始（含）"
      - name: end_date
        type: date
        format: yyyy-MM-dd
        map_to: "billDate"
        hint: "单据日期截止（含）"
      - name: customer_id
        type: int
        source_hint: "需要通过 dict_search(account='fms', dict_type='supplier', name='供应商名') 先获取"
      - name: arap_biz_type_list
        type: array
        values: [AP, AP_RED, AR, AR_RED, UNCLEAR]
        hint: "按应收付类型筛选，多选"
    return_example: |
      { data: [{ billNumber, materialCode, materialName, qty, priceWithTax,
                 amountWithTax, arapBiz, customerType, customerId, ... }],
        total, page, pageSize }
    category: query

  - id: fms-query-inventory-bill
    account: fms
    method: GET
    path: "/fc/inventory-bill/page"
    description: |
      查询业务层库存流水。
      支持按单号、物料、日期、主体、类型等多条件组合。
    # ...

  # ── FMS 操作类 ──
  - id: fms-create-reconciliation
    account: fms
    method: POST
    path: "/fms/reconciliation/create-from-arap"
    description: |
      从 ARAP 数据中创建对账单。
      需要先通过 fms-query-arap 确认数据范围。
    parameters:
      - name: arap_ids
        type: array<int>
        required: true
        hint: "ARAP 记录 ID 列表，从 query_arap 结果中获取"
      - name: pay_receive_type
        type: enum
        values: [RECEIVE, PAY]
        hint: "RECEIVE=收款对账, PAY=付款对账"
    category: action

  # ── MySQL 查询（数据库直接调用，配置即 SQL 模板）──
  - id: mysql-query-table-structure
    account: mysql
    type: sql_query
    sql: "DESCRIBE {{table_name}}"
    description: "查询表结构"
    parameters:
      - name: table_name
        type: string
        required: true
        hint: "表名，如 fc_inventory_bill"
    category: meta
```

### 第三层：流程注册表 `flows.yaml`（可选）

定义**典型的多步调用链**。

```yaml
flows:
  - id: supplier-monthly-reconciliation
    description: "对某供应商的月度入库进行对账"
    steps:
      - tool: fms-dict-search
        params: { dict_type: "supplier", name: "$supplier_name" }
        output_key: "supplier"
      - tool: fms-query-arap
        params:
          customer_id: "$supplier.id"
          direction_type: "IN"
          start_date: "$month_start"
          end_date: "$month_end"
        output_key: "arap_data"
      - tool: fms-create-reconciliation
        params:
          arap_ids: "$arap_data.*.id"
          pay_receive_type: "PAY"
    # AI 可以按步骤执行，也可以把整条流程当作一个"宏"来调用
```

---

## 与框架现有概念的对应关系

这个网关并非全新事物。框架中已有多个概念在为此铺路：

| 框架已有 | 做了什么 | 还缺什么 |
|---------|---------|---------|
| `项目注册表.yaml` | 系统的路径、技术栈、模块 | 缺少运行时信息（URL、端口、认证方式） |
| `通用能力层/查询Schema注册表/` | 页面查询条件的结构化描述 | 面向人类开发，需要转译为 AI 可读的 tool description |
| README.md「快速定位」区 | 人类口语 → 精确路径 | 机器不可读，需要结构化 |
| 角色技能映射表 | 什么角色有什么技能 | 技能是抽象的，需要绑定到具体的系统能力 |
| 知识沉淀/ 统一归档 | 技术调研、经验教训 | 需要沉淀"系统能力文档"类别 |

**演进路径**：

1. `项目注册表.yaml` 扩展字段 `runtime`（URL、端口、认证方式）
2. `查询Schema注册表/` 增长到一定量后，自然变成工具注册表的一部分
3. README.md「快速定位」区 → 升维为结构化的 tool description
4. 最终：所有这些配置被一个通用网关引擎读取，以 MCP 协议暴露

---

## 关键设计原则

### 1. 配置驱动，而非代码驱动

- Bridge/gateway 的代码应该是**通用解析器**，不含任何业务逻辑
- 新增系统 = 新增 YAML，不需要写 bridge 代码
- 这本质上是 **"API 的 API"**：元层次的接口描述

### 2. 三层描述，逐层递进

| 层次 | 内容 | 回答的问题 |
|------|------|-----------|
| 账号层 | 系统地址、认证方式、凭据 | "怎么连上这个系统？" |
| 工具层 | API 路径、参数语义、返回值 | "这个系统能做什么？" |
| 流程层 | 多步调用链、依赖关系 | "怎么组合使用完成一件事？" |

### 3. AI 优先的 description 写作

- description 不是给人类开发者看的 JavaDoc，是给 AI 看的**语义线索**
- 必须包含：典型场景、参数间的语义关系、值的含义（如 enum 的每个值代表什么）、前置依赖（如"customer_id 需要先通过 dict_search 获取"）

### 4. 无侵入

- 不对目标系统做任何代码改动
- 认证凭据通过环境变量注入，不硬编码
- 网关自身是独立进程，crash 不影响业务系统

---

## 潜在应用场景

- **跨系统数据问答**："供应商 A 在 fms 里的应付总额是多少？"
- **运维辅助**："重启 fms-rear 的 XXL-JOB 定时任务 A"（需操作类 API）
- **跨系统报表**：从 fms + lasen 同时取数据，AI 做聚合分析
- **代码生成辅助**：AI 先通过 MCP 查表结构，再生成准确的 MyBatis Mapper XML
- **对账工作流自动化**："每天早上 9 点查前一天的 ARAP 数据，如有异常发企微通知"

---

## 是否与 OpenHuman/OpenManus 同类

OpenHuman/OpenManus 解决的是 **"AI 怎么思考"**：
- 任务规划、子目标拆解
- 推理循环（思考 → 行动 → 观察 → 反思）
- 多步工具调用编排

本方案解决的是 **"AI 怎么接入"**：
- 账号管理、认证方式
- 所有系统的能力描述（tool registry）
- 统一暴露（MCP 协议）

两者是**上下层互补**关系：
- 网关提供手脚（能力接入）
- Agent 框架提供大脑（规划推理）
- MCP 协议是它们之间的**共同语言**

---

## 下一步方向

- [ ] 设计 `项目注册表.yaml` 的 `runtime` 扩展字段（URL、端口、认证方式）
- [ ] 设计工具注册表 YAML schema 的完整定义
- [ ] 验证：为 fms-rear 写出覆盖 ARAP / 库存 / 对账 / 物料 / 供应商的完整工具注册表
- [ ] 验证：通用网关引擎的最小可行实现（Python/Node.js，读取配置 → MCP Server）
- [ ] 验证：用 Claude Code 通过该网关实际查询 fms-rear 数据
- [ ] 思考：这套配置是否应纳入框架本体（`通用能力层/AI能力网关/`），还是作为独立项目
