---
type: artifact
artifact_id: ""            # 格式: [GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-{角色}-{描述}
name: ""
task_id: ""                # 格式: [GOAL{NNN}]-[{序号}]
goal_id: ""                # 格式: GOAL-NNN
phase_id: ""

# 归属
role: ""
role_prefix: ""
project: ""
module: ""

# 生命周期
status: draft              # draft → in_review → approved → synced

# 同步
sync_target: ""
synced_at: ""
sync_phase: "task_done"    # phase_done | task_done

# 元数据
created_by: ""
created: "{{date}}"
updated: "{{date}}"

tags:
  - type/artifact
  - status/draft
  - role/
  - project/
  - module/
  - task/
  - goal/
---

# {{name}}

## 关联信息

- **所属任务**：[[{{task_id}}]]
- **产出角色**：{{role}}
- **所属项目**：{{project}}
- **业务模块**：{{module}}

## 内容

<!-- 产物正文内容 -->

## 审核记录

<!-- 审核意见和修改记录 -->

## 同步记录

- **目标路径**：{{sync_target}}
- **同步时间**：{{synced_at}}
- **同步状态**：{{status}}
