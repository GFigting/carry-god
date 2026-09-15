# 验证记录

## 官方来源

- Google Java Style Guide：`https://google.github.io/styleguide/javaguide.html`。已读取其关于命名、格式化、注释/Javadoc 的规范结构及“可选格式示例不应被强制”的说明。
- Google TypeScript Style Guide：`https://google.github.io/styleguide/tsguide.html`。已读取其关于可读性、命名、模块导入和规范性措辞的说明。
- Alibaba P3C 官方仓库：`https://github.com/alibaba/p3c`，其 README 明确指向《Alibaba Java Coding Guidelines》英文版 `https://alibaba.github.io/Alibaba-Java-Coding-Guidelines/`，并列出如 `@Override`、`equals`/`hashCode` 等 Java 工程规则。

## 框架校验

- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-15-project-code-standards/task.yaml`
  - 通过。
- `node scripts/check-all.mjs`
  - 通过（`cg-work checks passed`）。
- `git diff --check`
  - 通过；仅输出已有工作区文件的 LF/CRLF 提示，未报告空白错误。

## 2026-09-15 · 实施阶段应用修订

- `core/project-code-standards.md` 已包含计划前、编码时、提交前三个应用时机；`core/context-loading.md` 明确该规则不局限于最终审查。

## 2026-09-15 · 规范来源与任务证据

- 回归测试先新增“登记不存在的 `coding_standards.files` 路径必须被拒绝”的用例；在校验器支持该字段前，测试如预期失败（校验错误地返回退出码 0）。
- 实现后执行 `node --test test/check-project.test.mjs`：`6` 个测试通过，`0` 个失败；其中新用例确认已登记但不存在的规范文件被拒绝。
- `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`：通过，验证本框架项目已登记的 `AGENTS.md` 与 `core/project-code-standards.md` 路径。
- `node scripts/check-all.mjs`：通过（`cg-work checks passed`）。
- `git diff --check`：通过；仅有已有工作区的 LF/CRLF 提示，未报告空白错误。

## 2026-09-15 · 格式化、注释与提交门禁

- `node --test test/check-project.test.mjs`：`6` 个测试通过，`0` 个失败。
- `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`：通过。
- `node scripts/check-all.mjs`：通过（`cg-work checks passed`）。
- `git diff --check`：通过；只有 LF/CRLF 提示，未报告空白错误。
