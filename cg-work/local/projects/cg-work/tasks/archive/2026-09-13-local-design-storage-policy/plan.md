# 本地设计产物目录变更地图

## 事实与范围

- `baoyu-design` 已在 `skills/baoyu-design/` 中按 cg-work 规则修改，不能再被宣称为不可改的上游镜像。
- 原型和设计资产应位于 `local/projects/<project-id>/design/<design-name>/`，属于项目本地资料，不应受框架文件命名检查限制。
- 不修复既有镜像漂移；不改变业务项目的需求箱内容；不移动其他项目的本地资料。

## 唯一来源与调用方

| 规则 | 唯一来源 | 直接调用方 |
| --- | --- | --- |
| 设计产物目录 | `skills/baoyu-design/SKILL.md` | `system-prompt.md`、harness 参考、内置设计流程 |
| 本地资料不参与框架命名检查 | `scripts/check-all.mjs` | `node scripts/check-all.mjs` |
| 技能维护类型 | `core/framework-maintenance.md` | `skills/README.md`、`scripts/check-skills.mjs` |
| 兼容性与迁移 | `core/framework-maintenance.md` | `README.md`、本任务记录 |

## 决策与兼容性

- 将 `baoyu-design` 定义为“框架本地化技能”：可以保留上游设计方法，但 cg-work 的目录、任务记录和预览规则由框架维护；它不加入上游镜像哈希校验。
- 根目录 `designs/` 不再是新设计的输出位置。已有文件不自动迁移；需要时人工移入对应 `local/projects/<project-id>/design/` 并更新任务引用。
- 这是破坏性目录协议变化，版本从 `1.7.0` 升级到 `2.0.0`。

## 实施与验证

1. 补充 core、README、技能索引的本地化技能与目录迁移说明。
2. 让 `check-all` 跳过全部 `local/` 下资料的框架命名检查，保留项目上下文和需求箱存在性检查。
3. 在 `check-skills` 的维护规则说明中明确仅核验登记镜像；不登记本地化技能。
4. 运行框架全量校验、任务校验、技能语法检查，并记录任何既有镜像漂移。
