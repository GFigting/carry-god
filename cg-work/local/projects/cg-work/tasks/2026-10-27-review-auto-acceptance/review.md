# 任务提交后自动验收审查记录

## 审查结论

通过。自动验收门禁按 D0-D3 确认口径落地：

- 唯一来源 `core/operating-model.md`：收尾第 6 步改为统一门禁（四条件 + 强制留痕 + 主任务除外）；状态机 `done` 定义、「待验收清单与批量验收」节、大任务主从拆分节同步改写，无第二正文来源。
- 同步点：README 步骤 8 改指针表述；`workflows/review.md`、`workflows/framework-optimization.md` 改为指向门禁；`core/framework-maintenance.md` 提交触发条件改「验收（自动验收或用户验收）」；框架可视化页状态机门禁要点同步。
- 旧口径「轻量自动完成例外」「其他任务必须完成用户验收」在活跃规则正文零残留（归档任务审计记录保留原文，不改写）。

## 测试处理

规则层变更，无新增自动化测试需求；既有 `npm test` 51 项（含 acceptance-queue 契约）全绿，脚本行为未改动，无需调整断言。

## 文档同步

README、core、workflows、VERSION（2.34.0→2.35.0）、框架可视化页均已同步；`skills/README.md` 与 `workflows/README.md` 相关表述核对无冲突。

## 遗留项

- 并行会话批量验收写入其他任务的状态历史（理由「除序号 7 和 19 外全部已完成」）归属该会话收尾，本任务不代其提交。
- 本任务创建初期 task.yaml 曾被该批量写入误污染一条 done 历史，已删除还原（时间早于 created_at，不可能属于本任务生命周期）。

## 集成决策

本地 commit 两条：规则改动（README/core/workflows/VERSION）与 cg-work 受管记录（任务四件套 + 可视化页文案）分开提交；不推送。
