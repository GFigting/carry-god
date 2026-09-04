---
type: teacher-analysis
domain: framework
version: "2.0"
created: 2026-06-26
updated: 2026-07-06
status: draft
---

# DREAM-001 P13 改造草案：框架桌面程序 — Goal Kernel 可视化外壳

> 来自 `dream 001 P13` 讨论（2026-06-26）。
> 2026-07-06 修订：原“文件系统即数据库 / Markdown 编辑器”路线升级为“Goal Kernel + SQLite 主数据源 + Markdown 兼容视图”路线。
> 前置设计见：`A.Teacher分析/改造草案/改造草案-DREAM001-P13-Goal领域模型与SQLite内核.md`。
> 本文只沉淀指导思想和产品/技术方向，实际开发不在本轮对话中继续。

---

## 1. 目标

将框架中的 Goal 管理从纯文本编辑升级为可视化、结构化、可查询、可自动化的目标管理系统。

P13 的真实目标不是做一个更漂亮的 `目标总览.md` 编辑器，而是为框架引入一个可长期演进的 **Goal Kernel**：

```text
Goal Kernel = 通用目标领域模型 + SQLite 本地存储 + Agent/API 访问能力
桌面程序 = Goal Kernel 的第一种人机交互外壳
Markdown = 人类可读视图、导入导出格式、兼容层
```

### 1.1 为什么要升级

现有目标体系以 Markdown 为中心，适合早期低摩擦使用，但在以下方向上会遇到上限：

- 分点状态、标签、阻塞、证据链都混在自然语言中，AI 只能解析和猜测。
- Goal、分点、任务、产物、答疑、知识、commit 之间缺少稳定 ID 和结构化关系。
- 多维度状态无法可靠统计，例如“代码已提交但 SQL 未执行、部署未发布、验证未完成”。
- 桌面程序如果继续围绕 Markdown AST 精确保留格式，会被文本序列化复杂度绑架。
- 后续若要团队协作、同步、多端、Agent API，纯文本源数据难以支撑。

因此 P13 应先建立目标领域模型，再开发桌面外壳。

---

## 2. 架构决策

### 2.1 SQLite 是第一阶段真实数据源

P13 第一阶段采用 SQLite 承载目标体系数据。

| 选择 | 说明 |
|------|------|
| SQLite | 本地优先、零服务端部署、可迁移、可查询、适合桌面程序 |
| Markdown | 导入导出、人类可读、Obsidian 兼容、备份 |
| Electron + Vue | 桌面端交互外壳 |
| 后续服务端数据库 | 团队协作阶段再考虑 Postgres/MySQL 或同步服务 |

原草案中的“文件系统即数据库”改为：

> **文件系统是工作空间和兼容视图，SQLite 才是结构化目标数据源。**

### 2.2 Goal Kernel 优先于 UI

开发顺序应从“数据内核”开始，而不是从页面开始：

1. 定义 Goal、GoalNode、Task、Artifact、WorkLog、Decision、QARecord 等领域对象。
2. 定义标签、状态维度、事件历史、对象关系。
3. 建立 SQLite schema 和迁移/导入机制。
4. 桌面程序通过统一服务层读写 Goal Kernel。
5. Markdown 由 Kernel 导出，不作为长期唯一源数据。

### 2.3 Markdown AST 不再是核心复杂度

Markdown 仍然重要，但定位变化如下：

| 原定位 | 新定位 |
|--------|--------|
| 直接读写框架 Markdown，文件系统即数据库 | 从 Markdown 导入历史数据，之后由 SQLite 管理结构化数据 |
| MD AST 精确保留非编辑区域格式 | Markdown 导入导出可靠，允许生成规范化视图 |
| `目标总览.md` 是主数据源 | `目标总览.md` 是从 SQLite 生成的人类可读总览 |

这能避免桌面程序变成 Markdown 特化编辑器。

### 2.4 技术栈

**Electron + Vue 3 + TypeScript + Pinia + SQLite**

选择理由：

- Electron 适合本地文件系统和 SQLite 访问。
- Vue 3 + TypeScript 便于 AI 和人类共同维护。
- Pinia 管理渲染进程状态，SQLite 作为持久层。
- SQLite 本地数据库符合个人生产力工具的迁移性要求。

---

## 3. 数据流设计

### 3.1 首次导入链路

```text
现有框架目录
  ├─ A.目标体系/目标总览.md
  ├─ GOAL-XXX/工作记录.md
  ├─ GOAL-XXX/关联任务/
  └─ GOAL-XXX/产物/
        ↓
Markdown / frontmatter / 文件路径解析
        ↓
导入校验与人工确认
        ↓
SQLite Goal Kernel
        ↓
桌面程序展示
```

导入阶段可以接受不完美，但必须产出校验报告：

- 哪些 Goal 被识别。
- 哪些分点缺少稳定编号。
- 哪些任务/产物无法归属。
- 哪些文本标签被映射为结构化维度状态。
- 哪些内容只能作为备注保留。

### 3.2 常规读写链路

```text
用户在桌面程序编辑 Goal / 分点 / 状态 / 答疑
        ↓
Renderer Store 变更
        ↓
IPC 调用 Goal Kernel Service
        ↓
SQLite 事务写入
        ↓
StatusEvent / WorkLog / ObjectLink 同步记录
        ↓
UI 刷新
        ↓
按需导出目标总览.md / 工作记录视图
```

关键点：用户操作不直接改 Markdown，而是改 SQLite。Markdown 是导出结果。

### 3.3 “完成一个分点”的完整链路

```text
用户尝试勾选分点
  → 查询该 GoalNode 的 dimension_status
  → 若代码/SQL/部署/验证等维度未达终态，弹出完成确认
  → 用户确认或补充状态
  → goal_node.status = done / checked = 1
  → 写入 status_event
  → 自动生成 work_log
  → 关联证据：commit / artifact / test result / manual confirmation
  → 重新计算 Goal 进度
  → 按需导出 Markdown 总览
```

这比单纯把 `- [ ]` 改成 `- [x]` 更符合真实工作流。

---

## 4. 核心数据类型

详细字段以 `Goal领域模型与SQLite内核` 草案为准。桌面程序层只使用这些领域对象的 TypeScript 映射。

```typescript
interface Goal {
  id: string
  code: string                 // GOAL-001
  title: string
  expectedEffect?: string
  scope?: string
  outOfScope?: string
  status: 'active' | 'suspended' | 'completed' | 'archived' | 'cancelled'
  priority?: string
  owner?: string
  nodes: GoalNode[]
  tags: Tag[]
  recentlyCompleted?: string
}

interface GoalNode {
  id: string
  goalId: string
  parentId?: string
  code?: string                 // P1 / P1.1 / A
  title: string
  description?: string
  nodeType: 'active_point' | 'suspended_point' | 'milestone' | 'note'
  status: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled'
  checked: boolean
  dimensions: DimensionStatus[]
  children: GoalNode[]
}

interface DimensionStatus {
  dimension: 'code' | 'sql' | 'deploy' | 'config' | 'verify' | 'data' | string
  state: string
  note?: string
  updatedAt: string
}

interface QARecord {
  id: string
  goalId: string
  goalNodeId?: string
  question: string
  answer?: string
  status: 'open' | 'answered' | 'deferred' | 'cancelled'
  perspective?: 'business' | 'system' | 'test' | 'ops' | 'other'
}
```

---

## 5. 项目结构（goal-ui/）

```text
goal-ui/
├── CLAUDE.md
├── package.json
│
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   └── services/
│       ├── workspace-service.ts
│       ├── sqlite-service.ts
│       ├── goal-kernel-service.ts
│       ├── markdown-import-service.ts
│       ├── markdown-export-service.ts
│       └── config-loader.ts
│
├── src/
│   ├── types/
│   │   ├── goal.ts
│   │   ├── task.ts
│   │   ├── artifact.ts
│   │   ├── status.ts
│   │   └── workspace.ts
│   ├── stores/
│   │   ├── workspace.ts
│   │   ├── goals.ts
│   │   └── app.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── goal/
│   │   ├── status/
│   │   ├── qa/
│   │   ├── worklog/
│   │   └── config/
│   └── assets/styles/
│
├── schema/
│   ├── init.sql
│   └── migrations/
│
└── config.default.yaml
```

---

## 6. MVP 功能清单

### 6.1 MVP 必须包含

| 功能 | 说明 |
|------|------|
| 工作空间选择 | 选择框架目录，初始化 `.goal-kernel/` 或等价数据目录 |
| SQLite 初始化 | 创建数据库和基础 schema |
| Markdown 导入 | 从现有目标总览、工作记录、任务、产物导入 |
| 导入校验报告 | 展示无法识别、无法归属、需人工确认的数据 |
| Goal 列表 | 展示活跃目标、进度、阻塞状态 |
| Goal 详情 | 展示目标效果、分点树、挂起分点 |
| 分点编辑 | 新增、编辑、删除、排序、挂起、恢复 |
| 多维度状态 | 代码/SQL/部署/配置/验证/数据维度状态展示与编辑 |
| 答疑记录 | 分点关联问答独立维护，不混入目标正文 |
| 工作记录视图 | 从 work_log 展示时间线 |
| Markdown 导出 | 从 SQLite 生成规范化 `目标总览.md` 视图 |

### 6.2 MVP 暂不包含

| 功能 | 延后原因 |
|------|----------|
| Claude Code 内嵌外壳 | 属于后续 A 路线，先稳定目标内核 |
| 团队协作同步 | 等本地模型稳定后再设计 |
| 权限模型 | 个人版不需要 |
| 自动 AI 推荐拆分 | 依赖结构化数据积累，后续单独 dream 分点 |
| 双向无损 Markdown 同步 | 成本高，且与新架构方向冲突 |

---

## 7. 多维度交付状态管理

### 7.1 文本阶段的状态标签是过渡方案

当前框架使用文本标签表达状态：

```text
【代码:已提交】【SQL:已生成】【部署:未部署】
```

这是桌面程序出现前的过渡方案。进入 P13 后，它应被解析并落入结构化状态：

```text
dimension_status(code=committed)
dimension_status(sql=generated)
dimension_status(deploy=undeployed)
status_event(sql: null -> generated)
```

导出 Markdown 时可以继续渲染为中文标签，方便人类阅读，但数据库内不以文本标签为真实数据。

### 7.2 维度状态的终态规则

| 维度 | 典型终态 | 说明 |
|------|----------|------|
| code | committed | 代码已提交 |
| sql | executed / verified | SQL 已执行或已验证 |
| deploy | deployed | 已发布 |
| config | applied | 配置已生效 |
| verify | verified | 人工或测试验证通过 |
| data | migrated | 数据迁移完成 |

是否允许 `sql=executed` 视为终态，需要由维度定义决定。某些场景下 SQL 执行后仍需验证，则终态应是 `verified`。

### 7.3 UI 映射

| 结构化状态 | 桌面程序 UI |
|------------|------------|
| `code=committed` | 代码图标 + 绿色状态 |
| `sql=generated` | 数据库图标 + 黄色状态 |
| `deploy=undeployed` | 发布图标 + 灰色状态 |
| `status=blocked` | 分点红色标记 + 阻塞原因 tooltip |
| `verify=pending` | 验证图标 + 待验证状态 |

---

## 8. 与现有框架文件的关系

| 现有文件/目录 | 新定位 |
|---------------|--------|
| `A.目标体系/目标总览.md` | 从 SQLite 导出的活跃目标总览 |
| `GOAL-XXX/工作记录.md` | 可从 `work_log` 导出，也可作为历史导入来源 |
| `GOAL-XXX/关联任务/` | 任务 Markdown 文件保留，frontmatter 导入 task 表 |
| `GOAL-XXX/产物/` | 产物文件保留，元数据导入 artifact 表 |
| `历史分点.md` | 可导入为 completed/archived 的 GoalNode 或 WorkLog |
| 文本状态标签 | 导入时映射为 dimension_status |
| grill/答疑文件 | 导入为 qa_record，不再混入 Goal 正文 |

---

## 9. 后续演进路线

| 阶段 | 内容 |
|------|------|
| Phase 0 | 完成 Goal 领域模型与 SQLite schema 设计 |
| Phase 1 | 实现本地 SQLite 初始化、Markdown 导入、校验报告 |
| Phase 2 | 实现 Goal/分点/状态/答疑/工作记录的桌面管理 |
| Phase 3 | 实现 Markdown 规范化导出，保持 Obsidian 可读 |
| Phase 4 | 为 Agent 提供结构化查询 API |
| Phase 5 | 考虑团队协作、同步、权限和服务端数据库 |

---

## 10. 关键设计决策记录

| 决策点 | 选择方案 | 理由 | 拒绝的替代方案 |
|--------|----------|------|----------------|
| 主数据源 | SQLite | 本地优先、可迁移、可查询、适合桌面程序 | 继续以 Markdown 为唯一数据源 |
| Markdown 定位 | 导入导出和人类可读视图 | 保留低摩擦体验，同时释放结构化能力 | 追求双向无损编辑 |
| P13 定位 | Goal Kernel 的桌面外壳 | 支撑长期通用化和 AI 自动化 | 单纯 Goal GUI CRUD |
| 状态表达 | dimension_status + status_event | 支持当前状态和历史轨迹 | 行内中文标签 |
| 答疑表达 | qa_record 独立对象 | 避免目标正文膨胀，便于检索和归集 | 混写在分点描述里 |
| 技术栈 | Electron + Vue 3 + TypeScript + SQLite | AI/人类均易维护，本地能力强 | 直接做 Web 服务端版 |

---

## 11. 风险与注意事项

1. **迁移复杂度**：现有 Markdown 数据不完全规范，必须提供导入校验报告和人工确认机制。
2. **双写冲突**：如果 SQLite 成为主数据源后，人类继续手改 Markdown，需要明确“重新导入”或“覆盖导出”的规则。
3. **过早复杂化**：MVP 只做个人本地版，团队协作、权限、同步后置。
4. **状态维度泛化**：允许扩展维度，但默认维度必须稳定，否则 AI 难以形成可靠判断。
5. **历史兼容**：旧文本标签、旧工作记录、旧任务 frontmatter 都要能导入，但导入后应规范化。
