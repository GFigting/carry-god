---
type: mode_instruction
series: with
overview: true
overview_order: 290
summary: "分析 IMPORTANT TODO，补全关键业务全流程注释并穿透一层直接依赖。"
when_to_use: "源码中存在待分析的重要逻辑标记，需要把临时 TODO 转为稳定说明时。"
result: "注释直接写入源码，已分析标记转为 IMPORTANT，并验证 TODO 零残留。"
caution: "仅 TL 模式；必须先完成数据流分析，不能机械替换标记或凭空补业务结论。"
trigger: /withAnnotate
aliases: [分析标记, 注释补全, 分析IMPORTANT, 分析TODO标记]
scope: tl_only
priority: 3
version: "1.0"
created: 2026-07-07
updated: 2026-07-23
---

# /withAnnotate — IMPORTANT TODO 分析与注释补全

## 触发

- `/withAnnotate` — 显式触发，扫描并分析项目中所有 `/** IMPORTANT TODO */` 标记
- `/withAnnotate {文件路径}` — 限定分析范围到指定文件或目录（如 `/withAnnotate src/main/java/com/xxx/biz/`）
- 自然语言别名：`分析标记`、`注释补全`、`分析IMPORTANT`、`分析TODO标记`

## 适用范围

**仅 TL 模式可用**。若当前为 Teacher 模式，提示用户先执行 `/asTL`。

## 目的

响应人工标记的 `/** IMPORTANT TODO */`，对不理解的方法进行全流程分析：分析方法的数据来源和处理步骤，生成全流程注释，穿透分析直接依赖的方法，最终将所有 `/** IMPORTANT TODO */` 转换为 `/** IMPORTANT */`——实现代码中零残留。

## 核心原则

- **穿透分析**：分析一个方法时，如果它直接调用的其他方法也满足"重要判定规则"但缺少注释，一并生成注释
- **标记收敛**：分析完成后所有 `/** IMPORTANT TODO */` → `/** IMPORTANT */`
- **零残留目标**：每次触发必须扫描到没有任何 `/** IMPORTANT TODO */` 为止
- **只补不全不改**：生成新注释，不修改已有注释中的人工内容，不修改业务代码

---

## 执行流程

```
TL 触发 /withAnnotate [可选：限定文件路径]
    │
    ├── Step 1 — 扫描标记
    │   使用 Grep 搜索项目中所有 `/** IMPORTANT TODO */`
    │   输出：文件路径 + 行号 + 所在方法签名
    │   若无标记 → "项目中无 IMPORTANT TODO 标记" → 流程结束
    │
    ├── Step 2 — 逐个分析（对每个标记的方法）
    │   - 读取方法完整代码
    │   - 识别数据来源：查了哪些表 / 调了哪些 API / 用了哪些参数
    │   - 识别处理步骤：数据经过了哪些转换、校验、持久化操作
    │   - 按 UTIL-代码注释规范 层级 2 格式生成全流程注释
    │   - 按层级 1 补齐 @param/@return（如果缺失）
    │
    ├── Step 3 — 穿透分析（从标记方法出发，一层深度）
    │   对当前方法体内直接调用的方法：
    │   - 对照"重要方法判定规则"（R1-R8）判定
    │   - 若满足判定且缺少全流程注释 → 生成注释 + 添加 `/** IMPORTANT */`
    │   - 若已有 `/** IMPORTANT */` 但缺少注释 → 补充注释
    │   - 若已有完整注释 → 跳过
    │   口头报告：「方法 A 的分析发现 B、C 也是重要方法，已穿透补充注释」
    │
    ├── Step 4 — 转换标记
    │   所有分析完成的 `/** IMPORTANT TODO */` → `/** IMPORTANT */`
    │   保留已生成的全流程注释不变，仅改标记行
    │
    └── Step 5 — 验证零残留
        再次 Grep 扫描确认项目中无 `/** IMPORTANT TODO */`
        口头报告：「已分析 N 个标记方法，穿透补充 M 个方法，IMPORTANT TODO 标记已全部转换为 IMPORTANT」
```

---

## 行为约束

### Agent 必须做

- 扫描项目中所有 `/** IMPORTANT TODO */` 标记（使用 Grep 工具）
- 对每个标记生成全流程注释（按 `UTIL-代码注释规范.md` 层级 2 格式）
- 补齐缺失的标准 JavaDoc（层级 1）
- 穿透分析直接依赖方法（一层深度，不含间接调用）
- 将所有分析完成的 `/** IMPORTANT TODO */` 改为 `/** IMPORTANT */`
- 验证零残留

### Agent 禁止做

- 不得修改已有注释中人工编写的内容（只补全新注释，不重写）
- 不得删除与 IMPORTANT 无关的普通 `// TODO` 注释
- 不得修改业务代码（只写注释和标记）
- 不得在 Teacher 模式下使用

---

## 穿透分析详解

### 动机

人工标记某个方法为 `/** IMPORTANT TODO */`，通常意味着对该方法所处的**整个处理链路**不理解。如果只分析被标记方法的注释，人类审核者看完后会立刻追问它调用的 B、C 方法。一次穿透补齐可以减少反复标记的来回。

### 穿透边界

| 追踪 | 不追踪 |
|------|--------|
| `this.methodB()` — 本类方法调用 | B 方法内部调用的 D 方法（间接依赖） |
| `xxxService.methodC()` — 注入的 Service 调用 | MQ 消费者 / 定时任务触发的方法 |
| `xxxMapper.methodD()` — Mapper 调用（仅限复杂查询） | 框架/工具类方法（如 `BeanUtil.copy`、`StrUtil.format`） |
| 同一次触发中已分析的方法 → 跳过 | 已标记 `/** IMPORTANT */` + 有完整注释的方法 → 跳过 |

### 穿透停止条件

- 依赖方法的代码在当前项目不可见（如 jar 包中的类）
- 依赖方法不满足 R1-R8 任一判定规则
- 依赖方法已有完整的全流程注释 + `/** IMPORTANT */`
- 已达到一层深度边界

---

## 产物

无独立产物文件。注释直接写入源代码（使用 Edit 工具）。

---

## 与其他指令的交互

- **+ `/withCheck`**：`/withCheck` 的维度 6.4 会检查 IMPORTANT TODO 残留并口头提醒。建议执行顺序：`/withAnnotate` → `/withCheck`
- **+ `/withFinish`**：`/withFinish` 步骤 4 会扫描维度标签并口头提醒 IMPORTANT TODO 残留，但不阻断完成流程。建议在 `/withFinish` 前先执行 `/withAnnotate`
- **TL 自动感知**：TL 在日常编码中读到 `/** IMPORTANT TODO */` 时口头提醒，但不自动执行分析——由用户决定何时触发 `/withAnnotate`

## 上下文加载

- 必读：`通用能力层/工具手册/UTIL-代码注释规范.md`（注释格式 + 重要方法判定规则 R1-R8）
- 参考：项目源代码（被标记的方法及其依赖方法）
