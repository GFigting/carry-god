# 实施方案：core 模板文件归档到 core/templates/

## 背景与目标

用户指令：「模板文件放到新增文件夹吧」。core/ 根目录混放规则正文与 4 个模板文件，模板独立成目录后 core/ 只剩规则与索引，分类更清晰。

绝对路径校验移除是同批次的另一条用户指令，已由独立任务 `2026-10-17-remove-path-absolute-gate` 记录与验收，本任务不重复记账（见 task.yaml `scope_decision`）。

## 变更清单

1. 新建 `core/templates/`，`git mv` 移入 4 个模板：
   - `project-context.template.yaml`
   - `decomposition.template.md`
   - `plan.template.md`
   - `project-roadmap.template.md`
2. 新建 `core/templates/README.md`：目录索引与各模板的消费技能（check-all 强制目录 README）。
3. 引用同步（活跃规则、索引、校验脚本、工作流与技能，共 10 处文件）：
   - `core/README.md`：索引改指 `templates/...`
   - `README.md`：3 处模板链接
   - `local/README.md`：2 处格式引用
   - `core/project-context.md`：模板创建引用
   - `scripts/check-all.mjs`：模板存在性检查路径
   - `workflows/feature-development.md`：plan 模板链接
   - `skills/project-initialization/SKILL.md`、`skills/large-task-decomposition/SKILL.md`、`skills/product-management/SKILL.md`
   - `core/templates/project-roadmap.template.md`：内部相对引用
4. 修复移动导致的相对链接断链（`decomposition.template.md` 内 2 处）。
5. 不改写：任务记录、归档任务、历史路线图 closure、原始需求包中的旧路径（审计记录保留原样）；`skills/qa-only` 为上游镜像不本地改写。

## 执行顺序

1. 移动模板 → 2. 新建目录 README → 3. 全仓库引用同步 → 4. `npm run check` 修断链 → 5. `npm test` 回归 → 6. 补证据并转 review。

## standards_preflight

遵循 core 规则：模板移动是路径调整，格式正文零改动；唯一来源原则下规则文件只引用路径不复制正文；归档与历史证据不改写。
