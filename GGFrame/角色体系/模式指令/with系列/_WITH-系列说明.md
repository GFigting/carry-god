---
type: mode_series_guide
series: with
version: "1.5"
updated: 2026-07-23
---

# with 系列 — 行为增强指令

## 系列约定

with 系列指令是 TL 模式的**行为增强器**——它们不切换模式，而是在 TL 模式上叠加额外的行为约束。核心特征：

| 特性 | 约定 |
|------|------|
| **可叠加** | 可以同时启用多个 with 指令（如 `/withGo /withPlan /withTest`） |
| **仅 TL 模式** | 在 `/asTeacher` 模式下不可用 |
| **任务级作用域** | 每个 with 指令的作用域是当前任务会话，新任务需重新声明 |
| **产物统一** | with 指令生成的非代码产物统一写入 `A.目标体系/GOAL-XXX/产物/{任务序号}/`；源码和项目 SQL 按项目规范直接入项目目录 |

## 可用指令

```dataview
TABLE WITHOUT ID
  file.link AS "指令定义",
  trigger AS "主触发词",
  summary AS "说明",
  caution AS "关键边界"
FROM "角色体系/模式指令/with系列"
WHERE overview = true AND series = "with"
SORT overview_order ASC
```

## 叠加规则

1. 多个 with 指令可以同时激活，效果叠加
2. 叠加时有依赖关系的按逻辑顺序执行（如 `/withGo` 先于 `/withPlan`，`/withTest` 依赖 `/withPlan` 的产物）
3. with 指令在用户显式取消前持续有效（同一任务会话内）

## 与 as 系列的关系

- with 系列**仅当当前模式为 `/asTL` 时**有效
- 切换到 `/asTeacher` 后 with 指令自动挂起（不删除，但不在教学模式执行）
- 切回 `/asTL` 后，with 指令**不会**自动恢复——用户需重新声明
- 用户可一次性同时声明模式和增强：`/asTL /withGo /withPlan /withTest`

## 加载协议

Agent 检测到 with 系列触发词时：
1. 检查当前模式是否为 TL——若不是，提示用户
2. 立即读取对应 `WITH-*.md` 文件
3. 将行为约束叠加到当前 TL 行为上
4. 若有多个 with 指令，按声明顺序加载

## 产物命名空间

所有 with 指令的 subAgent 产物统一命名：

| 指令 | 产物命名 | 角色前缀 |
|------|---------|---------|
| `/withGo` | 直接维护 `A.目标体系/目标总览.md` 中既有 Goal 的当前子目标；通常无独立产物 | TL |
| `/withRequirement` | 直接登记到 `A.目标体系/目标总览.md` 中既有 Goal；无独立产物 | TL |
| `/withPlan` | `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-TL-实施计划.md` | TL |
| `/withReview` | `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-CR-计划审核报告.md` | CR |
| `/withTest` | `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-测试计划.md` | QA |
| `/withMock` | `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-测试数据.sql` | QA |
| `/withAnnotate` | 注释直接写入源码（无独立产物文件） | TL |
| `/withFinish` | 知识归档 + 质量检查报告 + Git commit + 工作记录更新 | TL/QA |
