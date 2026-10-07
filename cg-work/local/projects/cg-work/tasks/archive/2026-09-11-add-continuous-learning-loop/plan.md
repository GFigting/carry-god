# 持续学习闭环实施计划

## 变更地图

- 唯一规则来源：新增 `core/continuous-learning.md`，定义 v1 协议、记录格式、证据与提升边界。
- 核心与流程调用方：`core/operating-model.md`、`core/context-loading.md`、`core/framework-maintenance.md`、`workflows/README.md` 和 `local/README.md` 只链接或概述该唯一来源。
- 可观察实现：`scripts/check-task.mjs` 在 v1 任务进入 review/done 时检查 `learning_reference`；`test/check-task.test.mjs` 覆盖缺失引用的拒绝路径。
- 兼容性：未声明 `learning_protocol` 的历史任务不受影响；v1 任务采用新增字段和 `learning.md`。
- 版本：兼容新增能力，`VERSION` 从 1.6.3 升级到 1.7.0。

## 验收标准

1. 新任务能在执行、审查和收尾阶段记录并判定候选经验。
2. v1 任务在 review/done 时缺少学习记录会被校验器拒绝。
3. 旧任务在未声明协议时仍通过既有校验。
4. 规则有唯一来源，且不会要求自动提升未经验证的经验。
5. `npm test`、`node scripts/check-all.mjs`、任务校验和 `git diff --check` 通过。
