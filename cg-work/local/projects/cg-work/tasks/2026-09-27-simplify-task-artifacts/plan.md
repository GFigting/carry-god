# 简化任务产物实施计划

## 目标

新增 `artifact_profile: compact`，让新任务以 `task.yaml` 加一个按意图选择的主产物完成交付，同时保留历史标准任务的旧文件引用校验。

## 设计

- `task.yaml` 增加可选 `artifact_profile: compact` 和 `artifacts.primary`。
- `artifacts.primary` 指向任务目录内唯一主产物，例如 `product.md`、`plan.md`、`review.md` 或 `research.md`。
- compact 任务进入 `review`/`done` 时只要求主产物存在；不强制 `review_reference`、`verification_reference`、`learning_reference` 或 `handoff_reference`。
- compact 任务仍要求 `next_user_action`，并将验证、学习和交接结论写入主产物或 task.yaml。
- 未声明 compact 的任务继续使用现有标准规则。

## standards_preflight

- `artifact_profile` 允许值仅为 `compact`，避免隐式改变历史任务语义。
- `artifacts.primary` 是相对任务目录的非自引用路径。
- 主产物文件名保持 kebab-case，并允许产品、计划、评审、调研等既有意图命名。

## 验证

- 新增 compact 任务通过校验，不提供旧的独立证据文件。
- compact 任务缺少主产物时被拒绝。
- 历史标准任务的旧引用门禁测试继续通过。
- 执行 `npm test`、`node scripts/check-all.mjs` 和任务校验。
