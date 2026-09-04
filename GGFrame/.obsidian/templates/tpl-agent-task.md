---
type: template
id: TPL-AGENT-001
title: Agent 任务模板
aliases: [Agent Task Template]
domain: meta

tags:
  - type/template
  - agent/task
created: 2026-05-24
updated: 2026-05-24
---

# Agent 任务模板

当通过 AI Agent 执行任务时，使用此模板定义任务。与人类任务模板 (`tpl-task.md`) 的区别在于，本模板增加了 **角色绑定**、**上下文包**、**完成信号** 等 Agent 专属字段。

---

## Frontmatter 完整字段

```yaml
---
type: agent-task
agent_task_id: ""          # 唯一标识，格式 AT-YYYY-NNN
title: ""                  # 格式: [项目缩写]-[模块名]-[开发描述]，如 FMS-对账结算中心-初版开发
parent_task: ""            # 所属父任务 ID（可选）

# 项目归属
project: ""                # 项目注册表 key，如 fms-rear / fms-ui
module: ""                 # 业务模块名，如 对账结算中心 / 物料管理

# Agent 绑定
role_binding: ""           # Agent 扮演的角色 ID，如 ROLE-DEV-002
work_type: ""              # 对应的工作类型 ID，如 WT-DEV-001
process: ""                # 遵循的流程 ID，如 PROC-DEV-001

# 上下文
context_pack:
  required: []             # 必读文件列表（相对路径）
  optional: []             # 选读文件列表

# 输入输出
inputs: []                 # 输入物列表
outputs:                   # 输出物（分层管理）
  artifacts: []            # 产物工件列表（文档类），写入 A.目标体系/GOAL-XXX/产物/{任务序号}/
  code_files: []           # 代码文件列表，直接写入项目目录
  files_to_modify: []      # 需要修改的现有文件列表
acceptance_criteria: []    # 验收标准

# 完成信号
completion_signal:         # Agent 完成后的信号机制
  file: ""                 # 更新哪个文件的 frontmatter
  field: "status"          # 更新哪个字段
  value: "done"            # 更新为什么值

# 约束
timeout_minutes: 30        # 超时时间
max_iterations: 50         # 最大工具调用次数
retry_on_failure: true     # 失败后是否重试

# 元数据
priority: P1
estimated_hours: 0
tags:
  - type/agent-task
created: "{{date}}"
updated: "{{date}}"
---
```

---

## 正文结构

```markdown
# Agent Task: {标题}
<!-- 标题格式: [项目缩写]-[模块名]-[开发描述]，详见命名规范 -->

## 角色绑定

Agent 以 **[[{角色定义文件}]]** 的身份执行本任务。

### 角色约束
1. {权限边界1}
2. {权限边界2}

## 上下文包

### 必须加载
| 文件 | 用途 |
|------|------|
| [[{path}]] | {说明} |

### 可选加载
| 文件 | 用途 |
|------|------|
| [[{path}]] | {说明} |

## 任务描述

{清晰、可执行的任务描述，用 Agent 能理解的指令式语言}

## 进度跟踪

<!-- 使用 checkbox 跟踪各阶段/子任务进度 -->

### Phase 1: {阶段名}
- [ ] {具体交付项1}
- [ ] {具体交付项2}

### Phase 2: {阶段名}
- [ ] {具体交付项1}
- [ ] {具体交付项2}

> Agent 完成某个 Phase 的全部 checkbox 后，将对应项改为 `- [x]`。

## 执行步骤

1. {步骤1} → 产出: {产物}
2. {步骤2} → 产出: {产物}
...

## 输出交付方式 ⚠️ 关键约束

**Agent 必须将产出物直接写入目标文件路径，严禁将代码/文档内容以纯文本形式返回给主会话。**

- 代码（.java/.vue/.ts 等） → 使用 Write/Edit 工具直接写入项目对应源码目录
- 文档（技术方案、评审报告、API 文档等） → 写入 `A.目标体系/GOAL-XXX/产物/{任务序号}/`，按命名规范 `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-{角色}-{描述}.{扩展名}` 创建，使用 `tpl-artifact.md` 模板填写 frontmatter
- SQL 脚本（DDL/菜单/数据迁移等 .sql） → 直接写入项目 SQL 目录（查项目注册表 `sql_dir` 字段，如 `fms-sql/`），命名格式 `V{YYYYMMDD}_{动作}_{模块名/表名}.sql`（动作: `add`=增表 / `mod`=改表 / `del`=删表），不走产物工件系统
- 知识沉淀（可跨任务复用） → 写入 `知识沉淀/` 对应子目录
- 配置/脚本 → 直接写入项目对应目录
- 任务状态更新 → 直接编辑任务文件的 frontmatter（`status: done`）
- **禁止行为**：将大段代码/文档作为回复文本返回，让主会话代为写入

**产物 frontmatter 关键字段：**
- `status: in_review`（需人类审核的文档）或 `status: approved`（纯技术产物如 DDL）
- `sync_phase: task_done`（默认，任务完成后同步）或 `phase_done`（阶段完成后同步）

主会话只接收精简的**摘要汇报**（完成了什么、文件列表、阻塞项），不接收完整的产出物文本。
同步到项目由主会话执行，Agent 不自行同步。

## 输出规范

### 文件产出
| 类型 | 文件路径 | 模板 | 验收标准 |
|------|----------|------|----------|
| 产物工件 | `A.目标体系/{goal}/产物/{task_no}/[GOAL{NNN}]-[{task_no}-...]-ART-...` | `tpl-artifact.md` | {标准} |
| 代码文件 | `{项目路径}` | — | {标准} |

### 产物命名
格式: `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-{角色}-{描述}.{扩展名}`
详见 `配置与元数据/产物工件规范.md`

### 质量要求
1. {要求1}
2. {要求2}

## 完成信号

完成后，更新以下文件的 frontmatter：

\`\`\`yaml
# {路径}/{文件名}.md
status: done
completed: "{当前日期}"
\`\`\`

## 需求接收记录 ⚠️ 强制填写

> 此章节支持 asNormal 角色代理模式。注意：**原始需求已由秘书在任务文件的「派发记录」中记录**，Agent 无需重复。

Agent 在任务产出中只需记录以下**自己执行过程中产生的信息**（写入任务文件的「执行记录」章节或产物工件的「背景与需求」章节）：

### 关键决策
| 决策点 | 选择方案 | 理由 | 拒绝的替代方案 |
|--------|---------|------|---------------|
| {技术选型/架构取舍/接口设计} | {最终采用的方案} | {为什么选这个} | {考虑过但拒绝的方案及原因} |

### 偏离说明（如有）
{与原始计划不同的地方及原因 —— 没有偏离则不写}

### 产出清单
| 文件路径 | 类型 | 用途 | 状态 |
|----------|------|------|------|
| {绝对或相对路径} | {代码/文档/配置/DDL} | {一句话说明} | {完成/待审核/需补充} |
```

---

## 与人类任务模板的对比

| 维度 | 人类任务 (tpl-task) | Agent 任务 (tpl-agent-task) |
|------|-------------------|---------------------------|
| 执行者 | 人类 assignee | Agent role_binding |
| 依赖描述 | 文字描述 | context_pack 文件列表 |
| 验收标准 | 面向人类 | 面向 Agent（可自动校验） |
| 完成信号 | 手动更新 | 文件字段自动检测 |
| 超时 | 无 | 有硬性超时 |
| 角色约束 | 隐含 | 显式权限边界 |

---

## 编排模式

多个 Agent 任务可以按照流程定义的边 (Edge) 进行编排：

```
Agent Task A (完成) → completion_signal 触发 → 主会话检测 → 启动 Agent Task B
```

依赖关系通过 `parent_task` 和文件状态字段表达，主会话（秘书协调者）负责检测和推进。
