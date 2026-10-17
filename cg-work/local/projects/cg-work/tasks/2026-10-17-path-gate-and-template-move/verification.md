# 验证

## 结构校验

- `npm run check`（`node scripts/check-all.mjs`）：通过（`cg-work checks passed`）。
  - 首轮暴露 2 个移动导致的断链（`core/templates/decomposition.template.md` 指向 skills 与 operating-model 的相对路径），修正后复跑通过。
  - `check-all.mjs` 的模板存在性断言已同步为 `core/templates/project-context.template.yaml`。

## 测试回归

- `npm test`：`tests 45 / pass 45 / fail 0`。
  - 本任务未改动任何测试文件；原 `check-project.test.mjs` 的 2 个存量失败已由 `2026-10-17-remove-path-absolute-gate` 任务的校验器修改消除，本次回归确认全绿。

## 引用残留扫描

- 全仓库（core/workflows/skills/scripts/test/根 README/local/README）检索 `core/(project-context|decomposition|plan|project-roadmap).template`：0 命中。
- 不改写范围（有意保留旧路径）：`local/projects/cg-work/tasks/**`（含归档）、`roadmaps/*/closure.md`、`requirements-inbox/**`（原始需求与历史证据）；`skills/qa-only` 为上游镜像。

## 内容无损

- `git mv` 保留文件历史；4 个模板除 `decomposition.template.md` 与 `project-roadmap.template.md` 内部的相对链接目标外，格式正文零改动。
