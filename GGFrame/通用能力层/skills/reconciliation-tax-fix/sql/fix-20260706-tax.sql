-- ============================================================
-- 中台成品对账税金修复 — 第1批
-- 数据库：ls_dev (lasen-rear)
-- 日期：2026-07-06
-- 涉及表：fc_reconciliation_product, fc_reconciliation_period_dt
-- 执行方式：先跑每个单据的「验证-执行前」确认当前值 → 再跑「修复」 → 最后跑「验证-执行后」核对
-- ============================================================


-- ############################################################
-- ##  PRB250814-0003: 半卖税金补充 + 预留款含税转换
-- ##  人工校验：税金=676, 预留款=5876
-- ############################################################

-- ── 验证-执行前 ──────────────────────────────────────────────

-- [主表] 确认税金三字段+预留款 当前值
SELECT
    reconciliation_product_id, bill_number,
    is_rec_part_vat, rec_part_vat_value, rec_part_vat_amount,   -- 税金三字段
    reserve_amount                                               -- 预留款
FROM fc_reconciliation_product
WHERE bill_number = 'PRB250814-0003';

-- [账期子表] 仅查将被修改的 预留款(REVERSE) 记录
SELECT
    reconciliation_period_dt_id, period_type,
    expected_amount                                              -- 当前预计请款金额
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB250814-0003'
)
  AND period_type = 'REVERSE';  -- 预留款

-- ── 修复 ────────────────────────────────────────────────────
-- 注意：必须先更新账期子表（JOIN 主表取原始 reserve_amount），
--       再更新主表（MySQL 同一 UPDATE 中所有 SET 引用原始列值，计算安全）

-- [修复-1] 账期子表：预计请款金额 = 预留款原始值 * 1.13
UPDATE fc_reconciliation_period_dt frpd
INNER JOIN fc_reconciliation_product frp ON frpd.reconciliation_product_id = frp.reconciliation_product_id
SET frpd.expected_amount = frp.reserve_amount * 1.13
WHERE frp.bill_number = 'PRB250814-0003'
  AND frpd.period_type = 'REVERSE';
-- 预期影响行数: >=1

-- [修复-2] 主表：税金三字段 + 预留款含税
UPDATE fc_reconciliation_product
SET is_rec_part_vat     = 'Y',
    rec_part_vat_value  = 0,
    rec_part_vat_amount = reserve_amount * 0.13,   -- 原始值*0.13 → 676
    reserve_amount      = reserve_amount * 1.13    -- 原始值*1.13 → 5876
WHERE bill_number = 'PRB250814-0003';
-- 预期影响行数: 1

-- ── 验证-执行后 ──────────────────────────────────────────────

-- [主表] 确认修改结果
-- 预期: is_rec_part_vat=Y, rec_part_vat_value=0, rec_part_vat_amount=676, reserve_amount=5876
SELECT
    reconciliation_product_id, bill_number,
    is_rec_part_vat, rec_part_vat_value, rec_part_vat_amount,
    reserve_amount
FROM fc_reconciliation_product
WHERE bill_number = 'PRB250814-0003';

-- [账期子表] 确认预留款记录
-- 预期: expected_amount = 5876
SELECT
    reconciliation_period_dt_id, period_type,
    expected_amount
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB250814-0003'
)
  AND period_type = 'REVERSE';


-- ############################################################
-- ##  PRB251017-0001: 半卖税金补充 + 预留款含税转换
-- ##  人工校验：税金=650, 预留款=5650
-- ############################################################

-- ── 验证-执行前 ──────────────────────────────────────────────

-- [主表]
SELECT
    reconciliation_product_id, bill_number,
    is_rec_part_vat, rec_part_vat_value, rec_part_vat_amount,
    reserve_amount
FROM fc_reconciliation_product
WHERE bill_number = 'PRB251017-0001';

-- [账期子表] 仅查预留款记录
SELECT
    reconciliation_period_dt_id, period_type,
    expected_amount
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB251017-0001'
)
  AND period_type = 'REVERSE';

-- ── 修复 ────────────────────────────────────────────────────

-- [修复-1] 账期子表
UPDATE fc_reconciliation_period_dt frpd
INNER JOIN fc_reconciliation_product frp ON frpd.reconciliation_product_id = frp.reconciliation_product_id
SET frpd.expected_amount = frp.reserve_amount * 1.13
WHERE frp.bill_number = 'PRB251017-0001'
  AND frpd.period_type = 'REVERSE';

-- [修复-2] 主表
UPDATE fc_reconciliation_product
SET is_rec_part_vat     = 'Y',
    rec_part_vat_value  = 0,
    rec_part_vat_amount = reserve_amount * 0.13,   -- 原始值*0.13 → 650
    reserve_amount      = reserve_amount * 1.13    -- 原始值*1.13 → 5650
WHERE bill_number = 'PRB251017-0001';

-- ── 验证-执行后 ──────────────────────────────────────────────

-- [主表] 预期: is_rec_part_vat=Y, rec_part_vat_value=0, rec_part_vat_amount=650, reserve_amount=5650
SELECT
    reconciliation_product_id, bill_number,
    is_rec_part_vat, rec_part_vat_value, rec_part_vat_amount,
    reserve_amount
FROM fc_reconciliation_product
WHERE bill_number = 'PRB251017-0001';

-- [账期子表] 预期: expected_amount = 5650
SELECT
    reconciliation_period_dt_id, period_type,
    expected_amount
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB251017-0001'
)
  AND period_type = 'REVERSE';


-- ############################################################
-- ##  PRB251220-0003: 账单状态修正 + 请款金额 + 账期进度款
-- ############################################################

-- ── 验证-执行前 ──────────────────────────────────────────────

-- [主表]
SELECT
    reconciliation_product_id, bill_number,
    status,                        -- 当前状态（字典码）
    requested_payment_amount       -- 当前已请款金额
FROM fc_reconciliation_product
WHERE bill_number = 'PRB251220-0003';

-- [账期子表] 仅查将被修改的 进度款(PROGRESS_AMOUNT) 记录
SELECT
    reconciliation_period_dt_id, period_type,
    is_requested, paid_amount, remark
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB251220-0003'
)
  AND period_type = 'PROGRESS_AMOUNT';  -- 进度款

-- ── 修复 ────────────────────────────────────────────────────

-- [修复-1] 主表：状态 → 复核确认(字典码6)，已请款金额 → 127142.5
UPDATE fc_reconciliation_product
SET status                   = '6',       -- 字典码: 6=复核确认
    requested_payment_amount = 127142.5
WHERE bill_number = 'PRB251220-0003';
-- 预期影响行数: 1

-- [修复-2] 账期子表：进度款 → 已请款/已付金额/备注
UPDATE fc_reconciliation_period_dt frpd
INNER JOIN fc_reconciliation_product frp ON frpd.reconciliation_product_id = frp.reconciliation_product_id
SET frpd.is_requested = 'Y',
    frpd.paid_amount  = 117142.5,
    frpd.remark       = '历史单据 关联FPPS251226-0021'
WHERE frp.bill_number = 'PRB251220-0003'
  AND frpd.period_type = 'PROGRESS_AMOUNT';  -- 进度款
-- 预期影响行数: >=1

-- ── 验证-执行后 ──────────────────────────────────────────────

-- [主表] 预期: status=6(复核确认), requested_payment_amount=127142.5
SELECT
    reconciliation_product_id, bill_number,
    status,
    requested_payment_amount
FROM fc_reconciliation_product
WHERE bill_number = 'PRB251220-0003';

-- [账期子表] 预期: is_requested=Y, paid_amount=117142.5, remark='历史单据 关联FPPS251226-0021'
SELECT
    reconciliation_period_dt_id, period_type,
    is_requested, paid_amount, remark
FROM fc_reconciliation_period_dt
WHERE reconciliation_product_id = (
    SELECT reconciliation_product_id FROM fc_reconciliation_product WHERE bill_number = 'PRB251220-0003'
)
  AND period_type = 'PROGRESS_AMOUNT';
