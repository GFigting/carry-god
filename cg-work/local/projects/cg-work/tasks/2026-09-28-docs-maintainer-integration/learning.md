# 学习记录

## 观察

仅把技能文件放进 `skills/` 不足以保证工作流调用；技能索引负责可发现性，工作流 frontmatter 才提供条件加载入口。

## 结论

文档维护技能适合按 `documentation.impact` 条件加载，而不是设为所有开发任务的必需技能。将本地优化技能与上游镜像分开管理，可以避免本地规则改写导致镜像校验冲突。

## 去向

已固化到 `skills/docs-maintainer/SKILL.md`、`skills/README.md` 和工作流 README；后续新增文档维护能力应继续以技能正文为唯一执行规则来源。
