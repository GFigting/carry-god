# 原始需求：交付路径口径统一与档位概念澄清（2026-10-07）

## 原始需求

用户对框架轻量档/低风险/compact 相关文档的评审反馈（原文要点）：整体方向是对的，但有几处值得优先优化。

1. 先修正文档矛盾：`core/operating-model.md`、`workflows/feature-development.md` 和校验器都允许功能开发使用轻量档，但 `workflows/README.md` 和 `scripts/README.md` 仍写着"轻量档仅适用于缺陷"。统一为：`framework:bugfix` 与 `framework:feature-development` 均可使用 `execution_profile: lightweight`。
2. 区分三个容易混淆的概念：低风险变更（不进入任务状态机）、`execution_profile`（standard/lightweight）、`artifact_profile: compact`（证据文件组织方式）。明确 `compact` 不是第三种任务档位；补一张组合规则表，特别说明 `lightweight + compact` 是否允许。
3. 补充"升级"规则：低风险变更发现行为变化→新建 `pending` 任务；轻量任务发现跨模块、规则未决、迁移或不可逆操作→保留原 `task.yaml` 和历史，升级为标准档，补建计划、审查和验证记录；一旦产生可复用经验，轻量档升级为标准档。
4. 把主观条件改成决策清单："可逆的小功能""小任务""高风险"等改为明确升级触发器：是否跨模块；是否改变业务规则、接口、数据或权限；是否存在迁移、删除或不可逆写入；是否有未决业务决策；是否产生外部副作用。任一项为"是"，自动进入标准档。
5. 名称更准确：低风险变更不是任务状态机内的任务档位，总称从"任务档位"改为"交付路径"：免记录路径 → 轻量执行 → 标准执行，减少"低风险任务是否需要 task.yaml"的误解。

最优先处理第 1、2、3 项，它们直接影响实际执行和校验一致性。

## 范围

- 对齐 `workflows/README.md`、`scripts/README.md`、`core/continuous-learning.md` 与工作流正文的轻量执行适用范围表述。
- 在 `core/operating-model.md` 区分交付路径与两个声明字段，补组合规则表、轻量执行决策清单和交付路径升级规则。
- `scripts/check-task.mjs` 拒绝 `lightweight` 与 `artifact_profile: compact` 同时声明，补回归测试与文档一致性测试。
- 同步 `workflows/bugfix.md`、`workflows/feature-development.md`、`workflows/low-risk-change.md`、`local/README.md`、`AGENTS.md` 的措辞与引用。

## 非目标

- 不改变 `execution_profile`、`artifact_profile` 的字段取值和历史任务兼容行为。
- 不改变状态机、`lightweight_evidence` 既有字段要求和历史任务校验结果（除 lightweight+compact 组合外）。
- 不迁移历史任务记录，不改动镜像技能。
