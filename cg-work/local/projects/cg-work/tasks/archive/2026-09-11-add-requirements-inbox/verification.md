# 验证记录

时间：2026-09-11

## 自动化验证

```powershell
npm test
node scripts/check-all.mjs
node scripts/check-project.mjs local/projects/cg-work/project-context.yaml
node scripts/check-project.mjs local/projects/fms/project-context.yaml
node scripts/check-project.mjs local/projects/lasen/project-context.yaml
git diff --check
```

结果：8 个测试全部通过；框架全量校验通过；cg-work、FMS 和 LASEN 项目上下文均通过；未发现 diff 空白错误。

## 忽略边界验证

使用 `git check-ignore -v --no-index` 验证：

- `requirements-inbox/README.md` 命中否定规则，可提交。
- `requirements-inbox/raw-requirement.md` 仍被项目内容规则忽略。
- `project-context.yaml` 仍被项目内容规则忽略。
