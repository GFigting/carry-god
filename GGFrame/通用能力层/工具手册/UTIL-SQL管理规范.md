---
type: util
id: UTIL-SQL-001
title: SQL 管理规范
domain: sql

tags:
  - type/util
  - domain/sql
created: 2026-07-03
updated: 2026-07-17
---

# SQL 管理规范

## 概述

本规范定义项目中 SQL 脚本的统一管理方式。**一个功能模块的所有 SQL（DDL + 字典 + 菜单 + 权限 + 编码规则）归入同一个文件**，以 DDL 的 Flyway 命名为主，避免 SQL 碎片化。

## 核心原则

1. **一功能一文件**：一个功能模块的 DDL、字典、菜单、权限、编码规则合并到同一 SQL 文件
2. **SQL 即代码**：SQL 脚本视为代码类产物，直接写入项目 `sql_dir`（查 `配置与元数据/项目注册表.yaml`）
3. **幂等优先**：所有 INSERT 使用 `WHERE NOT EXISTS`，可重复执行不报错
4. **模板驱动**：生成 SQL 时读取 `通用能力层/skills/sql-templates/` 下对应模板
5. **字段分组可审核**：DDL 字段按关联、业务、基础展示、系统管理等类型用注释分组；复杂业务字段可继续细分，便于人类审查和后续维护
6. **历史 SQL 不回改**：TL 不直接修改任何“本轮对话”以外的既有 SQL 文件。所有 SQL 在人工控制下默认只会执行一次，历史 SQL 视为已执行资产；新需求、新修正、新补丁默认新建本轮 SQL 文件承载。
7. **字符集与排序规则统一**：新建表和涉及字符集/排序规则的 DDL 默认使用 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`；字符列不单独覆盖排序规则，除非项目既有表结构或用户明确要求。

### 历史 SQL 修改边界 ⚠️ 强制

TL 只能在以下场景修改既有 SQL：

- 人类在本轮对话明确指出某个既有 SQL 文件可以修改。
- 本轮任务目标就是把多个 SQL 汇集成一份，且 TL 已说明合并后的执行口径。
- 既有 SQL 是本轮对话中新建、尚未交付人工执行的文件。

除此之外，即使发现历史 SQL 中有遗漏或错误，也应新增 `V{YYYYMMDD}__mod_{模块描述}.sql` 或同项目约定的补丁 SQL，说明它修正哪个历史文件的执行结果，不直接回改历史文件。

## SQL 类型与涉及表

| 类型 | 涉及表 | 模板 | 分区标注 |
|------|--------|------|---------|
| DDL | 业务表（CREATE/ALTER/DROP） | — | `-- DDL` |
| 字典 | `system_dict_type` + `system_dict_data` | dict-template | `-- 字典` |
| 菜单 | `system_menu`（type=1/2/3） | menu-template | `-- 菜单` |
| 权限 | `system_role_menu` | perm-template | `-- 权限` |
| 编码规则 | `infra_ecd_tp` + `infra_ecd_dtl` | ecd-template | `-- 编码规则` |

## 文件命名

### 主命名：Flyway V 格式（推荐）

```
V{YYYYMMDD}__{动作}_{模块描述}.sql
```

- `{动作}`：`add`（新增）、`mod`（修改）、`del`（删除）
- 示例：`V20260703__add_cost_settlement.sql`

### 补充命名：按类型（非 Flyway 项目或手动执行）

```
{类型}_{YYYYMMDD}__{描述}.sql
```

- 类型：`ddl`、`menu`、`dict`、`perm`、`ecd`
- 示例：`menu_20260703__cost_dashboard.sql`

### 选择规则

- 项目使用 Flyway → 主命名（`V*`），所有 SQL 类型合并到一个 `V*` 文件
- 项目不使用 Flyway 或 SQL 需独立手动执行 → 补充命名，按需拆分

## 文件内容组织

一个完整的 `V*` SQL 文件按以下顺序分区：

```sql
-- ============================================================
-- {功能描述}
-- ============================================================

-- DDL: 业务表结构变更
ALTER TABLE `xxx` ADD COLUMN `yyy` ...;
-- ...

-- 字典: 字典类型 + 字典数据
INSERT INTO `system_dict_type` ...;
INSERT INTO `system_dict_data` ...;

-- 菜单: 菜单 + 按钮
-- @parent_name := '父级菜单名称';
INSERT INTO `system_menu` ...;   -- 菜单
INSERT INTO `system_menu` ...;   -- 按钮1
INSERT INTO `system_menu` ...;   -- 按钮2

-- 权限: 角色-菜单关联
-- @role_code := '角色标识';
INSERT INTO `system_role_menu` ...;

-- 编码规则: 如有
INSERT INTO `infra_ecd_tp` ...;
INSERT INTO `infra_ecd_dtl` ...;

-- 结果确认
SELECT ... FROM system_dict_data WHERE ...;
SELECT ... FROM system_menu WHERE ...;
SELECT ... FROM system_role_menu ...;

-- ============================================================
-- 反向SQL（回滚）—— 全部注释，供人工手动回滚测试
-- 执行前请确认当前数据库状态与生成时一致
-- ============================================================
-- 权限: 删除角色-菜单关联
-- DELETE FROM `system_role_menu` WHERE ...;

-- 菜单: 删除按钮 + 菜单
-- DELETE FROM `system_menu` WHERE ...;

-- 字典: 删除字典数据 + 字典类型
-- DELETE FROM `system_dict_data` WHERE ...;
-- DELETE FROM `system_dict_type` WHERE ...;

-- DDL: 回滚表结构变更
-- ALTER TABLE `xxx` DROP COLUMN `yyy`;
```

## DDL 字段分组与字符集 ⚠️ 强制

TL 设计或生成业务表 DDL 时，必须先按字段职责整理顺序，再写 SQL。目标不是增加装饰性注释，而是让人类无需逐列猜测字段用途，也让后续 Agent 追加字段时能把同类字段放到合理位置。

新建业务表时，表级定义必须显式带上 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`。若修改历史表且需要调整字符集/排序规则，遵循“历史 SQL 不回改”原则生成本轮补丁 SQL，不直接改历史建表脚本。

### 推荐分组

| 分组 | 字段范围 | 常见示例 |
|------|----------|----------|
| 关联字段 | 外键、业务关联 ID、来源单据、映射关系 | `subject_id`、`customer_id`、`contract_id`、`source_bill_no` |
| 业务字段 | 承载业务规则、金额、状态、口径、计算结果 | `bill_type`、`settle_amount`、`invoice_status`、`tax_rate` |
| 基础展示字段 | 编号、名称、备注、排序、冗余展示值 | `code`、`name`、`remark`、`sort` |
| 系统管理字段 | 租户、创建更新、逻辑删除、版本、审计 | `tenant_id`、`creator`、`create_time`、`deleted`、`version` |

复杂表（如 FMS 的 `cs_bill` 类大宽表）中，**业务字段应视情况再分一层**，例如：

- 业务字段：账单基础口径
- 业务字段：金额与税率
- 业务字段：开票与收付款
- 业务字段：状态流转
- 业务字段：对账/结算映射

### DDL 示例

```sql
CREATE TABLE `cs_bill_example` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',

  -- 关联字段：主体、客户、合同、来源单据
  `subject_id` bigint NOT NULL COMMENT '主体ID',
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `contract_id` bigint DEFAULT NULL COMMENT '合同ID',
  `source_bill_no` varchar(64) DEFAULT NULL COMMENT '来源单据号',

  -- 业务字段：账单基础口径
  `bill_no` varchar(64) NOT NULL COMMENT '账单编号',
  `bill_type` varchar(64) NOT NULL COMMENT '账单类型',
  `bill_date` date DEFAULT NULL COMMENT '账单日期',

  -- 业务字段：金额与税率
  `total_amount` decimal(18,2) DEFAULT NULL COMMENT '总金额',
  `tax_rate` decimal(10,4) DEFAULT NULL COMMENT '税率',
  `tax_amount` decimal(18,2) DEFAULT NULL COMMENT '税额',

  -- 业务字段：开票与收付款
  `invoice_status` varchar(32) DEFAULT NULL COMMENT '开票状态',
  `payment_status` varchar(32) DEFAULT NULL COMMENT '收付款状态',

  -- 基础展示字段
  `remark` varchar(512) DEFAULT NULL COMMENT '备注',

  -- 系统管理字段
  `tenant_id` bigint DEFAULT 1 COMMENT '租户ID',
  `creator` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) DEFAULT b'0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='账单示例表';
```

### 使用规则

- 新建复杂业务表时必须使用分组注释；简单关联表至少区分「关联字段」和「系统管理字段」。
- `ALTER TABLE ADD COLUMN` 新增字段时，注释中说明目标分组；若项目允许调整列位置，使用 `AFTER` 将字段放到同类字段附近。
- 字段顺序优先服务可读性：关联关系靠前，核心业务字段居中，系统管理字段靠后。
- 不为每个字段重复写“这是业务字段”这类低价值注释；分组注释应描述字段群的定位。
- 与数据库直接对应的 Java DO、数据库交互 VO 应按相同分组维护字段顺序，便于 SQL 与代码互相对照。
- 新建表必须显式使用 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`；若项目模板已有更严格的统一建表片段，优先沿用项目模板但不得退回非 `utf8mb4` 字符集。

## 生成协议

Agent 在生成 SQL 时遵循以下流程：

```
用户需求（如"新建费用结算页面"）
    ↓
1. 识别需要哪些 SQL 类型
   - 新页面 → 菜单 + 按钮 + 权限
   - 新字典 → 字典类型 + 数据
   - 新表/字段 → DDL
   - 新编码规则 → 编码规则
    ↓
2. 依次读取 通用能力层/skills/sql-templates/{类型}/SKILL.md
    ↓
3. 若涉及 DDL，先按字段职责分组并整理顺序，确认新建表使用 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`，再按模板生成各部分 SQL，填入同一文件
    ↓
4. 文件写入项目 sql_dir（查项目注册表）
    ↓
5. 若需要修正历史 SQL，默认新增本轮补丁 SQL；只有人类明确允许或本轮目标为 SQL 合并时才修改既有 SQL
    ↓
6. 告知用户文件路径和需确认的变量（如父级菜单名、角色标识）
```

## 跨项目差异处理

| 差异项 | fms-rear | lasen-rear | 处理方式 |
|--------|----------|------------|---------|
| `system_menu` | 含 `component_name` | 同 | 通用模板 |
| `system_dict_data` | 含 `color_type` | 含 `color_type` + `css_class` + `remark` | lasen 多 2 字段，生成时补充 |
| `system_role_menu` | 含 `tenant_id` | 同（多租户） | 通用模板，tenant_id=1 |
| SQL 目录 | `fms-sql/` | 待建立（当前散落各模块） | fms 统一，lasen 后续对齐 |

## 反模式（禁止）

- 字典数据先 `DELETE` 再全量 `INSERT`（破坏幂等性，误删已有扩展项）
- 菜单/权限使用硬编码 ID（环境间 ID 不同，必须用变量查）
- SQL 文件散落各模块子目录（统一收归 `sql_dir`）
- 同功能拆成 3-4 个零散 SQL 文件（增加执行遗漏风险）
- 为了“补全”或“修正”而直接回改历史 SQL，导致人工已执行脚本与仓库内容不一致
- 新建表未显式声明 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`，或字符列各自散落不同排序规则

## 相关文档

- `通用能力层/skills/sql-templates/README.md` — SQL 模板索引
- `通用能力层/skills/sql-templates/menu-template/SKILL.md` — 菜单模板
- `通用能力层/skills/sql-templates/dict-template/SKILL.md` — 字典模板
- `通用能力层/skills/sql-templates/perm-template/SKILL.md` — 权限模板
- `通用能力层/skills/sql-templates/ecd-template/SKILL.md` — 编码规则模板
- `配置与元数据/项目注册表.yaml` — 项目 `sql_dir` 配置
