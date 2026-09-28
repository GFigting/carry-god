# 交接：生成 CLAUDE.md

## 集成结论

用户已验收并明确指示"提交并推送"。集成方式：Git 提交 + 推送到远端。

## 提交范围（仅本任务框架文件）

- `CLAUDE.md`（新增，最小薄指针，只指向 `AGENTS.md`）
- `scripts/check-all.mjs`（固定文件名白名单加入 `CLAUDE`，保留 `VERSION`）
- `core/naming-and-submission.md`（登记固定名称与"只路由不复制"定位）

工作区中其他未提交改动（`AGENTS.md`、`README.md`、`VERSION`、`core/continuous-learning.md`、
`scripts/check-task.mjs` 等）属于其他在途任务，不混入本次提交。

## 后续入口

- Claude 系 Agent 进入仓库由 `CLAUDE.md` 自动路由到 `AGENTS.md`。
- 若日后 `AGENTS.md` 口径调整，无需同步 `CLAUDE.md`（纯指针，无内容漂移风险）。
- 历史遗留：`check-all.mjs` 对 `.workbuddy/`、`designs/` 的命名告警未处理，属后续框架优化候选。
