---
type: knowledge
id: "KNOW-2026-001"
title: "Lombok chain 全局配置导致 EasyExcel 导入字段全 null"
domain: backend
topic: "Lombok @Accessors(chain) 与 EasyExcel 兼容性"
maturity: verified
source: "GOAL-103-P2"
author: "zhuangjl"
related_roles: ["ROLE-后端开发工程师"]
tags:
  - type/knowledge
  - domain/backend
created: "2026-07-01"
updated: "2026-07-01"
---

# Lombok chain 全局配置导致 EasyExcel 导入字段全 null

## 现象

EasyExcel 导入 Excel 文件时，能识别到正确的行数，但每行的所有字段值都是 `null`。

## 根因

项目 `lombok.config` 中设置了全局链式调用：

```properties
lombok.accessors.chain=true
```

这导致所有 `@Data` 注解生成的 setter 返回类型为 `this`（类本身），而非 `void`。

EasyExcel 通过反射调用 setter 赋值时，要求 setter 签名匹配 `void setXxx(Type value)`。链式 setter 的签名是 `XxxClass setXxx(Type value)`，返回类型不匹配，反射设值全部失败 → 字段全为 `null`。

## 解决方案

在 EasyExcel 导入 VO 上显式加 `@Accessors(chain = false)` 覆盖全局配置：

```java
// ✅ 正确
@Data
@Accessors(chain = false)  // 必须！覆盖 lombok.config 全局 chain=true
public class XxxImportExcelVO {
    @ExcelProperty("列名")
    private String field;
}

// ❌ 错误 — 全局 chain=true 下，setter 返回 this，EasyExcel 无法赋值
@Data
public class XxxImportExcelVO {
    @ExcelProperty("列名")
    private String field;
}
```

## 适用边界

- **必须加**：所有 EasyExcel `read()` 使用的导入 VO
- **不需要加**：EasyExcel `write()` 导出 VO（只读 getter，不调用 setter）
- **不需要加**：MapStruct `@Mapping` target 的 VO（MapStruct 用 builder/constructor，不用 setter）

## 已知受影响的文件

| 文件 | GOAL | 修复日期 |
|------|------|---------|
| `MaterialInvoiceNameImportExcelVO.java` | GOAL-103 | 2026-07-01 |

## 相关陷阱

- Lombok `@Builder` 与 MapStruct 继承冲突（见 `KB-Lombok-Builder与MapStruct继承陷阱.md`，待归档）
