---
type: config
id: CFG-DV-001
title: Dataview查询集
aliases: [Dataview Queries, 查询]
domain: meta

tags:
  - type/config
  - domain/meta
created: 2026-05-24
updated: 2026-05-24
---

# Dataview 查询集

常用 Dataview 查询汇总，可直接复制到笔记中使用。

---

## 任务相关

### 我的待办任务
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  priority AS "优先级",
  due_date AS "截止日期",
  status AS "状态"
FROM "任务系统/进行中"
WHERE type = "task" AND assignee = "当前用户" AND status != "done" AND status != "archived"
SORT priority ASC, due_date ASC
```

### 所有活跃任务看板
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  assignee AS "负责人",
  status AS "状态",
  priority AS "优先级"
FROM "任务系统/进行中"
WHERE type = "task" AND status != "archived"
SORT priority ASC
```

### 阻塞任务汇总
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  assignee AS "负责人",
  date(updated) AS "最后更新"
FROM "3.任务系统"
WHERE type = "task" AND status = "blocked"
SORT updated DESC
```

### 待我审核的任务
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  assignee AS "提交人",
  date(updated) AS "提交时间"
FROM "任务系统/进行中"
WHERE type = "task" AND status = "under_review" AND reviewer = "当前用户"
SORT updated ASC
```

### 本周到期任务
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  assignee AS "负责人",
  due_date AS "截止日期"
FROM "任务系统/进行中"
WHERE type = "task" AND due_date != "" AND date(due_date) <= date(now) + dur(7 days) AND status != "done"
SORT due_date ASC
```

### 逾期未完成任务
```dataview
TABLE WITHOUT ID
  file.link AS "任务",
  assignee AS "负责人",
  due_date AS "截止日期"
FROM "任务系统/进行中"
WHERE type = "task" AND due_date != "" AND date(due_date) < date(now) AND status != "done"
SORT due_date ASC
```

---

## 知识相关

### 知识库总览（按领域分组）
```dataview
TABLE WITHOUT ID
  topic AS "主题",
  maturity AS "成熟度",
  date(updated) AS "最近更新"
FROM "5.知识沉淀"
WHERE type = "knowledge"
SORT domain ASC, updated DESC
GROUP BY domain
```

### 指定领域知识
```dataview
TABLE WITHOUT ID
  file.link AS "文档",
  topic AS "主题",
  maturity AS "状态"
FROM "5.知识沉淀"
WHERE contains(tags, "domain/backend") AND type = "knowledge"
SORT updated DESC
```

### 最近更新的知识
```dataview
TABLE WITHOUT ID
  file.link AS "文档",
  domain AS "领域",
  date(updated) AS "更新时间"
FROM "5.知识沉淀"
WHERE type = "knowledge"
SORT updated DESC
LIMIT 10
```

---

## 流程相关

### 所有流程清单
```dataview
TABLE WITHOUT ID
  file.link AS "流程",
  category AS "分类",
  trigger AS "触发条件"
FROM "4.流程引擎"
WHERE type = "process"
SORT category ASC
```

---

## 角色相关

### 所有角色清单
```dataview
TABLE WITHOUT ID
  file.link AS "角色",
  category AS "分类",
  status AS "状态"
FROM "1.角色体系"
WHERE type = "role" AND status != "deprecated"
SORT category ASC, file.name ASC
```

---

## 日报/周报相关

### 本周日报汇总
```dataview
TABLE WITHOUT ID
  file.link AS "日期",
  tasks_completed AS "完成事项",
  blockers AS "阻塞项"
FROM "7.日志与追踪/日报"
WHERE type = "daily-log" AND date(file.name) >= date(now) - dur(7 days)
SORT file.name DESC
```

---

## 元数据统计

### 文档类型分布
```dataview
TABLE length(rows) AS "数量"
FROM ""
WHERE type
GROUP BY type
SORT rows DESC
```

### 任务状态分布
```dataview
TABLE length(rows) AS "数量"
FROM "任务系统/进行中"
WHERE type = "task"
GROUP BY status
SORT rows DESC
```
