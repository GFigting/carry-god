# 审查记录

审查基线：用户评审反馈 5 项（需求包 `../../requirements-inbox/2026-10-07-delivery-path-consistency.md`）、`core/operating-model.md` 与 `scripts/check-task.mjs` 的实际行为。

## 结论

通过。P1-P5 全部落地，文档表述与校验器行为逐条对齐，并由新增测试钉住防回归。

## 逐项核对

| 反馈项 | 处理 | 核对结论 |
|---|---|---|
| P1 文档矛盾 | `workflows/README.md`、`scripts/README.md`、`core/continuous-learning.md` 统一为 bugfix 与 feature-development 均可 lightweight | 与 `check-task.mjs` 允许集合一致；“仅限 bugfix”字样已清零（测试断言） |
| P2 三概念与组合表 | `core/operating-model.md` 新增「交付路径与两个声明字段」+ 组合规则表 | `compact` 明确为证据组织方式而非执行档位；`lightweight + compact` 明确不允许并由校验器拒绝 |
| P3 升级规则 | 新增「交付路径升级」：免记录→标准新建 `pending`；轻量→标准原 `task.yaml` 内升级并补建计划/审查/验证；产生可复用经验即升级 | 与用户要求一致；与 `continuous-learning.md` 的学习协议升级要求互相引用不重复 |
| P4 决策清单 | 新增五项升级触发器，任一“是”自动进入标准执行；bugfix/feature-development 的“小功能/可逆”改引清单 | 主观措辞已从适用条件正文移除 |
| P5 命名 | 总称改“交付路径”：免记录路径 → 轻量执行 → 标准执行（AGENTS.md、local/README.md、workflows/README.md 同步） | 字段取值 `standard`/`lightweight`/`compact` 未改，历史记录零迁移 |

## 决策与遗留

- **决策点（可由用户推翻）**：`lightweight + compact` 定为不允许并由 `check-task.mjs` 拒绝。理由：轻量执行已是“单条 `task.yaml` 合并证据”，compact 的主产物门禁与之冲突。若用户裁定允许，删除该条校验与组合表对应说明即可。
- **兼容性**：修订级别（`2.26.1`）；历史任务校验结果除上述组合外不变，无记录使用该组合。
- **遗留**：`scripts/README.md` 已如实注明 standard+compact 不强制 `standards_preflight`（校验器现状）；是否进一步让 compact 主产物也强制该段落，留待后续单独决策，本次不扩范围。
- **集成**：工作区存在其他并行任务的未提交改动，本任务文件与之部分重叠（`core/operating-model.md`、`scripts/README.md`、`scripts/check-task.mjs`、`test/check-task.test.mjs`）；提交时须按 framework-maintenance 仅暂存本任务涉及的框架文件并与规则改动分笔提交，无法安全拆分时保持 `review` 并报告。
