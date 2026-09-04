---
type: agent-guide
module: "任务系统"
version: "1.0"
updated: "2026-05-24"
---

# 任务系统 — Agent 使用指引

## 何时读取本板块

- Agent 需要创建新任务文件时
- Agent 需要了解任务状态机，更新任务状态时
- Agent 完成任务后需要标记 `status: done` 时
- Agent 需要查看当前活跃任务、阻塞任务或待审核任务时
- Agent 被派发执行后台任务，需要读取任务文件内容时
- 人类要求查看任务控制台概览时

## 板块结构

```
任务系统/
├── AGENT.md                   ← 本文件
├── 📌_任务控制台.md           ← 任务看板（活跃/待审核/近期完成）+ 模板链接
├── 任务状态机.md              ← 完整状态转换规则
├── 阻塞任务清单.md            ← 当前阻塞任务 + 升级原则
└── 任务模板/                  ← 按场景分类的任务模板
    ├── task-feature.md        ← 功能开发任务
    ├── task-bugfix.md         ← Bug修复任务
    ├── task-incident.md       ← 事件处理任务
    └── task-research.md       ← 调研任务
```

> **注意**：任务文件（`TASK-YYYY-NNN.md`）现在存放于 `A.目标体系/GOAL-XXX/关联任务/` 下，与所属目标物理接近。`进行中/` 和 `任务归档/` 目录已废弃。

## 关键文件索引

| 文件 | 用途 | 读取优先级 |
|------|------|:--:|
| `任务状态机.md` | 9 个状态的全部转换规则、触发条件和操作者 | P0 |
| `📌_任务控制台.md` | 任务看板总入口、模板选择指南 | P0 |
| `任务模板/task-feature.md` | 功能开发任务模板，用于 WT-新功能开发 | P1 |
| `任务模板/task-bugfix.md` | Bug修复任务模板，用于 WT-Bug修复 | P1 |
| `任务模板/task-incident.md` | 事件处理任务模板，用于 WT-故障响应 | P1 |
| `任务模板/task-research.md` | 调研任务模板，用于 WT-技术调研/WT-POC验证 | P2 |
| `阻塞任务清单.md` | 当前阻塞任务汇总和升级原则 | P2 |
| `进行中/TASK-*.md` | 具体任务文件（Agent 被派发后读取） | P0（执行时，路径：`A.目标体系/GOAL-XXX/关联任务/`） |

## 任务模板选择

Agent 创建任务时，根据工作类型选择模板：

| 工作类型场景 | 使用模板 | 对应模板文件 |
|-------------|---------|-------------|
| 新功能开发、代码重构、技术债清偿 | 功能开发模板 | `任务模板/task-feature.md` |
| Bug修复 | Bug修复模板 | `任务模板/task-bugfix.md` |
| 故障响应、线上事故 | 事件处理模板 | `任务模板/task-incident.md` |
| 技术调研、竞品分析、POC验证 | 调研模板 | `任务模板/task-research.md` |
| 其他通用场景 | Agent 任务模板 | `.obsidian/templates/tpl-agent-task.md` |

**Agent 任务 vs 人类任务**：
- `tpl-task`（通用任务模板）：人类主导的任务，在 Obsidian 中使用
- `tpl-agent-task`（Agent 任务模板）：AI Agent 在后台独立执行的任务，完成后自动更新 `status: done`

Agent 被派发后台任务时，默认使用 `tpl-agent-task` 模板。

## 任务状态机说明

完整状态图见 `任务状态机.md`，9 个状态：

```
draft → ready → assigned → in_progress → under_review → done → archived
                in_progress → blocked → in_progress (或 cancelled)
                under_review → revision → under_review
```

**Agent 只需关注以下核心状态转换**：

1. **开始执行**：`assigned` → `in_progress`（Agent 接手任务时）
2. **遇到阻塞**：`in_progress` → `blocked`（必须在任务文件中注明阻塞原因和解除条件）
3. **提交审查**：`in_progress` → `under_review`（产出物完成，提交人类审核）
4. **标记完成**：`under_review` → `done`（审核通过）或 `under_review` → `revision`（审核不通过需返工）
5. **取消任务**：任意非终态 → `cancelled`（仅 PM 操作）

**关键区别**：
- `revision`：质量不达标需要修改（内因），正常的审核回路
- `blocked`：遇到外部依赖无法继续（外因），必须写明阻塞原因和解除条件

## 如何创建任务文件

Agent 创建任务文件的标准步骤：

0. **确定所属 Goal**：根据当前工作上下文确定任务所属的 Goal，记录其 `GOAL-XXX` 目录路径
1. **确定编号**：扫描 `A.目标体系/GOAL-{NNN}/关联任务/` 下最大任务序号，新任务序号 = max + 1
2. **选择模板**：根据工作类型从上方对照表选择模板
3. **创建文件**：在 `A.目标体系/GOAL-XXX/关联任务/` 下创建 `[GOAL{NNN}]-[{序号}]-TASK-{描述}.md`
4. **填写 frontmatter**：
   ```yaml
   ---
   type: task
   task_id: "TASK-2026-NNN"
   title: "{任务标题}"
   status: in_progress
   work_type: "WT-{工作类型}"
   process: "PROC-{关联流程}"
   creator: "zhuangjl"
   assignee: "zhuangjl"
   priority: P1/P2/P3
   tags:
     - type/task
     - status/in_progress
     - work/{分类}
     - priority/p{级别}
   created: "YYYY-MM-DD"
   updated: "YYYY-MM-DD"
   completed: ""
   ---
   ```
5. **子任务命名**：
   - 子任务：`[GOAL{NNN}]-[{序号}.{子序号}]-TASK-{描述}.md`
   - 示例：`[GOAL101]-[01.01]-TASK-后端接口开发.md`

## 如何更新任务状态

Agent 更新任务状态时，修改任务文件 frontmatter 中的对应字段：

```yaml
# 标记进行中
status: in_progress
updated: "2026-05-24"

# 标记阻塞（必须同时在正文记录阻塞原因）
status: blocked
updated: "2026-05-24"

# 标记完成（Agent 完成信号）
status: done
completed: "2026-05-24"
updated: "2026-05-24"
```

**Agent 完成信号约定**（来自根 CLAUDE.md）：
- Agent 完成任务后必须更新任务文件 frontmatter：`status: done` 和 `completed: "YYYY-MM-DD"`
- 主会话通过监控任务文件的变化来接收完成通知，推进编排

## 任务控制台的使用

`📌_任务控制台.md` 是任务管理的总入口，包含多个 Dataview 查询块：
- **我的待办**：按优先级排列的活跃任务
- **待我审核**：状态为 `under_review` 的任务
- **全部活跃任务**：所有非归档任务
- **近期完成**：最近 10 个已完成任务
- **任务模板**：创建新任务的模板选择

Agent 在需要概览当前任务全景时读取此文件，跳过 Dataview 查询块，重点关注模板选择指南和状态机链接。

## 与其他板块的联动

- **工作体系**：任务文件的 `work_type` 字段直接引用工作类型定义，决定使用哪个任务模板和 context_pack
- **流程引擎**：任务文件的 `process` 字段引用流程定义，决定 Agent 编排的顺序和节点
- **角色体系**：任务的 `assignee` 和角色绑定决定 Agent 以什么身份执行
- **日志与追踪**：任务完成后可选择性在日报/周报中记录
- **知识沉淀**：任务完成后的关键产出（技术方案、故障复盘）应归档到知识库
- **配置与元数据**：任务文件的标签必须遵循 `配置与元数据/标签体系.md` 的规范

## Agent 操作清单

1. **创建任务**：确定编号 → 选择模板 → 创建文件 → 填写 frontmatter（含 work_type、process、tags）
2. **开始执行**：更新 `status: in_progress`，记录 `updated` 时间
3. **执行工作**：按 context_pack 加载上下文，执行具体工作步骤
4. **遇到阻塞**：更新 `status: blocked`，在任务正文中记录阻塞原因和解除条件
5. **提交审查**：产出物完成后更新 `status: under_review`
6. **审核通过**：更新 `status: done` + `completed: "YYYY-MM-DD"`（Agent 完成信号）
7. **审核不通过**：更新 `status: revision`，根据审核意见修改后回到步骤 5
