---
type: skill
id: SKL-FC-001
title: 中台成品对账税金修复
domain: fc-reconciliation
project: lasen-rear
module: lasen-module-fc

tags:
  - type/skill
  - domain/fc
  - project/lasen
  - skill/data_fix
created: 2026-07-06
updated: 2026-07-06
---

# 中台成品对账税金修复

## 概述

lasen-rear 成品对账（fc_reconciliation_product）的历史数据修复能力。涵盖税金三字段（is_rec_part_vat / rec_part_vat_value / rec_part_vat_amount）、预留款金额、请款金额、账期子表的联动修改。

**适用场景**：
1. 历史对账单的半卖税金补充（is_rec_part_vat / rec_part_vat_value / rec_part_vat_amount）
2. 预留款含税/不含税转换（reserve_amount 的税基调整）
3. 对账单状态、请款金额修正
4. 账期子表（fc_reconciliation_period_dt）联动调整
5. 关联付款计划表（fc_rec_link_payment / fc_payment_plan_settlement）数据修正

## 表结构关系

```
fc_reconciliation_product (成品对账主表)
    ├── 1:N ── fc_reconciliation_period_dt (账期子表)
    │           via reconciliation_product_id
    ├── 1:N ── fc_rec_link_payment (对账关联付款计划)
    │           via reconciliation_product_id
    │               └── N:1 ── fc_payment_plan_settlement (付款计划结算清单)
    │                           via accounts_payable_settlement_id
```

### 核心表字段速查

#### fc_reconciliation_product — 成品对账主表

| 字段 | 类型 | 说明 |
|------|------|------|
| `reconciliation_product_id` | bigint | 主键 |
| `bill_number` | varchar | 对账单号（如 PRB250814-0003） |
| `status` | varchar | 审核状态 |
| `requested_status` | varchar | 请款状态 |
| `requested_payment_amount` | decimal | 请款金额（已请款金额） |
| `reserve_amount` | decimal | 预留款金额 |
| `is_rec_part_vat` | varchar | 半卖部分是否含税（Y/N） |
| `rec_part_vat_value` | decimal | 半卖部分税率 |
| `rec_part_vat_amount` | decimal | 半卖部分税金 |
| `reconciliation_amount` | decimal | 对账总金额（不含税） |
| `reconciliation_tax_amount` | decimal | 对账总金额（含税） |
| `is_use_period` | varchar | 是否使用账期 |
| `real_amount` | decimal | 实际支付金额（已废弃） |

#### fc_reconciliation_period_dt — 账期子表

| 字段 | 类型 | 说明 |
|------|------|------|
| `reconciliation_period_dt_id` | bigint | 主键 |
| `reconciliation_product_id` | bigint | 关联成品对账单ID |
| `period_type` | varchar | 款项期次类型（进度款/预留款/尾款/质保金/延期款...） |
| `expected_amount` | decimal | 预计请款金额（预计支付金额） |
| `expected_time` | date | 预计支付时间 |
| `is_requested` | varchar | 是否已请款（Y/N） |
| `paid_amount` | decimal | 已支付金额（已付金额） |
| `confirmed_amount` | decimal | 已开票金额 |
| `remark` | varchar | 备注 |

#### fc_rec_link_payment — 对账关联付款计划

| 字段 | 类型 | 说明 |
|------|------|------|
| `rec_link_payment_id` | bigint | 主键 |
| `reconciliation_product_id` | bigint | 成品对账单ID |
| `accounts_payable_settlement_id` | bigint | 结算单ID（→ fc_payment_plan_settlement） |
| `reconciliation_period_dt_id` | bigint | 账期ID（→ fc_reconciliation_period_dt） |
| `bill_amount` | decimal | 对账单金额 |
| `request_amount` | decimal | 请款金额 |

#### fc_payment_plan_settlement — 付款计划结算清单

| 字段 | 类型 | 说明 |
|------|------|------|
| `payment_plan_settlement_id` | bigint | 主键 |
| `bill_number` | varchar | 结算单号（如 FPPS251226-0021） |
| `payment_amount` | decimal | 应付金额 |
| `request_status` | varchar | 请款状态 |
| `paid_amount` | decimal | 已支付金额 |
| `confirmed_amount` | decimal | 已开票金额 |

## 字典映射 ⚠️ 必读

**数据库 status 字段存的是字典码，不是中文。** 写 SQL 时必须使用字典值。

字典定义源文件：`lasen-module-fc-api/.../enums/FcDictTypeConstants.java`

### 成品对账状态 (`status` 字段，字典类型: `FC_P_BILL_STATUS_*`)

| 字典码 | 中文含义 | 常量名 |
|--------|----------|--------|
| `0` | 待提交 | `FC_P_BILL_STATUS_0` |
| `1` | 待审核 | `FC_P_BILL_STATUS_1` |
| `2` | 已审核 | `FC_P_BILL_STATUS_2` |
| `3` | 已完成 | `FC_P_BILL_STATUS_3` |
| `4` | 已驳回 | `FC_P_BILL_STATUS_4` |
| `5` | 待复核 | `FC_P_BILL_STATUS_5` |
| `6` | **复核确认** | `FC_P_BILL_STATUS_6` |
| `7` | 复核驳回 | `FC_P_BILL_STATUS_7` |
| `8` | 开票确认提交态 | `FC_P_BILL_STATUS_8` |
| `9` | 开票确认审核通过 | `FC_P_BILL_STATUS_9` |
| `10` | 开票确认驳回 | `FC_P_BILL_STATUS_10` |
| `11` | 供应商确认 | `FC_P_BILL_STATUS_11` |
| `12` | 请款中 | `FC_P_BILL_STATUS_12` |
| `X` | 已作废 | `FC_P_BILL_STATUS_X` |

### 请款状态 (`requested_status` 字段)

| 字典码 | 中文含义 | 常量名 |
|--------|----------|--------|
| `6` | 未开始 | `FC_P_BILL_STATUS_REQUEST_STATUS_UN_REQUEST` |
| `12` | 请款中 | `FC_P_BILL_STATUS_REQUEST_STATUS_ING` |
| `3` | 已完成 | `FC_P_BILL_STATUS_REQUEST_STATUS_COMPLETED` |

> ⚠️ 注意：`requested_status` 和 `status` 共享部分字典码但含义不同。如 `6` 在 `status`=复核确认，在 `requested_status`=未开始。

### 是否类字段

| 值 | 含义 |
|----|------|
| `Y` | 是 |
| `N` | 否 |

适用字段：`is_rec_part_vat`, `is_requested`, `is_use_period`, `is_delayed_payment`

### 账期款项类型 (`period_type` 字段，字典类型: `FC_RECONCILIATION_PERIOD_TYPE`)

| 字典码 | 中文含义 | 常量名 |
|--------|----------|--------|
| `ADVANCE_PAYMENT` | 订金 | `FC_RECONCILIATION_PERIOD_TYPE_ADVANCE_PAYMENT` |
| `EXTRA_ADVANCE_PAYMENT` | 额外订金 | `FC_RECONCILIATION_PERIOD_TYPE_EXTRA_ADVANCE_PAYMENT` |
| `PROGRESS_AMOUNT` | 进度款 | `FC_RECONCILIATION_PERIOD_TYPE_PROGRESS_AMOUNT` |
| `FINAL_AMOUNT` | 尾款 | `FC_RECONCILIATION_PERIOD_TYPE_FINAL_AMOUNT` |
| `REVERSE` | 预留款 | `FC_RECONCILIATION_PERIOD_TYPE_REVERSE` |
| `DELAY_M30` | 面料延期款-本月 | `FC_RECONCILIATION_PERIOD_TYPE_DELAY_M30` |
| `DELAY_M60` | 面料延期款-60天 | `FC_RECONCILIATION_PERIOD_TYPE_DELAY_M60` |
| `DELAY_M90` | 面料延期款-90天 | `FC_RECONCILIATION_PERIOD_TYPE_DELAY_M90` |
| `DELAY_F60` | 拉链延期款 | `FC_RECONCILIATION_PERIOD_TYPE_DELAY_F60` |
| `CC` | 抄送 | `FC_RECONCILIATION_PERIOD_TYPE_CC` |
| `CUSTOMIZE` | 自定义 | `FC_RECONCILIATION_PERIOD_TYPE_CUSTOMIZE` |

## 常用诊断 SQL

### 1. 查询对账单主表 + 税金字段

```sql
SELECT
    reconciliation_product_id, bill_number, status, requested_status,
    is_rec_part_vat, rec_part_vat_value, rec_part_vat_amount,
    reserve_amount, requested_payment_amount,
    reconciliation_amount, reconciliation_tax_amount,
    is_use_period
FROM fc_reconciliation_product
WHERE bill_number IN ('PRB250926-0006');
```

### 2. 查询对账单关联的付款计划（收付款计划）

```sql
SELECT frlp.*
FROM fc_reconciliation_product frp
LEFT JOIN fc_rec_link_payment frlp ON frp.reconciliation_product_id = frlp.reconciliation_product_id
WHERE frp.bill_number IN ('PRB250926-0006');
```

### 3. 查询关联的结算清单（付款计划结算）

```sql
SELECT fpps.*
FROM fc_reconciliation_product frp
LEFT JOIN fc_rec_link_payment frlp ON frp.reconciliation_product_id = frlp.reconciliation_product_id
LEFT JOIN fc_payment_plan_settlement fpps ON fpps.payment_plan_settlement_id = frlp.accounts_payable_settlement_id
WHERE frp.bill_number IN ('PRB250926-0006');
```

### 4. 查询账期子表

```sql
SELECT frpd.*
FROM fc_reconciliation_product frp
LEFT JOIN fc_reconciliation_period_dt frpd ON frp.reconciliation_product_id = frpd.reconciliation_product_id
WHERE frp.bill_number = 'PRB250926-0006';
```

### 5. 快速概览（主表+账期子表联动）

```sql
SELECT
    frp.bill_number, frp.status, frp.reserve_amount, frp.requested_payment_amount,
    frp.is_rec_part_vat, frp.rec_part_vat_value, frp.rec_part_vat_amount,
    frpd.period_type, frpd.expected_amount, frpd.is_requested,
    frpd.paid_amount, frpd.remark
FROM fc_reconciliation_product frp
LEFT JOIN fc_reconciliation_period_dt frpd ON frp.reconciliation_product_id = frpd.reconciliation_product_id
WHERE frp.bill_number IN ('PRB250814-0003', 'PRB251017-0001', 'PRB251220-0003')
ORDER BY frp.bill_number, frpd.period_type;
```

## 常见修复模式

### 模式 A：半卖税金补充

**场景**：历史对账单没有设置半卖税金，需要补充。

**涉及字段**：`is_rec_part_vat`, `rec_part_vat_value`, `rec_part_vat_amount`

**核心逻辑**：
- `is_rec_part_vat = 'Y'`
- `rec_part_vat_value = 0`（特殊情况设为0）或 `13`（13%税率）
- `rec_part_vat_amount = 不含税金额 * 0.13`

### 模式 B：预留款含税转换

**场景**：预留款金额从不含税转为含税，同时计算对应税金。

**涉及字段**：`reserve_amount`, `rec_part_vat_amount`, `rec_part_vat_value`

**核心逻辑**（原始值 = 当前 reserve_amount）：
- `rec_part_vat_amount = reserve_amount * 0.13`
- `reserve_amount = reserve_amount * 1.13`
- `is_rec_part_vat = 'Y'`

> **MySQL 安全提示**：同一 UPDATE 中多个 SET 子句都使用列的**原始值**（pre-update），因此 `reserve_amount * 0.13` 和 `reserve_amount * 1.13` 均基于同一个原始值计算，结果正确。

### 模式 C：账期子表联动

**场景**：主表修改后，账期子表对应类型的记录需要联动更新。

**涉及字段**：`expected_amount`, `is_requested`, `paid_amount`, `remark`

**关联方式**：通过 `reconciliation_product_id` 关联，并指定 `period_type` 过滤。

### 模式 D：状态与请款金额修正

**场景**：直接修正对账单的状态、请款金额，以及账期子表的请款标记和已付金额。

**涉及字段**：主表 `status`, `requested_payment_amount`；账期 `is_requested`, `paid_amount`, `remark`

## 修复协议

### Agent 执行流程

```
收到修复需求（描述 or SQL片段）
    ↓
1. 解析：提取 bill_number + 修改字段 + 目标值/计算公式
    ↓
2. 验证：查询 ls_dev 库确认当前值 → 计算目标值 → 与人工校验值对比
    ↓
3. 生成：按本文档模式生成完整 UPDATE + 验证 SELECT
    ↓
4. 落盘：SQL 写入 通用能力层/skills/reconciliation-tax-fix/sql/fix-{YYYYMMDD}-{描述}.sql
    ↓
5. 记录：更新 GOAL 工作记录（如有关联 GOAL）
```

### SQL 文件组织
- 每条 UPDATE 前写注释说明（来源/目标值/人工校验值）
- 每个修改后跟一条验证 SELECT（注释掉，供执行后确认）
- 文件头说明数据库 + 执行方式

### 安全约束
- 所有 UPDATE 必须带 `WHERE bill_number = 'XXX'` 精确限定
- 修改前先在 ls_dev 库执行验证 SELECT 确认当前值
- 涉及计算的（税率/税金），注释中写明人工校验值
- 禁止不带 WHERE 条件的 UPDATE

## lasen-rear 项目关键路径

| 组件 | 路径 |
|------|------|
| DO | `lasen-module-fc/lasen-module-fc-service/src/main/java/.../dal/dataobject/reconciliationproduct/ReconciliationProductDO.java` |
| DO (账期) | `lasen-module-fc/lasen-module-fc-service/src/main/java/.../dal/dataobject/reconciliationperioddt/ReconciliationPeriodDtDO.java` |
| DO (关联) | `lasen-module-fc/lasen-module-fc-service/src/main/java/.../dal/dataobject/reclinkpayment/RecLinkPaymentDO.java` |
| DO (结算) | `lasen-module-fc/lasen-module-fc-service/src/main/java/.../dal/dataobject/paymentplansettlement/PaymentPlanSettlementDO.java` |
| Controller | `lasen-module-fc/lasen-module-fc-biz/src/main/java/.../controller/admin/reconciliationproduct/ReconciliationProductController.java` |
| Service | `lasen-module-fc/lasen-module-fc-service/src/main/java/.../service/reconciliationproduct/ReconciliationProductServiceImpl.java` |

## 版本历史

- 2026-07-06 v1.1：新增字典映射章节（status/requested_status/is_*/period_type 全量字典值）
- 2026-07-06：初始版本，四表 ER 关系+字段速查+四种修复模式+诊断 SQL
