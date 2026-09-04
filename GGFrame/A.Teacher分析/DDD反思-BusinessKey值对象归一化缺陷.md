# DDD 反思：BusinessKey 值对象归一化缺陷

> 来源：GOAL-101 P8.1 批量对账明细字段全空 Bug
> 日期：2026-06-24
> 关键词：值对象、工厂方法、归一化、身份一致性、基础设施泄露

---

## 一、现象

批量创建的对账单，详情页签中以下字段全部为空：
- 单据类型 (inventoryBillType)
- 业务日期 (billDate)
- 中台库存单号 (ztInventoryBillNumber)
- 款号 (ztStyleNo)
- 物料编码 / 物料名称 (materialCode / materialName)

而单张创建的对账单这些字段正常展示。

## 二、表层原因

`toDetailRespVO` 展示详情时，通过 `businessKey` 反查 ARAP 源数据来填充展示字段。反查 SQL 生成的 `candidateBusinessKey` 中的 qty 去掉了尾零（如 `"10"`），而 Java `BusinessKey.encode()` 中的 qty 保留了尾零（如 `"10.00"`）。两个字符串不相等，匹配失败，导致 ARAP 源数据未被找到。

修复：在 `BusinessKey.of()` 中对 qty 做 `stripTrailingZeros()` 归一化。

## 三、DDD 层面的根因

这本质上是**值对象的不完整设计**，有三层问题：

### 3.1 值对象未履行"自洽"职责

在 DDD 中，**值对象（Value Object）的职责不仅是承载数据，更是对自身正确性负责**。`BusinessKey` 由四元组 `(mapType, mapBillNumber, materialId, qty)` 构成，它的身份（identity）完全由这四个属性决定。

但 `qty` 本质上是一个**数值**，不是一个**字符串**。将数值用字符串存储，却没有在构造时归一化，等于把格式问题泄漏给了所有调用方和所有存储层。

```
错误做法：
  new BigDecimal("10.00").toPlainString()  → "10.00"
  SQL CAST(10.00 AS CHAR)  → REGEXP_REPLACE → "10"
  两个字符串不同 → BusinessKey 不同 → 匹配失败

正确做法（值对象自洽）：
  BusinessKey.of(..., qty)
    内部: new BigDecimal(qty).stripTrailingZeros().toPlainString() → "10"
  无论调用方传入 "10"、"10.0"、"10.00"，结果都是 "10"
```

### 3.2 工厂方法没有做"门禁"

`BusinessKey.of()` 是唯一的构造入口（私有构造函数）。作为工厂方法，它的职责是：

1. 校验参数合法性 ✓（已做）
2. **归一化参数以保证值对象身份的确定性** ✗（遗漏）

工厂方法是领域逻辑的第一道防线。如果数据在这个入口没有被归一化，后续所有依赖 `equals()`/`hashCode()` 的逻辑（包括 Map 查找、Set 去重、数据库匹配）都会产生隐蔽的错误。

### 3.3 基础设施层的格式泄露到了领域层

SQL 中 `REGEXP_REPLACE(CAST(dt.qty AS CHAR), '\\.?0+$', '')` 是基础设施层的实现细节。业务键的编码格式应该由**领域层单方面定义**，基础设施层只能遵循，不能独立制定。

当前的设计中，同一个领域概念（businessKey 的字符串表示）在两层有不同的格式规范：
- 领域层（Java）：`toPlainString()` — 保留原始 scale
- 基础设施层（SQL）：`REGEXP_REPLACE` — 去尾零

这违反了 DDD 的**依赖倒置原则**：领域层不应该依赖基础设施层的格式约定，相反，基础设施层应该适配领域层的格式。

## 四、为什么"单张创建没问题"？

因为单张创建时，用户通常选择**已建账**的项。已有账单的 `businessKey` 是老数据，可能在某个历史时间点恰好与 SQL 格式一致。批量创建更大概率触发**新建账单**路径 → 新 `BusinessKey` 带尾零 → 反查必然失败。

"有时正常有时不正常"正是值对象设计缺陷的典型症状——当不同调用路径传入不同格式的等价数据时，行为不一致。

## 五、这个缺陷本该如何在 DDD 流程中被发现？

### 5.1 值对象单元测试

`BusinessKey` 作为核心值对象，应该有单元测试覆盖：

```java
@Test
void shouldTreatQtyWithTrailingZerosAsSameIdentity() {
    BusinessKey a = BusinessKey.of("MAP_INVENTORY", "BILL001", 1L, "10");
    BusinessKey b = BusinessKey.of("MAP_INVENTORY", "BILL001", 1L, "10.00");
    assertEquals(a, b);  // 这个断言在修复前会失败！
}
```

### 5.2 值对象设计 Review 清单

当设计一个值对象时，必须检查：

| 检查项 | 说明 |
|--------|------|
| 所有 String 属性是否需要 trim/case normalization | 如 name、type 等 |
| 所有数值属性是否需要 scale normalization | 如 qty、amount 等 |
| 所有枚举值是否使用枚举类型而非 String | 如 billType vs "NORMAL" |
| equals/hashCode 是否覆盖了所有属性 | 不能遗漏 |
| 与 DB/外部系统的编码协议是否由领域层单方面定义 | 基础设施层适配领域层，而非反向 |

## 六、教训

这次的 Bug 表面上是一个字符串格式不一致的小问题，但深层是**值对象设计不完整**：

1. **值对象的工厂方法是领域逻辑的最后一道防线**。如果工厂方法不归一化，后续所有使用 `equals()` 的地方都是定时炸弹。
2. **数值不应该用裸字符串存储**。如果 `qty` 字段在 `BusinessKey` 内部用 `BigDecimal` 存储（而非 `String`），自然就不会有格式问题。
3. **基础设施层的格式约定必须适配领域层**，而不是反过来。领域层定义 `encode()` 的准确格式，SQL 层必须照做，不能平行地定义另一套编码规则。
4. **值对象必须有 unit test**，尤其是 `equals()` 的对称性、传递性，以及归一化后的等价性。
