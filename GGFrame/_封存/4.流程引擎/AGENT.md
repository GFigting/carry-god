---
type: agent-guide
module: "流程引擎"
version: "1.0"
updated: "2026-05-24"
---

# 流程引擎 — Agent 使用指引

## 何时读取本板块

- Agent 需要执行多步骤任务，需要按照标准流程编排步骤时
- Agent 需要了解某个流程包含哪些节点、每个节点由什么角色执行时
- Agent 需要判断流程是串行还是并行执行时
- 人类指定了流程（如"按 PROC-需求到上线 流程走"），Agent 需要加载该流程定义时
- Agent 完成一个节点后，需要确定下一个节点是什么、由谁执行时
- Agent 被派发执行流程中某个特定节点时，需要确认该节点的输入/输出/检查清单

## 板块结构

```
4.流程引擎/
├── AGENT.md                     ← 本文件
├── 🔄_流程总览.md               ← 流程分类总表 + Dataview 列表
├── 开发流程/                    ← 4个流程
│   ├── PROC-需求到上线.md       ← 最完整 SDLC 流程，7节点 sequential
│   ├── PROC-代码审查流程.md     ← PR Review 标准步骤
│   ├── PROC-发布流程.md         ← 测试→生产发布步骤
│   └── PROC-紧急修复流程.md     ← Hotfix 加速通道
├── 运维流程/                    ← 1个流程（+ 待创建）
│   └── PROC-故障响应流程.md     ← 告警→恢复，强调时效性
├── 管理流程/                    ← 2个流程
│   ├── PROC-迭代规划流程.md     ← Sprint Planning 标准流程
│   └── PROC-Onboarding流程.md   ← 新人入职引导流程
└── 自动化流程/                  ← 1个流程
    └── PROC-信息收集与推送.md   ← 定时抓取→过滤→推送→归档
```

当前共 8 个已创建流程（更多流程待按需创建：变更审批、灾备切换、需求评审、CI/CD、自动测试）。

## 关键文件索引

| 文件 | 用途 | 读取优先级 |
|------|------|:--:|
| `🔄_流程总览.md` | 流程分类总表，包含 graph_type 和触发条件 | P0 |
| `开发流程/PROC-需求到上线.md` | 最常用的 SDLC 全流程，7 节点 sequential | P0（新功能开发时） |
| `开发流程/PROC-紧急修复流程.md` | Hotfix 加速通道，简化审批 | P0（线上故障时） |
| `开发流程/PROC-代码审查流程.md` | PR Review 标准步骤 | P0（代码审查时） |
| `开发流程/PROC-发布流程.md` | 测试环境到生产环境的发布步骤 | P1 |
| `运维流程/PROC-故障响应流程.md` | 告警到恢复的应急流程 | P0（告警触发时） |
| `管理流程/PROC-迭代规划流程.md` | Sprint Planning 标准流程 | P2 |
| `管理流程/PROC-Onboarding流程.md` | 新人入职引导流程 | P2 |
| `自动化流程/PROC-信息收集与推送.md` | 定时信息采集自动化流程 | P2 |

## 如何阅读流程的「Agent 编排映射」章节

每个流程文件的核心是 LangGraph 风格的节点（nodes）和边（edges）定义。Agent 应这样阅读：

### 1. 读取流程元信息（frontmatter）

```yaml
graph_type: "sequential"  # 最关键字段，决定编排模式
trigger: "触发条件说明"
estimated_duration: "预计耗时"
```

### 2. 解析 nodes（节点）

每个 node 定义了：
- `node_id`：节点唯一标识
- `role`：该节点由哪个角色执行（如 `[[ROLE-后端开发工程师]]`）
- `action`：该节点要完成的具体动作描述
- `input`：该节点需要的输入物
- `output`：该节点的产出物
- `checklist`：该节点必须通过的检查清单
- `timeout`：该节点的超时时间

**Agent 使用方式**：读取自己负责的 node，将 `action` 作为任务目标，`input` 作为前置条件检查，`output` 作为验收标准，`checklist` 加载对应检查清单文件。

### 3. 解析 edges（边）

每条 edge 定义了节点间的流转关系：
- `from` → `to`：固定流转方向
- `condition`：条件边（非空时需根据 from 节点的输出判断流向）

**Agent 使用方式**：完成当前节点后，根据 edges 确定下一个节点。当前节点是 `from` 时，下一节点是 `to`。

## graph_type 的含义和串行/并行判断

| graph_type | 含义 | Agent 编排方式 |
|-----------|------|---------------|
| `sequential` | 串行流程 | Agent 1 完成当前节点 → 确认结果 → 派发 Agent 2 执行下一节点 |
| `parallel` | 并行流程 | 同时启动多个 Agent，各自执行不同节点，全部完成后汇总 |
| `conditional` | 条件分支 | 根据当前 Agent 的输出决定走哪个分支（通过 edges 中的 condition 字段判断） |
| `loop` | 循环流程 | Agent 循环执行，直至满足退出条件（流程文件中会定义 loop_exit_condition） |

**Agent 编排协议**（来自根 CLAUDE.md）：
1. 查看流程的 `graph_type`
2. `sequential` → 串行：Agent 1 完成 → Agent 2 开始
3. `parallel` → 并行：同时启动多个 Agent
4. `conditional` → 根据上一个 Agent 的输出决定分支
5. `loop` → Agent 循环执行，直至满足退出条件

## 与其他板块的联动

- **角色体系**：流程的每个 node 绑定了一个或多个角色。Agent 读取流程后必须回到 `1.角色体系/` 加载对应角色的激活指令。
- **工作体系**：流程通常关联一个或多个工作类型。任务文件中的 `process` 字段指定了使用哪个流程。
- **任务系统**：流程被任务文件引用（frontmatter 的 `process` 字段）。流程的每个 node 可以对应一个 Agent 子任务文件。
- **通用能力层**：流程 node 的 `checklist` 字段引用了检查清单（`通用能力层/检查清单/`）。执行到对应 node 时必须加载。
- **导航系统**：`0.导航系统/📑_流程索引.md` 提供了流程的快速跳转列表。

## Agent 操作清单

1. **确定流程**：根据任务的工作类型或用户指定，从 `🔄_流程总览.md` 确定目标流程
2. **读取流程文件**：打开流程文件，重点阅读 frontmatter 的 `graph_type` 和 nodes/edges 定义
3. **理解编排模式**：根据 `graph_type` 确定是串行还是并行执行
4. **定位当前节点**：找到自己负责的 node，确认 `action`、`input`、`output`、`checklist`、`timeout`
5. **加载节点角色**：根据 node 的 `role` 字段，回到角色体系加载对应角色的激活指令
6. **加载检查清单**：根据 node 的 `checklist` 字段，加载对应的检查清单文件
7. **执行节点**：以绑定角色的身份完成 node 定义的动作
8. **推进流程**：完成当前节点后，根据 edges 确定下一节点的 `to`，通知主会话推进编排
9. **条件分支处理**：如果 edge 的 `condition` 非空，根据当前节点的输出判断走哪个分支
