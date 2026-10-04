# 需求包：工作流正文收敛与模板唯一化

- 日期：2026-10-02
- 来源：用户对"工作流与产物判定"的确认，执行工作流合并与模板合并两项
- 状态：原始需求，未拆分

## 原始诉求

按实测使用分布收敛工作流正文与模板：`refactor`（9 条）与 `feature-development` 高度重叠；`review` 工作流仅 1 条使用且正文与 operating-model 重复；`low-risk-change` 正文大半在复述 operating-model；路线图格式分散在两个模板文件。

## 实测依据

- 工作流使用：feature-development 53、bugfix 31、framework-optimization 27、refactor 9、project-initialization 3、large-task-decomposition 2、review 1、low-risk-change 0、project-discovery 0。
- 9 条任务记录的 `workflow` 字段为 `framework:refactor`，1 条为 `framework:review`：**删除工作流文件会让这些记录变成"未知工作流"**。
- `review.md` 正文与 `operating-model.md#review-阶段统一收尾`、`naming-and-submission.md#原项目提交口径` 重复。

## 约束

- 不得让任何现有任务记录失效：工作流 id 必须保留。
- 不得降低门禁：只搬移正文，不改判定条件。
- 模板文件被历史任务引用，不得直接删除；按框架维护规则保留替代说明。
- 前缀语义只做澄清，不做全量改名（理由见计划）。
