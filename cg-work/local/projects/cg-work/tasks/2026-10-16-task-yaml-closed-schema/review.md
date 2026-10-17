# 审查：task.yaml 封闭 schema 重构

## 审查结论

通过。校验器从"废弃字段黑名单 + 逐字段专属拒绝"改为"封闭 allowlist"，历史专用分支全部删除，结构更简单且对未知字段零容忍。

## 发现与处理

| 发现 | 处理 |
|---|---|
| `confirmed_at` 被 js-yaml 解析为 Date 对象导致日期格式误报 | 放宽为接受有效 Date 或 `YYYY-MM-DD` 字符串，已修复 |
| `lightweight_evidence` 未知键检查在 `validateLightweightEvidence` 内重复 | 删除重复，统一由 `validateUnknownKeys` 覆盖 |
| 3 个 fms/lasen 任务残留 schema 外字段，但不在 `npm run check` 覆盖内 | 用 `node scripts/check-task.mjs` 单文件校验补正，4/4 通过 |
| `decisions` 此前从未被校验但规则文档在用 | 纳入 allowlist 并新增形状校验（name/detail 必填） |

## 边界确认

- 归档记录（`archived: true`）仍只校验 YAML 可解析，schema 校验位于 else 分支，完全不受影响
- 31 个 YAML 损坏的活跃任务与 archive 目录 125 个任务均未触碰（既有问题，非本次引入）

## 原型采纳

不适用（未声明 `prototype_reference`）。

## 遗留项

- `npm test` 中 `check-project.test.mjs` 的 2 个绝对路径断言失败为存量问题，与本次变更无关
- 约 33 个 YAML 损坏的活跃任务（job-hunt ~29 + lasen 4）待框架外部治理
