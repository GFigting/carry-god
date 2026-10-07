# 审查记录

## 范围

- `baoyu-design` 的本地化技能归类与设计产物目录约定。
- `core`、README、技能索引、镜像校验说明和 `check-all` 的一致性。

## 结论

未发现本次范围内的阻塞问题。

- `core/framework-maintenance.md` 是技能类别、设计目录与迁移规则的唯一来源；README 和技能索引只作直接说明。
- `scripts/check-all.mjs` 仍校验框架目录、工作流引用和项目需求箱存在性，但不再将 `local/` 中的项目资料当作框架命名对象，因此 `_d_meta.json` 和中文需求包不会误报。
- `baoyu-design` 明确属于框架本地化技能，未加入原始镜像映射；`check-skills` 继续只检查登记的原始镜像。
- 目录协议由 `designs/` 改为 `local/projects/<project-id>/design/`，已升级主版本并保留手工迁移说明。

## 已知非目标

- `scripts/check-skills.mjs` 仍报告既有原始镜像漂移；本次不修改这些镜像内容或其上游来源。
