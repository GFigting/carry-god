---
name: "ecd-template"
description: "管理和生成编码规则 SQL 模板。当用户需要创建或修改系统编码规则、业务单号规则、infra_ecd_tp/infra_ecd_dtl SQL 时调用此技能。"
---

# 编码规则模板技能

## 功能
生成 `infra_ecd_tp`、`infra_ecd_dtl` 编码规则 SQL。

## 默认格式
- 默认业务单号格式：`[业务编码]-yyyyMMdd0001`。
- `[业务编码]` 使用编码类型 ID，如 `COST`、`CGDD`。
- 示例：业务编码 `COST` 生成 `COST-202606040001`。
- 用户不同意默认格式时，要求用户提供完整格式；不要自行猜新格式。

## 规则来源
- `constantFill`：常量填充，如 `COST-`
- `sysDateFill`：系统日期填充
- `zeroFill`：序列流水，输出按 `ecd_len` 补零，如 `0001`
- `dynamicSerialFill`：按前缀动态流水，适合每日/年度重置
- `cascadeSerialFill`：级联流水
- `variableFill`：变量填充

## 生成规则
- 默认拆成三段：业务编码前缀、日期、序列流水。
- 日期使用 Java `SimpleDateFormat`：`yyyyMMdd`，不要写 `YYYYMMDD`。
- 默认 4 位序列：`0001`，使用 `zeroFill`，`ecd_val` 初始值用 `1`。
- 默认不按日期重置；日期只是编码内容的一段。
- 用户明确要求按日期/年度重置时，才使用 `dynamicSerialFill`，并让 `ecd_val` 指向前面已拼出的前缀键，如 `{COST_PREFIX}{COST_DATE}`。
- SQL 要幂等：存在则 `UPDATE`，不存在则 `INSERT ... SELECT ... WHERE NOT EXISTS`。
- 可清理同一 `ecd_tp_id` 下非当前规则明细，但要在注释中说明。

## 推荐模板
```sql
-- 编码规则：[业务编码]-yyyyMMdd0001
-- 生成示例：COST-202606040001

SET @ecd_tp_id := 'COST';
SET @ecd_tp_nm := '费用单';
SET @prefix_dtl_id := CONCAT(@ecd_tp_id, '_PREFIX');
SET @date_dtl_id := CONCAT(@ecd_tp_id, '_DATE');
SET @serial_dtl_id := CONCAT(@ecd_tp_id, '_SERIAL');

INSERT INTO `infra_ecd_tp` (
    `ecd_tp_id`, `ecd_tp_nm`, `rmrk`, `status`,
    `creator`, `create_time`, `updater`, `update_time`, `deleted`
)
SELECT
    @ecd_tp_id, @ecd_tp_nm, CONCAT(@ecd_tp_nm, '编码：', @ecd_tp_id, '-yyyyMMdd0001'), 0,
    '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `infra_ecd_tp`
    WHERE `ecd_tp_id` = @ecd_tp_id
      AND `deleted` = b'0'
);

UPDATE `infra_ecd_tp`
SET `ecd_tp_nm` = @ecd_tp_nm,
    `rmrk` = CONCAT(@ecd_tp_nm, '编码：', @ecd_tp_id, '-yyyyMMdd0001'),
    `status` = 0,
    `updater` = '1',
    `update_time` = NOW()
WHERE `ecd_tp_id` = @ecd_tp_id
  AND `deleted` = b'0';

-- 前缀：[业务编码]-
INSERT INTO `infra_ecd_dtl` (
    `ecd_dtl_id`, `ecd_tp_id`, `rule_id`, `rule_src`, `sn`,
    `ecd_len`, `ecd_val`, `status`,
    `creator`, `create_time`, `updater`, `update_time`, `deleted`
)
SELECT
    @prefix_dtl_id, @ecd_tp_id, NULL, 'constantFill', 1,
    LENGTH(CONCAT(@ecd_tp_id, '-')), CONCAT(@ecd_tp_id, '-'), 0,
    '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `infra_ecd_dtl`
    WHERE `ecd_tp_id` = @ecd_tp_id
      AND `ecd_dtl_id` = @prefix_dtl_id
      AND `deleted` = b'0'
);

UPDATE `infra_ecd_dtl`
SET `rule_id` = NULL,
    `rule_src` = 'constantFill',
    `sn` = 1,
    `ecd_len` = LENGTH(CONCAT(@ecd_tp_id, '-')),
    `ecd_val` = CONCAT(@ecd_tp_id, '-'),
    `status` = 0,
    `updater` = '1',
    `update_time` = NOW()
WHERE `ecd_tp_id` = @ecd_tp_id
  AND `ecd_dtl_id` = @prefix_dtl_id
  AND `deleted` = b'0';

-- 日期：yyyyMMdd
INSERT INTO `infra_ecd_dtl` (
    `ecd_dtl_id`, `ecd_tp_id`, `rule_id`, `rule_src`, `sn`,
    `ecd_len`, `ecd_val`, `status`,
    `creator`, `create_time`, `updater`, `update_time`, `deleted`
)
SELECT
    @date_dtl_id, @ecd_tp_id, NULL, 'sysDateFill', 2,
    8, 'yyyyMMdd', 0,
    '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `infra_ecd_dtl`
    WHERE `ecd_tp_id` = @ecd_tp_id
      AND `ecd_dtl_id` = @date_dtl_id
      AND `deleted` = b'0'
);

UPDATE `infra_ecd_dtl`
SET `rule_id` = NULL,
    `rule_src` = 'sysDateFill',
    `sn` = 2,
    `ecd_len` = 8,
    `ecd_val` = 'yyyyMMdd',
    `status` = 0,
    `updater` = '1',
    `update_time` = NOW()
WHERE `ecd_tp_id` = @ecd_tp_id
  AND `ecd_dtl_id` = @date_dtl_id
  AND `deleted` = b'0';

-- 序列流水：0001
INSERT INTO `infra_ecd_dtl` (
    `ecd_dtl_id`, `ecd_tp_id`, `rule_id`, `rule_src`, `sn`,
    `ecd_len`, `ecd_val`, `status`,
    `creator`, `create_time`, `updater`, `update_time`, `deleted`
)
SELECT
    @serial_dtl_id, @ecd_tp_id, NULL, 'zeroFill', 3,
    4, '1', 0,
    '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `infra_ecd_dtl`
    WHERE `ecd_tp_id` = @ecd_tp_id
      AND `ecd_dtl_id` = @serial_dtl_id
      AND `deleted` = b'0'
);

UPDATE `infra_ecd_dtl`
SET `rule_id` = NULL,
    `rule_src` = 'zeroFill',
    `sn` = 3,
    `ecd_len` = 4,
    `ecd_val` = '1',
    `status` = 0,
    `updater` = '1',
    `update_time` = NOW()
WHERE `ecd_tp_id` = @ecd_tp_id
  AND `ecd_dtl_id` = @serial_dtl_id
  AND `deleted` = b'0';

SELECT `ecd_dtl_id`, `ecd_tp_id`, `rule_src`, `sn`, `ecd_len`, `ecd_val`, `status`
FROM `infra_ecd_dtl`
WHERE `ecd_tp_id` = @ecd_tp_id
  AND `deleted` = b'0'
ORDER BY `sn`;
```

## 使用
1. 确认业务编码和编码名称。
2. 默认使用 `[业务编码]-yyyyMMdd0001`。
3. 用户不同意默认格式时，先让用户提供完整格式。
4. 生成单文件 SQL。
5. 在 SQL 文件末尾附带**注释掉的回滚 SQL**（DELETE 语句，先删明细再删类型），供人工手动回滚测试。
6. 不执行 SQL，除非用户明确要求。
7. 回传文件路径、编码类型 ID、生成示例。

## 注意
- 先查项目实际 `infra_ecd_tp`、`infra_ecd_dtl` 表结构；字段不同则调整。
- `sysDateFill` 使用 Java 日期格式，年份用 `yyyy`。
- `zeroFill` 是序列流水；`ecd_len` 控制补零长度，`ecd_val` 是当前起始序列值。
- `dynamicSerialFill` 只用于按前缀重置；前缀为空会返回错误文本，必须让 `ecd_val` 能取到前面片段拼接值。
- 编码类型 ID 要与业务代码里的 `EncodeTemplateCodeEnum` 或调用方 `ecdTpId` 一致。
