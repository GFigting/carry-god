---
type: mode_series_guide
series: fw
version: "1.1"
updated: 2026-07-23
---

# fw 系列 — 框架管理指令

## 系列约定

fw 系列指令是**框架自身的维护工具**——它们不参与开发任务，只管理框架的数据和配置。核心特征：

| 特性 | 约定 |
|------|------|
| **独立触发** | 每个 fw 指令是一次性操作，执行完毕后返回当前模式 |
| **仅 Teacher 模式** | 在 `/asTL` 模式下不可用 |
| **非互斥** | fw 指令之间不互斥，但不叠加（每次触发独立执行） |
| **不切模式** | 执行 fw 指令不改变当前 as 模式 |
| **dream 特殊** | `dream` 是对话式指令，无固定 Phase 流程，鼓励发散讨论 |

## 可用指令

```dataview
TABLE WITHOUT ID
  file.link AS "指令定义",
  trigger AS "主触发词",
  summary AS "说明",
  caution AS "关键边界"
FROM "角色体系/模式指令/fw系列"
WHERE overview = true AND series = "fw"
SORT overview_order ASC
```

## 触发规则

1. 用户输入 fw 系列触发词 → 检查当前模式
2. 若为 Teacher 模式 → 读取对应 `FW-*.md`，执行定义流程
3. 若为 TL 模式 → 提示用户先执行 `/asTeacher`
4. 执行完毕后，Agent 保持当前 as 模式，不切换

## 与 as 系列的关系

- fw 系列**仅当当前模式为 `/asTeacher` 时**可用
- 执行 fw 指令不改变当前 as 模式
- `/frameworkInit` 在 Phase 2 可触发 `/frameworkClean`
- `/frameworkClean` 完成后可建议用户执行 `/frameworkInit`

## 加载协议

Agent 检测到 fw 系列触发词时：
1. 检查当前模式是否为 Teacher——若不是，提示用户
2. 立即读取对应 `FW-*.md` 文件
3. 按指令文件中的 Phase 流程逐步执行
4. 执行完毕后报告结果
