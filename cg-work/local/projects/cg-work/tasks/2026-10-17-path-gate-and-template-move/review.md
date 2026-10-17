# 审查

## 变更结果

1. `core/templates/` 建立，4 个模板 `git mv` 迁入并新增目录 `README.md`（索引 + 消费技能映射）。
2. 活跃引用 11 处文件同步至新路径：core/README、根 README（3 处）、local/README、project-context.md、check-all.mjs、feature-development.md、project-initialization / large-task-decomposition / product-management 三个 SKILL、project-roadmap 模板内部引用。
3. 移动造成的 2 处相对链接断链已修复（decomposition.template.md）。
4. 顺带修正 `core/project-context.md` 中 `product.roadmap_path` 残留的「以绝对路径登记」表述——该处是 `2026-10-17-remove-path-absolute-gate` 任务文档同步的漏改，校验器实际允许相对 `project.root_path` 解析，修正后与 L87/L102 及校验器行为一致。

## 审查意见

- 分类目标达成：core/ 根目录只剩规则正文与索引，模板归入 `templates/`，README 索引组已标注目录位置。
- 唯一来源未破坏：规则文件只引用路径，模板正文未复制；`core/templates/README.md` 只做索引。
- 历史证据边界：任务记录、归档、closure、需求包保留旧路径原样，与前序任务的审计记录不改写原则一致。
- 范围隔离：绝对路径校验移除由 `2026-10-17-remove-path-absolute-gate`（review 中）独立记录，本任务仅通过回归测试引用其结果，不重复记账。

## 集成决定

- 待用户验收本任务与 `2026-10-17-remove-path-absolute-gate`、`2026-10-16-core-context-merge` 后，按框架规则创建本地 commit：框架规则改动与 `local/projects/cg-work/` 任务记录分开提交，仅暂存本批任务涉及文件，不混入其他未提交改动；推送仍需单独授权。
- VERSION 升级在提交阶段统一判断（本批为规则结构调整与校验放宽，兼容性变更按语义化规则升次版本）。
