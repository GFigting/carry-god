# 审查结论

## 变更结果

1. `scripts/check-project.mjs` 移除 `allowRelativePaths`（`projectId === 'cg-work'`）开关：业务项目登记路径与 `requirements.inbox_path` 允许相对 `project.root_path` 解析并做存在性检查，不再强制绝对路径。
2. 保留仍有意义的绝对路径约束：`project.root_path`、`repositories[].root_path`、无解析基准的 `submission.instructions`。
3. 规则文档 5 处同步改写（project-context.md、documentation-standards.md、project-context.template.yaml、project-initialization SKILL、README），规则正文与校验器行为一致。
4. 测试零改动：原 2 个存量失败（`check-project.test.mjs`）由校验放宽自然恢复，`npm test` 45/45。

## 审查意见

- 移除的是「已有 `root_path` 解析基准却仍强制绝对路径」的冗余校验，语义无损失：路径存在性、需求箱目录名、根路径可解析性检查全部保留。
- 规则、模板、技能、README 的旧表述已全部同步，不留「文档要求绝对、校验放行相对」的双重标准。

## 集成决定

- 本地 commit：校验器与规则文档同步提交；本任务记录归 `local/projects/cg-work/` 任务提交，与工作区中前序任务的未提交改动分开，不混入。
- 等待用户验收后再标记 `done`。
