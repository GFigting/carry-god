# 验证记录

## 自动检查

- `npm run check`（`node scripts/check-all.mjs`）：通过，输出 `cg-work checks passed`。覆盖框架结构、kebab-case 命名、目录 README、全仓库 Markdown 链接与锚点、工作流技能引用、cg-work 受管任务 YAML 可解析性。
- `npm test`（`node --test test/*.test.mjs`）：45 项，43 通过，2 失败。
  - 失败项：`test/check-project.test.mjs` 的「接受登记项目仓库内原型路径和入口」「接受相对 project.root_path 的项目路径」，均为 `check-project.mjs` 路径校验存量问题，与本次 core 文件合并无交集（本任务未改 `check-project.mjs` 及其夹具）。
  - 本任务直接相关的三个测试文件全部通过：`project-discovery.test.mjs`（识别门禁与三分类）、`entry-routing.test.mjs`（AGENTS 路由覆盖 project-context.md）、`requirement-package-policy.test.mjs`（需求箱手动添加口径）。

## 定向检查

- 残留引用扫描：全仓库检索 `context-loading|project-onboarding|project-context-fields`，框架内容（`*.md`、`core/`、`workflows/`、`skills/`、`scripts/`、`test/`、`AGENTS.md`、`local/README.md`、受管上下文）零命中；剩余命中仅在 `local/` 历史任务与需求包叙述中，属审计记录，按框架维护规则不改写。
- 内容无损：三份被合并文件的规则正文全部进入 `core/project-context.md`（识别与初始化门禁 / 项目关联不变量 / 字段规范 / 加载规则四节），重复段仅指针化；`documentation` 子类别清单从 documentation-standards 迁入 project-context.md 字段规范，未随去重丢失。

## 环境限制

- 无。本任务为纯文档与测试引用重构，不涉及业务仓库、运行时或浏览器验收。
