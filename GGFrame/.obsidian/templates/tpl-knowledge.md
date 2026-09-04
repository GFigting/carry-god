---
type: knowledge
id: ""                           # 自动生成: KNOW-{YYYY}-{NNN}
title: ""                        # 简洁描述，如 "Go 项目分层架构规范"
domain: ""                       # frontend | backend | infrastructure | data | security | mobile | business | general
topic: ""                        # 主题关键词，用于搜索和索引
maturity: draft                  # draft → verified → adopted → deprecated
source: ""                       # 来源任务ID，如 "TASK-2026-001"
author: ""                       # 创建者
related_roles: []                # 关联角色ID列表，如 ["ROLE-后端开发工程师"]
related_work_types: []           # 关联工作类型ID列表，如 ["WT-新功能开发"]
needs_review: false              # 是否需要人工审核

tags:
  - type/knowledge
  - domain/{领域}                 # 必须替换为实际领域，支持多领域多行
created: "{{date}}"
updated: "{{date}}"
---

# {{title}}

## 概述
<!-- [Agent 填写] 1-2 句话概括核心内容。说明这篇知识解决什么问题、给谁看的。 -->

## 背景
<!-- [Agent 填写] 为什么需要这篇知识？解决过什么实际问题？避免过什么坑？ -->

## 核心内容
<!-- [Agent 填写] 知识主体。避免空洞的提纲，必须包含可操作的指导。
     规范类：给出正例 ✅ 和反例 ❌
     方案类：给出决策理由和权衡分析
     故障类：给出时间线 + 根因 + 改进措施
     调研类：给出对比表格和结论 -->

## 适用场景
<!-- [Agent 填写] 什么情况下可以参考这篇知识？什么情况下不适用？ -->

## 注意事项
<!-- [Agent 填写] 已知的限制、边界条件、踩过的坑。如果有与之冲突的其他知识，在此说明。 -->

## 关联资源
<!-- [Agent 填写] 相关文档的内部链接、外部参考 URL、关联的任务文件 -->
-

---

## Agent 使用指引

### 何时创建知识文档
参考 `知识沉淀/AGENT.md` 中的「知识归档决策矩阵」。简记：
- 技术调研 → `技术调研/`
- 故障处理 → `经验教训/`
- 可复用方案 → `技术文档/`
- 新规范约定 → `最佳实践/`
- 外部参考 → `外部资源/`

### 字段填写规则
| 字段 | 规则 | 示例 |
|------|------|------|
| `id` | `KNOW-{YYYY}-{自增序号}` | `KNOW-2026-001` |
| `domain` | 从 6 个标准领域 + general 中选择 | `backend` |
| `maturity` | 新建一律 `draft`，验证后升级 | `draft` |
| `source` | 必填，关联到具体任务ID | `TASK-2026-003` |
| `related_roles` | 可选，关联角色ID | `["ROLE-后端开发工程师"]` |
| `related_work_types` | 可选，关联工作类型ID | `["WT-新功能开发"]` |
| `needs_review` | 复杂/关键知识设为 `true` | `false` |
| `tags` | 必须包含 `type/knowledge` 和 `domain/{领域}` | `domain/backend` |

### 内容质量门禁
- [ ] Frontmatter 所有必填字段已填写
- [ ] 核心内容包含可操作的指导（不只有提纲）
- [ ] 适用场景和注意事项已说明
- [ ] 关联资源至少填写一项（任务来源或其他文档）
- [ ] 文件名符合 `BP-{主题}.md` 或 `{主题}.md` 规范
