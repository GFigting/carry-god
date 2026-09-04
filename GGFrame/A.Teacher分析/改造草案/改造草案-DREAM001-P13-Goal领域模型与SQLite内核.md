---
type: teacher-analysis
domain: framework
version: "1.0"
created: 2026-07-06
status: draft
---

# DREAM-001 P13 前置草案：Goal 领域模型与 SQLite 内核

> 本文是 `DREAM-001 P13 桌面程序 Goal 管理` 的前置设计。
> 本轮对话只沉淀指导思想和框架方向，不进入实际开发。

---

## 1. 核心判断

P13 不应被定位为“Markdown Goal 编辑器”，而应被定位为：

> **Goal Kernel：通用目标管理内核。桌面程序只是第一种外壳。**

原 P13 草案中的“文件系统即数据库”“MD AST 精确保留格式”适合作为短期兼容手段，但不适合作为最终架构。若继续让 Markdown 成为唯一真实数据源，目标体系会长期受制于文本解析，难以支撑通用化、统计分析、AI 自动化、团队协作和多端同步。

最终方向应是：

```text
SQLite / 关系型数据模型 = 真实数据源
Markdown / Obsidian 文件 = 人类可读视图、导入导出格式、兼容层
Electron / Web / CLI / Agent = 多种交互外壳
```

---

## 2. Goal 的通用定义

Goal 不是研发任务的同义词，而是通用工作框架中的核心对象：

```text
Goal = 意图 + 边界 + 分解 + 状态 + 证据 + 决策 + 关系 + 记忆
```

它需要表达：

| 维度 | 需要回答的问题 |
|------|----------------|
| 意图 | 为什么要做？最终希望产生什么效果？ |
| 边界 | 做到什么算完成？哪些内容不在当前范围？ |
| 分解 | 当前拆成哪些分点、子分点、任务？ |
| 状态 | 每个部分在代码、SQL、部署、验证等维度做到哪了？ |
| 证据 | 哪些文件、commit、产物、测试结果证明它已完成？ |
| 决策 | 过程中做过哪些关键选择，为什么？ |
| 关系 | 它依赖谁、阻塞谁、关联哪些项目/模块/知识？ |
| 记忆 | 下次 AI 或人类接手时，如何无损恢复上下文？ |

只要对象符合上述特征，就可以成为 Goal：研发需求、问题排查、学习计划、个人项目、运营事项、框架改造、长期习惯都应能被同一套模型表达。

---

## 3. 存储策略

### 3.1 第一阶段选择 SQLite

SQLite 是 P13 的推荐承载方式：

| 原因 | 说明 |
|------|------|
| 本地优先 | 不需要部署服务端，符合个人生产力工具定位 |
| 可迁移 | 一个 `.sqlite` 文件即可随框架目录迁移 |
| 可查询 | 支持关系查询、索引、统计、约束，远强于 Markdown 解析 |
| 易演进 | 后续可迁移到 Postgres/MySQL 或同步服务 |
| 适合桌面程序 | Electron 主进程可稳定读写 SQLite |

不建议第一阶段直接使用服务端关系型数据库。那会过早引入部署、权限、同步、备份、网络可用性等问题，偏离“先解放个人生产力”的目标。

### 3.2 Markdown 的定位

Markdown 不再是最终真实数据源，而是兼容层：

| 用途 | 说明 |
|------|------|
| 导入 | 首次从现有 `目标总览.md`、工作记录、任务文件导入 SQLite |
| 导出 | 从 SQLite 生成 `目标总览.md`，供 Obsidian/纯文本阅读 |
| 备份 | 结构化数据可定期导出为 Markdown/JSON，降低锁定风险 |
| 人类可读视图 | 保留“一个文件看全局”的低摩擦体验 |

因此后续 P13 不应把主要工程复杂度投入到“精确保留 Markdown 原始格式”，而应投入到“领域模型稳定、数据关系清晰、导入导出可靠”。

---

## 4. 领域对象

### 4.1 核心对象

| 对象 | 含义 |
|------|------|
| Workspace | 一个工作空间，指向一个框架目录或任意目标库 |
| Goal | 目标本体，承载意图、范围、生命周期 |
| GoalNode | Goal 下的分点、子分点、挂起分点，组成目标树 |
| Task | 可执行任务，可从某个 GoalNode 派生 |
| Artifact | 产物，包含计划、方案、报告、原型、SQL、测试材料等 |
| WorkLog | 工作记录，描述某次推进做了什么 |
| Decision | 关键决策，记录选择方案、理由和拒绝方案 |
| QARecord | 答疑记录，从 Goal 正文中剥离出来 |
| KnowledgeRef | 知识沉淀引用，连接 Goal 与知识库 |
| ExternalRef | 外部资料、系统、链接、文件、工单、issue |

### 4.2 状态与关系对象

| 对象 | 含义 |
|------|------|
| TagDefinition | 标签定义，如项目、模块、工作类型、领域 |
| ObjectTag | 任意对象与标签的关系 |
| DimensionDefinition | 状态维度定义，如代码、SQL、部署、验证 |
| DimensionStatus | 某个 GoalNode 在某个维度上的当前状态 |
| StatusEvent | 状态变更事件，保留历史轨迹 |
| ObjectLink | 任意对象之间的关系，如依赖、阻塞、产出、证明 |

---

## 5. SQLite Schema 草案

> 以下是概念级表结构，用于指导后续开发，不要求本轮直接落库。

### 5.1 工作空间与目标

```sql
workspace(
  id text primary key,
  name text not null,
  root_path text not null,
  created_at text not null,
  updated_at text not null
)

goal(
  id text primary key,
  workspace_id text not null,
  code text not null,              -- GOAL-001
  title text not null,
  expected_effect text,
  scope text,
  out_of_scope text,
  status text not null,            -- active / suspended / completed / archived / cancelled
  priority text,
  owner text,
  recently_completed text,
  created_at text not null,
  updated_at text not null,
  archived_at text
)
```

### 5.2 目标树

```sql
goal_node(
  id text primary key,
  goal_id text not null,
  parent_id text,
  code text,                       -- P1 / P1.1 / A
  title text not null,
  description text,
  node_type text not null,          -- active_point / suspended_point / milestone / note
  sort_order integer not null,
  status text not null,             -- open / in_progress / blocked / done / cancelled
  checked integer not null default 0,
  created_at text not null,
  updated_at text not null,
  completed_at text
)
```

### 5.3 任务、产物、日志

```sql
task(
  id text primary key,
  goal_id text not null,
  goal_node_id text,
  code text,
  title text not null,
  status text not null,
  task_nature text,
  progress_policy text,
  assignee_role text,
  source_path text,
  created_at text not null,
  updated_at text not null,
  completed_at text
)

artifact(
  id text primary key,
  goal_id text not null,
  task_id text,
  name text not null,
  artifact_type text not null,
  role_prefix text,
  status text not null,
  source_path text,
  sync_target text,
  created_at text not null,
  updated_at text not null
)

work_log(
  id text primary key,
  goal_id text not null,
  goal_node_id text,
  task_id text,
  title text not null,
  requirement text,
  summary text,
  status text not null,
  happened_at text not null,
  created_by text
)
```

### 5.4 决策、答疑、关系

```sql
decision(
  id text primary key,
  goal_id text not null,
  goal_node_id text,
  task_id text,
  decision_point text not null,
  chosen_option text not null,
  reason text,
  rejected_options text,            -- JSON array
  created_at text not null
)

qa_record(
  id text primary key,
  goal_id text not null,
  goal_node_id text,
  question text not null,
  answer text,
  status text not null,             -- open / answered / deferred / cancelled
  perspective text,                 -- business / system / test / ops / other
  created_at text not null,
  answered_at text
)

object_link(
  id text primary key,
  from_type text not null,
  from_id text not null,
  to_type text not null,
  to_id text not null,
  link_type text not null,           -- depends_on / blocks / produces / proves / references / derived_from
  note text,
  created_at text not null
)
```

### 5.5 标签与多维度状态

```sql
tag_definition(
  id text primary key,
  namespace text not null,           -- project / module / work / domain / custom
  code text not null,
  label text not null,
  description text
)

object_tag(
  id text primary key,
  object_type text not null,
  object_id text not null,
  tag_id text not null
)

dimension_definition(
  id text primary key,
  code text not null,                -- code / sql / deploy / config / verify / data
  label text not null,
  states_json text not null,          -- 状态枚举与终态规则
  applies_to text not null            -- goal_node / task / artifact
)

dimension_status(
  id text primary key,
  object_type text not null,
  object_id text not null,
  dimension_id text not null,
  state text not null,
  note text,
  updated_at text not null
)

status_event(
  id text primary key,
  object_type text not null,
  object_id text not null,
  dimension_id text,
  from_state text,
  to_state text not null,
  reason text,
  evidence_link_id text,
  happened_at text not null,
  created_by text
)
```

---

## 6. 标签与状态表达原则

### 6.1 不再把标签塞进自然语言文本

现有文本标签：

```text
【代码:已提交】【SQL:已生成】【部署:未部署】
```

应被视为过渡格式。结构化模型中应拆成：

```text
dimension_status(code=committed)
dimension_status(sql=generated)
dimension_status(deploy=undeployed)
```

Markdown 导出时可以重新渲染成文本标签，但数据库内不以文本标签作为真实表达。

### 6.2 字段、JSON、标签的边界

| 表达方式 | 适合内容 |
|----------|----------|
| 字段 | 稳定、高频查询、影响生命周期的属性，如 `status`、`priority`、`owner` |
| 关系表 | 多对多关系，如标签、依赖、阻塞、产物证明 |
| JSON | 变化快、低频查询、领域差异大的扩展信息 |
| Markdown | 人类阅读、摘要、叙事、导出视图 |

原则：能影响过滤、统计、自动化判断的内容，不应只存在于 Markdown 文本中。

---

## 7. 迁移路线

### Phase 0：定义内核模型

- 明确 Goal、GoalNode、Task、Artifact、WorkLog、Decision、QARecord 的字段和关系
- 明确状态维度、标签体系、事件历史的表达方式
- 明确 Markdown 只是兼容层，不再是最终真实数据源

### Phase 1：SQLite 旁路索引

- 从现有 `目标总览.md`、`工作记录.md`、任务文件和产物 frontmatter 导入 SQLite
- 桌面程序优先读 SQLite
- Markdown 仍可人工维护，程序提供重新导入/同步能力

### Phase 2：SQLite 成为主数据源

- 桌面程序和 Agent API 直接读写 SQLite
- `目标总览.md` 由 SQLite 自动生成
- 人类仍可通过 Markdown 看全局，但不再依赖手写标签维护状态

### Phase 3：Agent API

- 为 AI 提供结构化查询接口：
  - 当前活跃 Goal
  - 某 Goal 的阻塞项
  - 某分点缺少的完成维度
  - 某次完成的证据链
  - 下一个推荐推进点
- AI 不再仅靠读取自然语言上下文判断状态

### Phase 4：团队协作与同步

- SQLite 可迁移到服务端关系型数据库
- 增加账号、角色、权限、变更订阅、冲突解决
- Goal Kernel 保持不变，替换存储后端即可

---

## 8. 对 P13 桌面程序草案的约束

后续修订 P13 桌面程序草案时，应遵守以下约束：

1. 不再把“文件系统即数据库”描述为最终架构，只能作为历史兼容或导入导出策略。
2. 不再把“MD AST 精确保留格式”作为核心工程目标，改为“Markdown 导入导出可靠”。
3. 桌面程序的数据流应以 SQLite / Goal Kernel 为中心，而不是以 `目标总览.md` 为中心。
4. 多维度状态应落到 `dimension_status` 和 `status_event`，文本标签仅作为导出展示。
5. 分点答疑应落到 `qa_record`，不再混写在 Goal 正文中。
6. 任务、产物、知识、commit、外部资料之间必须通过稳定 ID 建立关系。
7. P13 的 MVP 可以只实现本地个人版，但模型必须保留服务端数据库和团队协作的演进空间。

---

## 9. 尚待后续设计的问题

- SQLite 文件放置位置：框架根目录、`.goal-kernel/`，还是用户级应用数据目录？
- Markdown 与 SQLite 同时被修改时的冲突策略。
- Goal 编号由人类维护、程序生成，还是混合策略？
- 状态维度是否允许用户自定义，以及自定义后如何保持 AI 可理解。
- `目标总览.md` 是全量导出，还是只导出活跃目标摘要。
- 现有历史目标、工作记录、任务文件的导入校验规则。
