# Docs Maintainer Framework Integration Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with fresh verification after each task.

**Goal:** 将优化后的文档维护技能以 `docs-maintainer` 名称接入文档影响工作流。

**Architecture:** 保留技能正文作为唯一执行规则，在技能索引中登记其本地化属性；工作流只声明条件引用，不复制技能内容。条件触发由任务的文档影响评估和用户明确意图决定。

**Tech Stack:** Markdown、YAML、Node.js 校验脚本。

**Spec:** `local/projects/cg-work/requirements-inbox/2026-09-28-docs-maintainer-integration.md`

## Global Constraints

- 不修改上游镜像目录或 `scripts/check-skills.mjs` 镜像映射。
- 不使用 `git add .`，只处理本任务范围内的框架文件。
- 保留工作区中与本任务无关的已有修改。
- 每次规则或工作流变更后运行 `node scripts/check-all.mjs`。

---

## 计划审核

- 需求覆盖：重命名、技能优化、技能索引登记、条件工作流接入、版本更新和验证均有对应步骤。
- 范围检查：不改上游镜像、不强制加载所有任务、不触碰项目业务内容。
- 兼容性：旧目录尚未被镜像映射或工作流引用；本地名称变更只影响本次新增技能。
- 验收：使用框架结构检查、Markdown 链接检查、frontmatter/引用检查和差异审查验证。

## standards_preflight

- 需要保持一致的框架字面量：技能名 `docs-maintainer`、触发值 `documentation.impact: update/add` 和版本 `2.14.0`。
- 允许例外：技能 frontmatter、目录名和 `framework:` 引用必须重复使用 `docs-maintainer`，这是同一调用契约，不抽取运行时常量。
- 本次没有业务状态、接口、阈值或项目数据字面量；不新增代码常量。

## Tasks

### Task 1: 重命名并完善技能

**Files:**
- Rename: `skills/doc-keeper/SKILL.md` -> `skills/docs-maintainer/SKILL.md`
- Modify: `skills/docs-maintainer/SKILL.md`

**Steps:**

- [x] 将目录和 frontmatter 名称统一为 `docs-maintainer`。
- [x] 保留并核对文档发现、UTF-8、同步、质量门禁和收尾输出规则。
- [x] 确认正文没有上游镜像声明或项目业务数据。

**Verification:** 检查 frontmatter、目录命名和 Markdown 格式。

### Task 2: 登记技能并接入工作流

**Files:**
- Modify: `skills/README.md`
- Modify: `workflows/feature-development.md`
- Modify: `workflows/bugfix.md`
- Modify: `workflows/refactor.md`
- Modify: `workflows/review.md`
- Modify: `workflows/low-risk-change.md`
- Modify: `workflows/README.md`

**Steps:**

- [x] 将技能登记为框架本地化技能。
- [x] 在五个工作流的 `conditional_skills` 中添加唯一的 `framework:docs-maintainer` 引用。
- [x] 在工作流说明中明确文档影响为 `update/add` 或用户明确提出文档维护时加载。

**Verification:** 检查工作流引用不重复且均能解析到技能目录。

### Task 3: 更新版本和任务证据

**Files:**
- Modify: `VERSION`
- Modify: `local/projects/cg-work/tasks/2026-09-28-docs-maintainer-integration/task.yaml`
- Create: `local/projects/cg-work/tasks/2026-09-28-docs-maintainer-integration/review.md`
- Create: `local/projects/cg-work/tasks/2026-09-28-docs-maintainer-integration/verification.md`
- Create: `local/projects/cg-work/tasks/2026-09-28-docs-maintainer-integration/learning.md`

**Steps:**

- [x] 将版本从 `2.13.0` 升至兼容新增能力的 `2.14.0`。
- [x] 记录标准审查、验证事实、既有失败项和可复用经验。
- [x] 按任务状态机推进到 `review`，等待用户验收后再决定 `done`。

**Verification:** 运行 `node scripts/check-task.mjs`、`node scripts/check-all.mjs` 和定向链接/差异检查。

## Plan Self-Review

- 已覆盖需求包中的全部验收标准。
- 未包含 TBD、TODO 或未定义的实现步骤。
- 所有文件路径均相对于仓库根目录，且不包含用户业务目录。
