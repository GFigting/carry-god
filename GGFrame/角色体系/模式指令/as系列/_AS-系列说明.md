---
type: mode_series_guide
series: as
version: "1.1"
updated: 2026-07-23
---

# as 系列 — 模式切换指令

## 系列约定

as 系列指令用于**切换主会话的运行模式**。核心特征：

| 特性 | 约定 |
|------|------|
| **互斥性** | 同一时间只能处于一种 as 模式，切换即替换 |
| **默认值** | `/asTL` 是默认模式，无需显式声明 |
| **作用域** | 全局，影响所有后续会话行为 |
| **持久性** | 模式持续到用户显式切换为止 |

## 可用指令

```dataview
TABLE WITHOUT ID
  file.link AS "指令定义",
  trigger AS "主触发词",
  summary AS "说明"
FROM "角色体系/模式指令/as系列"
WHERE overview = true AND series = "as"
SORT overview_order ASC
```

## 切换规则

1. 从任意模式切换到另一个 as 模式时，旧模式的行为约束立即失效
2. 切换时不清除 with 系列指令（with 指令在模式切换后仍需重新声明，因为其作用域是"当前 TL 会话"）
3. 从 `/asTeacher` 切回 `/asTL` 后，之前启用的 with 指令**不会**自动恢复——需用户重新声明

## 与 with 系列的关系

- with 系列**仅 TL 模式**下可用
- `/asTeacher` 模式下使用 with 指令时，Agent 应提示"with 系列仅 TL 模式可用，请先切换到 /asTL"
- as 模式切换不自动携带 with 指令

## 加载协议

Agent 检测到 as 系列触发词时：
1. 立即读取对应 `AS-*.md` 文件
2. 替换当前模式行为约束
3. 告知用户已切换到的模式
