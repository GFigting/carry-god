# 验证证据

| 检查 | 结果 | 证据 |
|---|---|---|
| 任务记录校验 | 通过 | `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-15-proportionate-bugfix-workflow/task.yaml` 退出码 0。 |
| 框架测试 | 通过 | `npm test`：23 passed、0 failed；既有轻量缺陷校验回归全部通过。 |
| 新工作流结构 | 通过 | `node scripts/check-all.mjs` 已读取 `workflows/low-risk-change.md`；未报告工作流 frontmatter、技能引用或 Markdown 链接问题。 |
| 差异完整性 | 通过 | `git diff --check` 退出码 0。 |
| 全量框架结构校验 | 环境遗留阻塞 | `node scripts/check-all.mjs` 仍报告执行前已存在的 `.obsidian`、`.playwright-mcp`、`.workbuddy` 和 `designs/` 目录命名/README 问题；本次未修改这些目录。 |

## 验收映射

- 不新建 task：`AGENTS.md`、`README.md`、上下文加载与功能/缺陷入口均在建 task 前路由至 `framework:low-risk-change`。
- 不强制测试：工作模型和低风险工作流明确免除自动化测试，只保留与改动相称的 lint、页面验收或文档检查。
- 不扩大豁免：工作模型明确排除业务逻辑、交互、路由、接口、数据、权限、配置语义、依赖和外部副作用；发现这些情况必须切回标准工作流。
- 既有轻量缺陷不回退：`npm test` 的 23 项检查全部通过。
