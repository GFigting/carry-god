---
type: agent-guide
module: "模式指令"
version: "1.1"
updated: 2026-07-23
---

# 模式指令 — Agent 使用指引

## 何时读取本板块

- Agent 检测到用户输入 `/asTL`、`/asTeacher`、`/frameworkInit`、`/withPlan`、`/mgmtReport` 等触发词时
- Agent 需要了解当前激活了哪些 with 指令时
- TL 需要知道 with 指令的具体派发流程时
- 用户需要生成管理报告（日报/周报/月报/工时）时
- 用户询问"有哪些可用指令"时

用户要查看、比较或选择指令时，优先打开 `🏠_总览.md` 的「指令速查」和「指令使用明细」，不在回答中重新手工维护一份指令清单。

## 板块结构

```
角色体系/模式指令/
├── AGENT.md                     ← 本文件
├── 🎛️_指令总览.md               ← 全部指令一览 + Agent 加载协议（必读）
├── as系列/
│   ├── _AS-系列说明.md          ← as 系列共同约定
│   ├── AS-TL.md                ← /asTL 完整行为定义
│   └── AS-Teacher.md           ← /asTeacher 完整行为定义
├── fw系列/
│   ├── _FW-系列说明.md          ← fw 系列共同约定
│   ├── FW-FrameworkInit.md     ← /frameworkInit 完整行为定义
│   ├── FW-FrameworkClean.md    ← /frameworkClean 完整行为定义
│   └── FW-FrameworkRefresh.md  ← /frameworkRefresh 完整行为定义
├── with系列/
│   ├── _WITH-系列说明.md        ← with 系列共同约定
│   ├── WITH-Plan.md            ← /withPlan 完整行为定义
│   ├── WITH-Test.md            ← /withTest 完整行为定义 + subAgent prompt 模板
│   └── WITH-Mock.md            ← /withMock 完整行为定义 + subAgent prompt 模板
└── mgmt系列/
    ├── _MGMT-系列说明.md        ← mgmt 系列共同约定
    ├── MGMT-Report.md          ← /mgmtReport 周期性报告生成
    ├── MGMT-Estimate.md        ← /mgmtEstimate 工时估算汇总
    └── MGMT-模板.md            ← 用户自定义管理指令模板
```

## Agent 操作清单

1. **检测触发词**：在用户输入中检测 as/fw/with/mgmt 系列触发词及自然语言别名
2. **读取指令定义**：立即 Read 对应的指令定义文件（渐进式加载，不预读）
3. **模式检查**：fw 系列需 Teacher 模式，with 系列需 TL 模式，mgmt 系列无需检查
4. **加载上下文**：按指令文件中的「上下文加载」或「数据源」清单加载关联文件
5. **叠加约束**（as/with 系列）：将指令的行为约束合并到当前会话规则
6. **执行流程**（fw/mgmt 系列）：按指令文件中的 Phase 流程逐步执行
7. **派发 subAgent**（with 系列）：按指令文件中的 prompt 模板构建并派发
8. **记录派发**：在任务文件中记录派发决策

## 人用摘要元数据协议

每个正式模式指令文件都必须在 frontmatter 维护以下字段，作为人用总览的唯一数据来源：

| 字段 | 用途 | 写法要求 |
|------|------|---------|
| `overview` | 是否进入总览 | 正式指令设为 `true`；模板设为 `false` |
| `overview_order` | 跨系列稳定排序 | as 用 10–99，fw 用 110–199，with 用 210–399，mgmt 用 410–499 |
| `summary` | 一句话说明 | 说明“解决什么问题”，不复述文件标题 |
| `when_to_use` | 使用时机 | 从人的场景出发，说明什么时候值得触发 |
| `result` | 执行结果 | 说明执行后新增、修改或生成什么 |
| `caution` | 关键边界 | 只保留最重要的模式、权限、确认或数据风险 |

维护规则：

1. 新增正式指令时先补齐上述字段，保存后会自动出现在总览及对应系列说明中。
2. 指令行为变化时，正文与摘要元数据必须在同一次修改中同步。
3. `🏠_总览.md` 和各 `_系列说明.md` 只写 Dataview 查询，不手工复制指令摘要表；`🎛️_指令总览.md` 只保留入口和 Agent 加载协议。
4. 摘要用于人类选择指令，不能替代正文中的完整行为契约和 Agent 渐进式加载。

## 关键原则

- **渐进式加载**：不要在启动时预读任何指令文件。只在检测到触发词时才加载。
- **索引优先**：`🎛️_指令总览.md` 是唯一需要在启动时了解的文件（通过 CLAUDE.md 中的索引表）
- **指令即契约**：每个指令文件是完整的、自包含的行为契约，Agent 读取后必须严格遵守其中的「行为约束」
- **with 仅 TL**：with 指令在 Teacher 模式下不生效
- **fw 仅 Teacher**：fw 指令在 TL 模式下不生效
- **mgmt 通用**：mgmt 指令在 TL 和 Teacher 模式下均可用，无需模式检查
