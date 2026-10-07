# 归档目录拆分审校与补正（compact 主产物）

日期：2026-10-07（核对方式：逐行核对 `scripts/archive-tasks.mjs`、`scripts/acceptance-queue.mjs`、`scripts/check-all.mjs` 与规则文档，并用探针实测）

## 范围

延续 `2026-10-07-task-archive-storage`（并行会话实现，已归档）：不重复实现，只做四点审校、补“引用迁移”需求说明、补正两处文档与校验的不一致。

## 四点审校结论

| 要点 | 实现 | 结论 |
|---|---|---|
| 目录布局 | 归档任务 → `tasks/archive/<task-id>/`；独占需求包 → `requirements-inbox/archive/` | 符合 |
| 引用迁移 | `relocateTaskReferences`：任务内相对引用加深一层（数组项 `- ../`、标量 `key: ../`），需求包入档时 `requirements_reference` 改指 `requirements-inbox/archive/` | 符合；实测我方任务被归档后引用自动修正且校验通过。需求说明已补该点 |
| 共享需求包保护 | 仅当引用计数（活跃任务引用数 − 本次归档数）为 0 且包位于 `requirements-inbox/` 根时才移动 | 符合；共享包保留原位 |
| 历史数据处理 | `--relocate-archived` 补做历史归档任务的目录迁移；`--include-requirements` 纳入需求包；`--before` 排除当天任务 | 符合；不删除证据、不改任务状态 |

## 补正的两处缺口

1. **`check-all` 归档巡检缺口**：规则写“`npm run check` 对归档记录只要求 YAML 可解析”，但 `check-all.mjs` 实际完全跳过 `tasks/archive/`（连解析都不做）。已改为对归档记录执行 `checkTaskRecord`（归档态即只查 YAML 可解析），并用探针验证：向 `tasks/archive/` 放入坏 YAML 能使 `npm run check` 失败，清理后恢复通过。
2. **归档 ≠ 验收的边界**：`archive-tasks.mjs` 默认 `--status review`，验收积压可以被归档（用户裁定保持现状），但归档任务不进验收队列、`--accept` 也不扫描 `tasks/archive/`。已在 `core/operating-model.md`「任务归档」成文：需验收的归档任务先恢复归档（移回 `tasks/<task-id>/`、移除归档元数据）再走验收队列；不恢复视为暂缓验收，Agent 不得代验收。

## 遗留决策（待用户裁定）

归档 review 任务的验收通道：目前唯一路径是“恢复归档后验收”。如需不恢复也能验收，需为 `scripts/acceptance-queue.mjs` 增加显式入口（如 `--include-archived` 或按 id 直接 `--accept` 归档记录）；属新能力，本次未擅自实现。

## 兼容性等级

随本批 `2.27.0`（minor）：补正均为文档与校验收敛，无字段变更、无历史迁移；`check-all` 新增的归档 YAML 巡检只可能报告既有损坏记录，不影响合规记录。

## standards_preflight

- 常量化判断：本次仅规则文字与校验分支调整，无新增业务字面量需要常量化。
- 静态检查：`npm run check`、`node --test "test/*.test.mjs"` 实际执行。
- 例外：无。

## 验证结论

| 命令 | 结果 |
|---|---|
| `npm run check` | 通过（含新增的归档 YAML 巡检） |
| 坏 YAML 探针（`tasks/archive/`） | 按预期报“任务记录必须是 YAML 映射对象”，清理后恢复通过 |
| `node --test "test/*.test.mjs"` | 90 tests / 90 pass / 0 fail |
| 归档后引用完整性 | 被归档任务的 `requirements_reference` 自动改写并通过 `check-task` |

当前差异人工检查：本任务仅修改 `core/operating-model.md` 归档段、`scripts/check-all.mjs` 归档巡检分支、需求说明一处条目；未触碰归档脚本本体、镜像技能或业务项目。

## 审查结论

审校覆盖用户列的四点，两个文档-校验不一致缺口已补正并实测；验收通道属新能力，按非目标留给用户裁定。无其他遗留风险。
