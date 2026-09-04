---
name: "dict-template"
description: "管理和生成字典 SQL 模板。当用户需要创建或修改系统字典、从枚举提取字典项、生成幂等字典 SQL 时调用此技能。"
---

# 字典模板技能

## 功能
生成 `system_dict_type`、`system_dict_data` 字典 SQL。支持手工字典和从后端枚举提取字典项。

## 特点
- 通用表名，无特定数据库前缀
- 时间字段自动生成
- 枚举显式 `code/value/type` 优先作为字典 `value`
- 默认幂等插入，不删除旧数据

## 枚举提取规则
- 先定位枚举类，读取完整枚举定义和构造方法。
- 若枚举有 `code`、`value`、`type`、`key` 等字段，使用该字段作为 `system_dict_data.value`。
- 若枚举没有显式值，才使用枚举常量名作为 `value`。
- `label` 优先取枚举描述字段，如 `name`、`desc`、`label`、`message`、`text`；没有则取常量中文注释或常量名。
- 不要把中文 `label` 翻译或转大写生成 `value`，除非枚举本身没有稳定编码。
- `dict_type` 按项目已有约定命名，如 `cost_type`、`cost_map_type`；不确定时按业务模块蛇形命名。
- `sort` 按枚举声明顺序从 1 开始。
- `color_type` 按语义设置：成功 `success`、警告 `warning`、危险/异常 `danger`、普通 `default/primary/info`。

## SQL 规则
- 字典类型使用 `INSERT ... SELECT ... WHERE NOT EXISTS`。
- 字典数据默认逐条幂等插入，使用 `WHERE NOT EXISTS` 判断 `dict_type + value + deleted`。
- 默认不 `DELETE` 再全量插入，避免误删已有扩展项；用户明确要求重置或项目既有迁移约定全量替换时才使用。
- 同一文件包含字典类型、字典数据、结果确认查询。
- 生成迁移脚本时按项目命名规则；Flyway 自动执行文件用 `V*`，手动模板不要误用 `V*`。

## 颜色类型
- `default` - 默认
- `primary` - 主要
- `success` - 成功
- `info` - 信息
- `warning` - 警告
- `danger` - 危险

## 示例
```sql
-- 字典类型
INSERT INTO `system_dict_type` (`name`, `type`, `status`, `creator`, `create_time`, `updater`, `update_time`, `deleted`)
SELECT '订单状态', 'order_status', 0, '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `system_dict_type`
    WHERE `type` = 'order_status'
      AND `deleted` = b'0'
);

-- 字典数据
INSERT INTO `system_dict_data` (`sort`, `label`, `value`, `dict_type`, `status`, `color_type`, `creator`, `create_time`, `updater`, `update_time`, `deleted`)
SELECT 1, '待审核', 'PENDING', 'order_status', 0, 'warning', '1', NOW(), '1', NOW(), b'0'
WHERE NOT EXISTS (
    SELECT 1 FROM `system_dict_data`
    WHERE `dict_type` = 'order_status'
      AND `value` = 'PENDING'
      AND `deleted` = b'0'
);

SELECT `dict_type`, `label`, `value`, `sort`, `color_type`
FROM `system_dict_data`
WHERE `dict_type` = 'order_status'
  AND `deleted` = b'0'
ORDER BY `sort`;
```

## 使用
1. 确认字典来源：手工列表或枚举类。
2. 从枚举生成时，先提取所有枚举常量、编码、中文名、排序。
3. 生成单文件 SQL，默认幂等插入。
4. 在 SQL 文件末尾附带**注释掉的回滚 SQL**（DELETE 语句，先删数据再删类型），供人工手动回滚测试。
5. 不执行 SQL，除非用户明确要求。
6. 回传文件路径和涉及的 `dict_type`。

## 前后端完善清单

### 前端
| 文件 | 修改内容 |
|------|----------|
| `src/views/fms/xxx/index.vue` | 搜索筛选 + 列表列展示 |
| `src/utils/dict.ts` | 添加 DICT_TYPE 枚举 |
| `src/api/fms/xxx/index.ts` | PageReqVO 添加查询参数 |

### 后端
| 文件 | 修改内容 |
|------|----------|
| `enums/xxx/EnumNameEnum.java` | 枚举类 |
| `controller/admin/xxx/vo/PageReqVO.java` | 添加查询参数 |
| `service/xxx/ServiceImpl.java` | 添加查询逻辑（如需要） |

## 注意
- 确保表结构存在
- 调整 `creator` 和 `updater` 为实际用户 ID
- 保持 `dict_type` 唯一性
- 合理设置排序值
- 若前端已有 `DICT_TYPE` 常量，同步补充对应枚举键。
