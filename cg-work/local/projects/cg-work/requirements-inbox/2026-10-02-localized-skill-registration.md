# 需求包：本地化技能登记与声明

- 日期：2026-10-02
- 来源：2026-10-02 check-skills 换行符宽容化任务验证时发现的真实差异（用户确认继续处理待办）
- 状态：原始需求，未拆分

## 原始诉求

镜像校验在消除换行符噪声后，暴露出 3 处真实差异，全部来自 `prototype` 技能；核实为该技能已被本地化，却仍登记为原始镜像。要求按框架维护规则修正登记，并补齐本地化技能一直缺失的正文声明。

## 事实依据

- `skills/prototype/SKILL.md` 含 cg-work 特有规则（存储位置选择、实现契约要求、指向 `core/prototype-implementation-contract.template.md`），与上游 `skills/skills/engineering/prototype` 已有 8 处新增、6 处调整；`LOGIC.md`、`UI.md` 同样有差异。
- `core/framework-maintenance.md` 规定：框架本地化技能可以复用上游方法，但必须在技能正文声明本地覆盖规则与其唯一来源；原始镜像必须登记并做哈希校验。
- 现状：`scripts/check-skills.mjs` 把 `prototype` 列为原始镜像；`code-review`、`grilling` 被排除但正文无本地化声明；全框架检索"本地覆盖/本地化/localized"无任何匹配。
- 该错误长期被 65 处换行符假阳性掩盖——噪声检查会藏住真实错误。

## 约束

- 不得把本地化技能继续当作原始镜像校验，也不得为此放宽任何镜像检查。
- 不逐字节改写镜像正文；只增加声明，不改变上游方法语义。
- 不新增"技能分类登记表"之类需要人工逐条维护的机制。
