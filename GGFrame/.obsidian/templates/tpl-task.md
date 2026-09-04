---
type: task
task_id: ""                # 格式: [GOAL{NNN}]-[{序号}]，如 [GOAL101]-[01]
title: ""                  # 格式: [项目缩写]-[模块名]-[开发描述]，如 FMS-对账结算中心-初版开发
status: draft
work_type: ""
process: ""

# 项目归属
project: ""                # 项目注册表 key，如 fms-rear / fms-ui / lasen-rear / lasen-ui
module: ""                 # 业务模块名，如 对账结算中心 / 物料管理 / 价格中心
goal: ""                   # 所属 Goal ID，如 GOAL-101

# 人员
creator: ""
assignee: ""
reviewer: ""

# 关联
linked_goals: []           # 关联的目标 ID，如 ["GOAL-101"]
depends_on: []
blocks: []
parent_task: ""

# 优先级与排期
priority: P2
estimated_hours: 0
actual_hours: 0
due_date: ""
sprint: ""

# 产物
artifacts: []              # 产物工件列表（可选），格式: [{artifact_id, status, sync_target}]

# 内容
summary: ""
acceptance_criteria: []
related_links: []

tags:
  - type/task
  - status/draft
  - work/
  - project/                # 与 frontmatter project 字段对应，如 project/fms-rear
  - module/                # 与 frontmatter module 字段对应，如 module/对账结算中心
created: "{{date}}"
updated: "{{date}}"
completed: ""
---

# {{title}}
<!-- 标题格式: [项目缩写]-[模块名]-[开发描述]，详见命名规范 -->

## 需求来源
<!-- 谁提出的、什么时候、通过什么渠道 -->

## 需求描述
<!-- 详细描述需求内容 -->

## 进度跟踪
<!-- 使用 Phase 分组 + checkbox 跟踪各项交付物进度 -->

### Phase 1: {阶段名称}
- [ ] {交付项1}
- [ ] {交付项2}

### Phase 2: {阶段名称}
- [ ] {交付项1}
- [ ] {交付项2}

<!-- 完成一项后改为 - [x]，Phase 全部完成后标记为 ✅ -->

## 验收标准
<!-- 明确的可验证标准 -->
- [ ]
- [ ]
- [ ]

## 技术方案
<!-- 技术实现思路，链接到技术方案文档 -->

## 子任务
<!-- 如需要，拆解为更细粒度的子任务 -->
- [ ] 子任务1
- [ ] 子任务2

## 产物清单
<!-- 任务产生的文档类产物，统一管理在 A.目标体系/GOAL-XXX/产物/{任务序号}/ 目录下 -->
<!-- 格式示例：
| 产物 ID | 名称 | 状态 | 同步目标 |
|---------|------|------|----------|
| [GOAL101]-[01-00-01]-ART-TL-技术方案设计 | 技术方案设计 | approved | fms-rear/docs/xxx.md |
-->

| 产物 ID | 名称 | 状态 | 同步目标 |
|---------|------|------|----------|
| | | | |

## 关联链接
<!-- PR、设计稿、需求文档等 -->
-
