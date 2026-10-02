# 验证记录

| 检查 | 结果 |
|---|---|
| `node --test test/submission-rules.test.mjs` | 4/4 通过 |
| `node scripts/check-all.mjs` | 通过 |
| `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml` | 通过 |
| `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-29-project-submit-test-scope/task.yaml` | 通过 |
| `npm test` | 45/45 通过 |
| `git diff --check` | 通过；仅有既有换行符转换警告，无空白错误 |

## 差异检查

已检查核心提交规则、入口和工作流引用、版本号及回归测试；未删除任何实际项目测试或框架测试。
