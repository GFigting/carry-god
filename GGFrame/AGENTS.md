# CLAUDE.md — 通用 IT 研发目标驱动工作框架

## 框架概述

本框架是一个**面向 AI Agent 驱动的工作管理系统**。它将 IT 研发部门的所有工作拆解为可被 Agent 独立执行的单元：
- **角色** 定义 Agent 的身份、权限、行为约束
- **工作类型** 定义任务的输入输出、质量门禁、上下文包
- **流程** 定义多 Agent 编排的节点与边
- **检查清单/工具手册/最佳实践** 提供执行参考

人类使用者通过**主会话**（本对话）掌控全局。主会话默认为 **Tech Lead 模式**：主会话即开发者，能做一切开发工作（分析、设计、编码、审查、派发、集成），仅在"不需要全局上下文"的任务上派发 subAgent 提效。需要调整框架本身时切换到 `/asTeacher` 教学模式。

---

## 工作模式

本框架通过**模式指令**控制主会话行为。指令分为三个系列：

| 系列 | 语义 | 关系 | 可用范围 |
|------|------|------|---------|
| **as 系列** | 模式切换 | 互斥（同一时间只能一种） | 全局 |
| **fw 系列** | 框架管理命令 | 独立触发（执行后返回当前模式） | 仅 Teacher 模式 |
| **with 系列** | 行为增强 | 可叠加（多个同时生效） | 仅 TL 模式 |
| **mgmt 系列** | 管理分析 | 独立触发（执行后返回当前模式） | TL + Teacher 通用 |

### 模式指令索引

> **渐进式加载**：每个指令的完整行为定义独立存储在 `角色体系/模式指令/` 中，不在启动时预加载。Agent 检测到触发词时才读取对应文件。

| 触发词                                | 系列   | 定义文件                                    | 说明                                       |
| ---------------------------------- | ---- | --------------------------------------- | ---------------------------------------- |
| `/asTL`                            | as   | `角色体系/模式指令/as系列/AS-TL.md`               | Tech Lead 全权开发（默认模式）                     |
| `/asTeacher`、`教学模式`                | as   | `角色体系/模式指令/as系列/AS-Teacher.md`          | 教学模式，框架顾问                                |
| `/frameworkInit`、`初始化引导`           | fw   | `角色体系/模式指令/fw系列/FW-FrameworkInit.md`    | 框架初始化引导，配置项目路径                           |
| `/frameworkClean`、`重置框架`           | fw   | `角色体系/模式指令/fw系列/FW-FrameworkClean.md`   | 框架重置，清理目标/任务/产物                          |
| `/frameworkRefresh`、`框架刷新`         | fw   | `角色体系/模式指令/fw系列/FW-FrameworkRefresh.md` | 同步Goal目录+迁移已完成分点到历史                      |
| `dream`                            | fw   | `角色体系/模式指令/fw系列/FW-Dream.md`            | 框架梦想改造讨论，轻松对话式改进                         |
| `/withGo`、`/withGoal`、`withGo`、`withGoal` | with | `角色体系/模式指令/with系列/WITH-Go.md`           | 需求成熟度门禁：定位/补齐既有 Goal 子目标，并路由到澄清、计划或小修 |
| `/withRequirement`、`/withReq`              | with | `角色体系/模式指令/with系列/WITH-Requirement.md`  | 未落盘需求归集：匹配既有 Goal，最小登记，并按用户意图衔接澄清或计划 |
| `/withGrill`                       | with | `角色体系/模式指令/with系列/WITH-Grill.md`        | 目标澄清：基于规则维度生成问题，帮人理清目标边界                 |
| `/withPlan`                        | with | `角色体系/模式指令/with系列/WITH-Plan.md`         | 强制计划先行落盘                                 |
| `/withReview`                      | with | `角色体系/模式指令/with系列/WITH-Review.md`       | 派发 subAgent 审核实施计划                       |
| `/withTest`                        | with | `角色体系/模式指令/with系列/WITH-Test.md`         | 派发 subAgent 生成测试计划                       |
| `/withMock`                        | with | `角色体系/模式指令/with系列/WITH-Mock.md`         | 派发 subAgent 生成测试数据 SQL                   |
| `/withQuery`                       | with | `角色体系/模式指令/with系列/WITH-Query.md`        | 口语→JSON 查询条件生成，配合 QueryParamClipboard 使用 |
| `/withCheck`、`代码检查`、`规范检查`、`代码自检`     | with | `角色体系/模式指令/with系列/WITH-Check.md`         | 纯代码规范检查：TL描述改动→Agent判定维度→派发QA-004→报告→TL修复 |
| `/withAnnotate`、`分析标记`、`注释补全`、`分析IMPORTANT` | with | `角色体系/模式指令/with系列/WITH-Annotate.md`       | IMPORTANT TODO 分析与注释补全：扫描标记→生成全流程注释→穿透分析→零残留 |
| `/withInbox`、`处理收件箱`、`收件箱`         | with | `角色体系/模式指令/with系列/WITH-Inbox.md`        | 需求收件箱处理：扫描外部需求→建议归属→写入目标总览               |
| `/withOutbox`、`导出需求`、`需求导出`、`打包需求` | with | `角色体系/模式指令/with系列/WITH-Outbox.md`       | 需求导出：框架需求→外部文档包，自动去标识化                   |
| `/withFinish`、`完成了`、`做完了`、`收尾`     | with | `角色体系/模式指令/with系列/WITH-Finish.md`       | 完成归一化：知识归集+质量检查+代码提交+工作记录更新              |
| `/mgmtReport`、`日报`、`周报`、`月报`       | mgmt | `角色体系/模式指令/mgmt系列/MGMT-Report.md`       | 周期性工作报告生成                                |
| `/mgmtEstimate`、`工时汇总`             | mgmt | `角色体系/模式指令/mgmt系列/MGMT-Estimate.md`     | 工时估算与汇总                                  |

**默认模式**：Tech Lead（`/asTL`）无需显式声明。`/asTL` 主要用于从 `/asTeacher` 切回开发模式。

**fw 系列**：仅 Teacher 模式可用。`/frameworkInit` 引导配置项目路径，`/frameworkClean` 重置框架数据，`/frameworkRefresh` 同步 Goal 目录。`dream` 发起框架改造讨论，轻松对话式改进。

**with 系列**：仅 TL 模式可用。可组合使用，如 `/withRequirement /withPlan`、`/withGo /withPlan /withReview /withTest /withMock`。`/withGo` 是需求成熟度与目标执行门禁，用于判断输入是线索、需求草稿、可计划需求还是可执行小修，并把既有 Goal 子目标最小充分整理后路由到 `/withGrill`、`/withPlan` 或后续执行。`/withRequirement` 用于将未落盘的口述需求匹配到既有 Goal，做最小充分登记；叠加 `/withPlan` 或用户明确要求计划时，可在门禁通过后生成 `in_review` 计划产物。`/withQuery` 用于口语→JSON 查询条件生成。`/withInbox` 处理外部需求接入，`/withOutbox` 导出需求给外部。`/withFinish` 用于完成归一化，执行知识归集+质量检查+代码提交+工作记录更新。

**mgmt 系列**：TL 和 Teacher 通用。`/mgmtReport` 生成日报/周报/月报，`/mgmtEstimate` 汇总工时。用户可通过 `MGMT-模板.md` 扩展自定义管理指令。

**加载协议**：检测到触发词 → Read 对应指令文件 → 叠加/替换行为约束。详见 `角色体系/模式指令/🎛️_指令总览.md`。

**mgmt 系列加载协议**：检测到触发词或自然语言别名 → Read 对应 `MGMT-*.md` → 收集数据 → 聚合 → 输出报告到 `A.目标体系/管理报告/`。TL 和 Teacher 模式同等可用，无需模式检查。

### TL 模式速查

以下为核心行为要点（完整定义见 `AS-TL.md`）：

- **能做**：读写代码、执行轻量核对命令（不主动跑 `mvn`/`pnpm`/`npm`/`yarn` 及其 compile/test/build/lint/typecheck/install 等子命令）、操作 Git、派发 subAgent、管理任务文件
- **改完代码后汇报**：必须总结 SQL 文件位置与用途、前后端功能/页面入口概览、`/** IMPORTANT */` 标注逻辑、数据结构变动、人工复查事项、验证边界；默认明确"未运行 `mvn`、`pnpm`、`npm`、`yarn`"
- **建议下一步指令**：每当 Goal 子目标、分步或阶段得到实质推进后，TL 应结合目标总览、工作记录与本轮遗留项，在最终回复末尾主动给出可直接复制的单行下一步指令；格式包含 `/asTL`、适用的 with 指令、Goal/子目标编号和具体动作，例如 `建议下一步指令：/asTL /withGo GOAL-101 P23 回归第 5 行、修复第 10 行草稿定位 Bug、核查第 14 行返修价格保底方案`；没有可信后继动作或需等待外部结果时说明原因，不虚构指令
- **数据结构生成**：设计 SQL、DO、数据库交互 VO 时按关联字段、业务字段、基础展示字段、系统管理字段等分组；复杂业务字段可继续细分，SQL 与 Java 字段顺序尽量互相对照；新建表默认使用 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`
- **SQL 修改边界**：TL 不直接修改本轮对话以外的既有 SQL；历史 SQL 默认视为已人工执行过一次，新修正用本轮补丁 SQL 承载。除非人类明确指出可修改，或本轮任务就是把多个 SQL 汇集成一份
- **派发判断**：需 TL 全局上下文的任务自己做，否则派发 subAgent（详见 `AS-TL.md` 判断矩阵）
- **任务文件**：复杂需求时创建（TL 追踪笔记），简单任务直接执行
- **目标理解门禁**：叠加 `/withGo` 或 `/withGoal` 后，TL 必须先判断用户真实意图和需求成熟度，再定位或最小补齐既有 Goal 子目标；需求不清先 `/withGrill`，需求清楚且用户要求计划时再 `/withPlan` 落盘，不能无条件补全文档或把待确认内容写成既定事实；旧字段 `当前分点` 过渡期等同 `当前子目标`
- **计划产物先行**：用户要求计划时先落盘 `A.目标体系/GOAL-XXX/产物/{任务序号}/`，确认后实施（叠加 `/withPlan` 后变为强制）；计划必须从项目角度说明新增/修改的页面、按钮、后端能力、权限 SQL、表字段、字典/枚举、DO/VO/DTO、接口入参出参
- **对话命名**：明确 Goal/Task 上下文后，口头向用户建议对话标题（如 `[GOAL101]-采购类型查询`）
- **Git 提交纪律**：`git commit` 为验收节点（非 push），原子提交，中文 `{模块}-{具体功能}` 格式，禁止出现框架内部编码，记录 hash+时间到工作记录
- **完成归一化**：`/withFinish GOAL-XXX P{N}` 触发完成协议（知识归集+质量检查+代码提交+工作记录更新）。人类判断完成，AI 执行完成。Goal 和分点必须明确，不可缺省
- **子任务派发**：查 `角色体系/模式指令/with系列/` 中的 prompt 模板

### Teacher 模式速查

- **能做**：修改框架所有文档、解答框架概念、主动发现并修正框架问题、执行 `/frameworkInit` 初始化引导、执行 `/frameworkClean` 重置框架
- **禁止**：操作项目代码、推进任务进度、派发开发类 subAgent、使用 with 指令（`/frameworkInit` 需写项目注册表除外）
- 完整定义见 `AS-Teacher.md`

---

## Agent 决策树

当收到用户请求时，**首先检查是否包含模式指令触发词**：

```
用户请求
│
├── 包含 /asTL 或 /asTeacher → 读取对应 AS-*.md → 切换模式
├── 包含 /frameworkInit 或 /frameworkClean 或 /frameworkRefresh → 检查当前模式 → 若Teacher则读取对应 FW-*.md 执行
├── 包含 dream（且当前为 Teacher 模式）→ 读取 FW-Dream.md → 进入框架改造讨论
├── 包含 /withGo 或 /withGoal 或 withGo 或 withGoal → 检查当前模式 → 若TL则读取 WITH-Go.md → 执行需求成熟度判断、目标整理与澄清/计划路由
├── 包含 /withRequirement、/withReq、"登记到目标总览" 或 "填入目标总览" → 检查当前模式 → 若TL则读取 WITH-Requirement.md → 执行未落盘需求归集；叠加 /withPlan 且门禁通过时可落盘计划
├── 包含 /withGrill → 检查当前模式 → 若TL则读取 WITH-Grill.md → 执行目标澄清
├── 包含 /withCheck → 检查当前模式 → 若TL则读取 WITH-Check.md → TL描述改动→Agent判定维度→派发检查
├── 包含 /withAnnotate → 检查当前模式 → 若TL则读取 WITH-Annotate.md → 扫描IMPORTANT TODO→分析→穿透→标记转换
├── 包含 /withPlan /withTest /withMock /withReview /withQuery /withInbox /withOutbox → 检查当前模式 → 若TL则读取对应 WITH-*.md 叠加约束
├── 包含 /withFinish 或 "完成了" "做完了" "收尾" → 检查当前模式 → 若TL则读取 WITH-Finish.md → 执行完成协议
├── 包含 /mgmtReport 或 /mgmtEstimate 或 mgmt 自然语言别名 → 读取对应 MGMT-*.md → 执行管理分析（TL/Teacher 通用）
├── 包含 "记下这个问题" "反馈一下" "记录这个问题" "agent反馈" → 读取 UTIL-Agent反馈协议.md → 识别相关框架文件 → 追加反馈（TL/Teacher 通用）
│
├── 当前为 TL 模式（默认）→ 走 TL 决策树（完整行为定义见 AS-TL.md）
│   ├── 简单问答/修改 → 直接执行
│   ├── 中等复杂度 → codegraph 探索 → 设计 → 直接执行
│   ├── 复杂需求 → 创建任务文件 → TL 做核心 + 派发 subAgent
│   ├── 框架文档变更 → TL 可直接修改非工作流核心文档
│   └── mgmt 指令 → 读取 MGMT-*.md → 收集数据 → 输出管理报告
│
└── 当前为 Teacher 模式 → 走 Teacher 决策树（完整行为定义见 AS-Teacher.md）
    ├── /frameworkInit → 框架初始化引导
    ├── /frameworkClean → 框架重置
    ├── /frameworkRefresh → 框架刷新
    ├── dream → 框架梦想改造讨论（轻松对话式）
    ├── 框架概念咨询/使用指导/改进/Bug → 评估 → 修改 → 报告
    ├── 任务执行请求 → 提醒用户切回 /asTL
    └── mgmt 指令 → 读取 MGMT-*.md → 收集数据 → 输出管理报告
```

**用户确认触发规则（TL 模式）：**
- 危险操作（删除文件、数据库变更、push、配置变更）→ 必须确认
- 修改 3 个以上文件 → 简要告知用户后执行
- 单文件修改 / 查询 / 代码探索 → 直接执行

---

## 目录结构与导航策略

当 Agent 需要加载上下文时，按以下优先级读取：

| 场景 | 先读 | 再读 | 可选 |
|------|------|------|------|
| 执行新任务 | 根 AGENTS.md | 角色定义 | 按需查 `_封存/` |
| 模式指令触发 | `角色体系/模式指令/🎛️_指令总览.md` | 具体 `AS-*.md` / `WITH-*.md` / `FW-*.md` / `MGMT-*.md` | 系列说明 |
| 扮演特定角色 | 角色定义 `角色体系/` | 关联工作类型（`_封存/工作体系/`） | 工具手册 |
| 代码审查 | `通用能力层/检查清单/CHK-代码审查检查清单` | 编码规范 | — |
| 代码质量自检 | `通用能力层/检查清单/CHK-项目代码质量自检` | 项目 `docs/` 编码约定 | — |
| 口语→查询条件 | `通用能力层/查询Schema注册表/` | 对应页面 Schema + `/withQuery` | MCP MySQL (DB探查) |
| 代码质量检查 | `通用能力层/检查清单/CHK-项目代码质量自检` | 项目 `docs/` 编码规范 + `/withCheck` | QA-004 |
| 代码注释规范 | `通用能力层/工具手册/UTIL-代码注释规范.md` | `/withAnnotate` | `/withCheck` 维度 6 |
| SQL 模板生成 | `通用能力层/skills/sql-templates/README.md` | 对应类型 `SKILL.md` | `通用能力层/工具手册/UTIL-SQL管理规范.md` |
| 数据结构字段分组 | `通用能力层/工具手册/UTIL-SQL管理规范.md` | `CHK-项目代码质量自检` 维度 7 | SQL / DO / 数据库交互 VO |
| 外部需求接入（入站） | `A.目标体系/_需求收件箱/` | `角色体系/模式指令/with系列/WITH-Inbox.md` | — |
| 需求导出给外部（出站） | `A.目标体系/_需求收件箱/` | `通用能力层/工具手册/UTIL-需求导出协议.md` | — |
| 产物工件定位 | `配置与元数据/产物工件规范.md` | 角色定义（取 artifact_prefix） | 标签体系 |
| Agent 反馈记录 | `通用能力层/工具手册/UTIL-Agent反馈协议.md` | — | — |
| 代码探索/理解架构 | `codegraph_context` (MCP) | `codegraph_trace` / `codegraph_impact` | 按需 `codegraph_explore` |
| 理解工作方向 | `A.目标体系/目标总览.md` | `A.目标体系/目标总览-模版.md`（格式参考） | — |
| 管理报告生成 | `角色体系/模式指令/mgmt系列/MGMT-Report.md` 或 `MGMT-Estimate.md` | — | — |

### 一级目录索引

```
A.目标体系/             ← 目标列表 + 管理报告，人类维护目标总览
A.产物工件/             ← （已废弃，内容迁移至 A.目标体系/GOAL-XXX/产物/）
A.Teacher分析/           ← 框架分析复盘
角色体系/               ← 角色定义 + Agent 激活指令 + 模式指令子系统（as/fw/with/mgmt 四系列）
任务系统/               ← 任务文件、控制台、模板
知识沉淀/               ← 最佳实践、技术文档、经验教训
配置与元数据/           ← 标签体系、命名规范、Dataview 查询、FAQ
导航系统/               ← MOC 索引页
通用能力层/             ← 离线 skill 库：检查清单/工具手册/脚本库/查询Schema注册表（TL 按需取用，派发时挂接）
_封存/                  ← 工作体系/流程引擎/日志与追踪（按需取用）
🏠_总览.md              ← 仪表盘入口（人类浏览用）
.obsidian/templates/    ← 9 个系统模板
```

---

## 项目定位协议

### 项目注册表

所有项目路径和元数据统一管理在 `配置与元数据/项目注册表.yaml`。

**Agent/主会话在需要操作项目代码时，必须遵循以下协议：**

```
用户提及项目名
    ↓
1. 读取 配置与元数据/项目注册表.yaml
    ↓
2. 匹配 projects.<key> 或 projects.<key>.alias
    ↓
3. 匹配成功 → 取 path、tech_stack、description
   匹配失败 → 主动询问用户项目路径
    ↓
4. 读取项目 `docs/README.md`（如有）→ 架构+约定，项目唯一入口。若为 Java 后端项目，可继续读取 `docs/a-basic.md` 获取跨项目通用约定
    ↓
5. cd 到 path，开始工作
```

### 查找规则示例

| 用户说法 | 匹配方式 | 结果 |
|---------|---------|------|
| "改一下 fms-rear" | key 精确匹配 | `fms-rear` |
| "看一下 fms后端" | alias 匹配 | `fms-rear` |
| "拉森前端有个bug" | alias 匹配 | `lasen-ui` |
| "改一下 lasen" | alias 匹配 | `lasen-rear` |
| 未提及任何已注册项目 | 无匹配 | 询问用户 |

### Agent 上下文加载优先级

进入项目后，按以下顺序加载上下文：
1. `配置与元数据/项目注册表.yaml` → 获取项目元数据
2. 项目 `docs/README.md` → 架构+约定，项目唯一入口。注意：README.md 底部含「快速定位」区（Agent 维护），可跳过 codegraph_search 直接定位页面/字段/接口
3. 项目 `docs/a-basic.md` → 跨项目后端通用约定（如有，仅 Java 后端项目）
4. 按需读取 `docs/` 下其他文档（component-*.md / ui-*.md / biz-*.md / tech-*.md 等）

### Agent 自动维护：减少上下文重复加载

Agent 在项目和工作记录中有两项自动维护职责，目标是为后续会话（自己或其他 Agent）减少上下文重复加载。**人类不维护这些内容。**

#### 项目 README.md「快速定位」区（Agent 维护）

Agent 在开发过程中，每当发现新的页面、核心字段、接口路径时，应在 README.md 底部的「快速定位」区增量补充。后续会话的 Agent 读 README.md 时一次性拿到定位信息，无需再通过 codegraph_search 翻译人类口语。

格式要求：极简列表，不写叙事。人类叫法 → 精确路径/来源。

#### 工作记录「状态摘要」块（Agent 增量更新）

在 `GOAL-XXX/工作记录.md` 顶部维护状态摘要块（人类无视）。Agent 完成一个 step 后仅更新摘要中的变化字段，不需要重读已完成的内容。

更新规则：
- `已完成` 数 = 当前 step 完成后 +1
- `最近完成` = 刚完成的 step 标题
- `下一个待执行` = 轻量扫描后续未完成条目后取标题
- `主要改动文件` = 每次改动时追加（去重）

---

## CodeGraph 代码知识图谱

所有已注册项目（fms-rear、fms-ui、lasen-rear、lasen-ui）均已初始化 CodeGraph 语义索引（`.codegraph/` 目录含 SQLite 数据库）。全局 CLAUDE.md（`~/.claude/CLAUDE.md`）中已包含完整的 CodeGraph 工具速查表。

### Agent 使用原则

**在操作已注册项目代码时，Agent 必须优先使用 CodeGraph MCP 工具进行代码探索，而非 grep/Glob/Read 扫描文件。**

| 问题类型 | 使用工具 | 说明 |
|---------|---------|------|
| "X 定义在哪里？" | `codegraph_search` | 比 grep 快，返回类型+位置+签名 |
| "谁调用了 Y？" | `codegraph_callers` | 精确到调用边 |
| "Y 调用了什么？" | `codegraph_callees` | 列出所有被调用符号 |
| "从 X 到 Y 的调用路径？" | `codegraph_trace` | 一次返回完整路径（含回调/动态跳转） |
| "改了 Z 会影响什么？" | `codegraph_impact` | 变更影响分析 |
| "这个模块的整体架构？" | `codegraph_context` | 一次获取入口点+相关符号+代码片段 |
| "批量获取多个符号源码" | `codegraph_explore` | 仅 Explore Agent（子 Agent）使用 |
| 文本内容搜索（字符串/注释/日志） | 传统 grep/Read | CodeGraph 不处理字面量文本 |
| 索引状态检查 | `codegraph_status` | 确认索引是否健康 |

### 关键规则

1. **信任 CodeGraph 结果** — 基于完整 AST 解析，不要用 grep 重新验证
2. **回答架构问题** → 先用 `codegraph_context`，再用一次 `codegraph_explore` 取源码
3. **追踪调用流** → 先用 `codegraph_trace`（一次调用得完整路径），再用 `codegraph_explore` 取实现体
4. **不要链式调用 `codegraph_search` + `codegraph_node`** — `codegraph_context` 一次搞定
5. **不要循环 `codegraph_node`** — 用 `codegraph_explore` 批量获取
6. **索引延迟** — 文件变更后约 500ms 延迟，不要在编辑后立即查询
7. **CodeGraph 查询为空时先重建索引** — 若项目已有 `.codegraph/` 但查询返回空结果，索引可能过期。不要直接降级为 grep/Glob/Read。先执行 `codegraph init -i` 重建索引 → 重新查询 → 仍为空才降级为传统搜索

### 项目初始化检查

Agent 进入已注册项目时，若发现项目缺少 `.codegraph/` 目录，应提示用户运行 `codegraph init -i` 初始化索引。

---

## 目标交互协议 ⚠️ 强制

`A.目标体系/目标总览.md` 由**人类全权维护**——一个文件，所有目标。AI 的角色是理解方向、辅助达成。

### 过渡期目标结构

当前目标体系仍是列表型，不建立真实树形目录或新数据结构。框架过渡期采用以下语义：

| 层级 | 说明 | 维护规则 |
|------|------|----------|
| Goal | 长期目标，形如 `GOAL-102` | 人类维护目标名称和目标效果 |
| 当前子目标 | 原“当前分点”的升级语义，表示一个可独立推进的交付主题 | 沿用原分点序号，不强制重排；旧标题 `当前分点` 过渡期等同 `当前子目标` |
| 分点 | 子目标下的可执行交付项、检查项、待确认项 | Agent 可在既有子目标下共同维护，保留人类原始意图 |

推荐子目标格式：

```markdown
- [ ] {序号}. {子目标一句话效果}
    - 总览：{页面、按钮、弹窗、接口、SQL、数据结构、权限、IMPORTANT、自检边界}
    - 分点：
        - [ ] {可执行交付项}
    - 检查项：
        - [ ] {IMPORTANT 重要逻辑、特殊业务校验、人工复查事项}
    - 待确认：
        - [ ] {不确定内容；没有则省略}
```

`/withGo` 或 `/withGoal` 是目标开始前的高级门禁：TL 先判断用户真实意图和需求成熟度，再把既有 Goal 子目标整理为上述可执行分点。它只做最小充分补充，推断和缺口写入 `待确认`；需求边界不清时先 `/withGrill`，需求清楚且用户要求计划时再按 `/withPlan` 落盘计划，不能无条件补全文档。

### AI 交互边界

| 允许 | 禁止 |
|------|------|
| 读取 `目标总览.md` 理解当前目标方向 | 创建/修改/删除目标条目、勾选 checkbox、修改目标描述 |
| 在既有 Goal 的当前子目标下补充/整理 `总览`、`分点`、`检查项`、`待确认` | 把目标体系改造成真实树形目录或新数据结构 |
| 在已有分点行追加/更新【状态标签】（如【开发中】【已生成】【待验证】），详见 AS-TL.md「分点状态标注」 | — |
| 口头建议某阶段已达成（附证据） | — |
| 在任务文件中 `linked_goals` 字段引用目标 | — |
| 写入 `A.目标体系/GOAL-XXX/工作记录.md` 记录分步执行情况 | — |
| 写入 `A.目标体系/GOAL-XXX/历史分点.md`（仅人类指令触发） | — |
| 写入 `A.目标体系/GOAL-XXX/关联任务/`（创建任务时） | — |
| 写入 `A.目标体系/GOAL-XXX/产物/`（产出非代码产物时） | — |

### 目标工作记录

指定某目标开发时，工作记录写入 `A.目标体系/GOAL-XXX/工作记录.md`：
- 每个分步记录：要求 + 完成状态 `[x]/[ ]` + 实现简述
- 简单分步 → 直接记录完成
- 复杂分步 → 转为 TASK，在记录中记下任务链接
- 详见 `配置与元数据/产物工件规范.md` 的「目标级工作记录」章节

---

## Agent 编排协议

> 以下为 **TL 模式专属**的强制规则速查。完整操作流程、派发判断矩阵、prompt 构建模板详见 `角色体系/模式指令/as系列/AS-TL.md`。

### subAgent 输出交付 ⚠️ 强制

**subAgent 必须使用 Write/Edit 工具直接将产出物写入目标文件路径，严禁以纯文本返回。**

| 产出物类型 | 目标路径 |
|-----------|---------|
| 项目代码 | 项目对应源码目录 |
| 文档类产出 | `A.目标体系/GOAL-XXX/产物/{任务序号}/`（流程结束后按需同步到项目） |
| DDL/菜单 SQL 脚本 | 项目 SQL 目录（查项目注册表 `sql_dir`，如 `fms-sql/`），命名 `V{YYYYMMDD}_{动作}_{模块名/表名}.sql`；默认只新增本轮 SQL，不回改历史 SQL，除非人类明确允许或本轮目标为 SQL 合并 |
| 知识沉淀 | `知识沉淀/` 对应子目录 |
| 任务状态更新 | `A.目标体系/GOAL-XXX/关联任务/`（Edit 任务文件 frontmatter） |

### 关键决策记录 ⚠️ 强制

每次任务执行必须在任务文件或产物工件中记录：关键决策（选择方案+理由+拒绝的替代方案）、偏离说明、产出清单。

### 需求记录 ⚠️ 强制

TL 记录”做了什么 + 派发了什么”，subAgent 记录”做了什么决策”。双方各记录自己最清楚的部分，合在一起形成完整追溯链。

### 计划先行 ⚠️ 强制

计划先写入 `A.目标体系/GOAL-XXX/产物/{任务序号}/`，用户确认后方可实施。详细交付规则见 `AS-TL.md`。

计划内容必须基于项目交付视角描述修改，尤其说明：新增/修改哪些页面入口、菜单、按钮、筛选项、弹窗、列表列或操作区；后端新增/修改哪些接口、权限点、菜单 SQL、字典、表字段、DO/VO/DTO、接口入参出参。

### TL 持续集成修订 ⚠️ 强制

TL 的小修/联调补丁必须记录为 `integration_revision`，默认不推进主任务完成度。记录格式见 `AS-TL.md`。

### TL 派发决策 ⚠️ 强制

TL 发起或拒绝派发时必须记录：触发来源、判断理由、派发角色、上下文包、验收标准、状态。

### 任务文件命名

- 主任务：`[GOAL{NNN}]-[{序号}]-TASK-{描述}.md`（Goal 内递增，存放于 `A.目标体系/GOAL-XXX/关联任务/`）
- 子任务：`[GOAL{NNN}]-[{序号}.{子序号}]-TASK-{描述}.md`
- 任务序号为 Goal 内递增（2 位，如 `01`），子序号为任务内递增（`00`=无子任务）
- 编号示例：`[GOAL101]-[01]-TASK-采购类型查询条件开发.md`、`[GOAL101]-[01.01]-TASK-后端接口开发.md`

### 并行策略

互不依赖 → 并行派发；有依赖 → 串行（上游完成→TL 集成→派发下游）；TL 核心+subAgent 独立部分 → 并行。

---

## 关键约定速查

### 文件命名
| 类型 | 格式 | 示例 |
|------|------|------|
| 角色 | `ROLE-{中文}.md` | `ROLE-后端开发工程师.md` |
| 工作类型 | `WT-{中文}.md` | `WT-新功能开发.md` |
| 流程 | `PROC-{中文}.md` | `PROC-需求到上线.md` |
| 检查清单 | `CHK-{中文}.md` | `CHK-上线前检查清单.md` |
| 工具手册 | `UTIL-{中文}.md` | `UTIL-Git操作手册.md` |
| 最佳实践 | `BP-{中文}.md` | `BP-编码规范.md` |
| 产物工件 | `[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-{角色}-{描述}.{扩展名}` | `[GOAL101]-[01-00-01]-ART-TL-实施计划.md` |
| 任务 | `[GOAL{NNN}]-[{序号}]-TASK-{描述}.md` | `[GOAL101]-[01]-TASK-采购类型查询条件.md` |

### 任务标题格式
| 格式 | `[项目缩写]-[模块名]-[开发描述]` |
|------|----------------------------------|
| 示例 | `FMS-对账结算中心-初版开发` |
| 示例 | `LASEN-物料对账-违约款配置化` |
| 规则 | 项目缩写 → 项目注册表 key 大写；模块名 → 项目 `business_domains` 字段；框架元任务可省略项目缩写 |

### 标签体系
- 每个文档必须有 `type/` 标签
- 角色文档额外带 `role/` 标签
- 工作类型文档额外带 `work/` 标签
- 流程文档额外带 `process/` 标签
- 任务文档额外带 `status/`、`work/`、`priority/` 标签
- 产物工件额外带 `status/`、`role/`、`project/`、`module/`、`task/` 标签

### 任务状态机
```
pending → in_progress → under_review → done
                           ↓
                        blocked → in_progress
                           ↓
                       cancelled
```

### Agent 完成信号约定
Agent 完成任务后更新任务文件的 frontmatter：
```yaml
status: done
completed: "YYYY-MM-DD"
```

---

## 角色技能映射（TL 派发核心查表）

> **唯一真相来源**：`配置与元数据/角色技能映射表.yaml`。完整查表协议、技能体系总览、流程→技能索引详见 `AS-TL.md`。

### 派发查表协议

```
1. 确定角色 role_id
2. 查 配置与元数据/角色技能映射表.yaml → roles.<role_id>
3. primary_skills 按 trigger 匹配 → 写入 prompt「可用技能」
4. optional_skills 酌情选用 → 写入 prompt「可选技能」
5. checklists 挂接 → 写入 prompt「检查清单」
6. 拼装：identity + skills + checklists + 行为约束 + 输出规范
```

### 技能来源速查

| 技能来源 | 前缀 | 授权规则 |
|---------|------|---------|
| Claude Code 内置 | `claude:` | 默认可用 |
| 框架 zcf 系列 | `zcf:` | 默认可用 |
| 外部 superpowers | `superpowers:` | 需用户明确要求 |

### 外部技能治理原则

1. 技能不等同于角色职责
2. 按需挂接，不全量下发
3. 集中管理在角色技能映射表，角色文件不冗余
4. superpowers 需用户授权后才挂接

---

## 常用入口场景

| 场景 | 动作 |
|------|------|
| 新功能需求 | TL 判断复杂度 → 简单直接做 / 复杂创建任务文件 + 派发 |
| Bug 报告 | TL 排查 → 小 Bug 直接修 / 复杂 Bug 创建任务文件 |
| 代码审查 | TL 直接审查 / 派发 subAgent 独立视角审查 |
| 框架自身完善 | 切换到 `/asTeacher`，改完切回 `/asTL` |
| 框架改造讨论 | `/asTeacher dream {分点}` → 轻松对话 → 共识后直接改框架 |
| 目标驱动工作 | 读 `A.目标体系/目标总览.md` → 理解方向 → 执行 |

> 详细场景步骤见 `AS-TL.md` 和 `AS-Teacher.md`。

---

## 产物工件 (Artifact) 管理

### 核心原则

1. 产物先在框架内迭代 → `A.目标体系/GOAL-XXX/产物/{任务序号}/`
2. 流程结束后按需同步 → 项目 `docs/`
3. 代码直接入项目，不经过产物系统

> 完整规范见 `配置与元数据/产物工件规范.md`。

---

## 知识沉淀规范

任务完成后，按以下路径归档：
- 新技术调研 → `知识沉淀/技术调研/`
- 故障复盘 → `知识沉淀/经验教训/`
- 可复用的技术方案 → `知识沉淀/技术文档/`
- 项目级开发约定 → 按 `知识沉淀/AGENT.md` 决策路径归档

归档模板使用 `.obsidian/templates/tpl-knowledge.md`。详细归档触发信号和流程见 `知识沉淀/AGENT.md`。

---

## 版本历史

详细框架变更留底见 `A.Teacher分析/框架版本历史.md`。根入口文档只保留当前工作规则和必要导航，不再内嵌长篇工作记录。
