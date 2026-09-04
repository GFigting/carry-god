---
type: work-type
work_id: ""
name: ""
category: ""
complexity: []
typical_duration: ""

# 流程映射
lifecycle_states: []
default_process: ""

# 角色参与 (R=Responsible, A=Accountable, C=Consulted, I=Informed)
roles_required: []
roles_optional: []
primary_owner: ""

# 子任务结构
subtask_types: []

# 输入输出物
inputs: []
outputs: []

# 质量门禁
quality_gates: []

tags:
  - type/work-type
  - work/
created: "{{date}}"
updated: "{{date}}"
---

# {{title}}

## 概述
<!-- 一句话描述此类工作的本质 -->

## 生命周期
<!-- 此类工作从开始到结束经历的状态序列 -->
```mermaid
graph LR
    A[开始] --> B[进行中] --> C[审核] --> D[完成]
```

## 典型子任务结构
<!-- 此类工作通常如何拆解为子任务 -->

## 必需角色与职责 (RACI)
| 角色 | 参与方式 | 职责说明 |
|------|----------|----------|
| | R | |

## 输入物清单
| 输入物 | 提供方 | 必需/可选 |
|--------|--------|-----------|
| | | |

## 输出物清单
| 输出物 | 接收方 | 完成标准 |
|--------|--------|----------|
| | | |

## 质量门禁 (Quality Gates)
<!-- 完成前必须通过的检查点 -->
1.
2.
3.

## 关联流程
- 默认流程：[[{{default_process}}]]
- 相关流程：

## 常见风险与应对
| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| | | | |
