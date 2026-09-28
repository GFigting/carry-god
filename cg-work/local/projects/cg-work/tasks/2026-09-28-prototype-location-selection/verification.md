# 验证记录

## standards_preflight

- 变更范围：核心规则、上下文模板、项目校验器、原型技能和对应测试。
- 兼容性检查：`prototypes` 可选；既有上下文无需迁移；现有原型引用门禁未改变。
- 文档同步：README、框架维护规则、上下文加载规则和技能正文一致。

## 新鲜验证

- `node --test test/check-project.test.mjs`：通过，9/9。
- `npm test`：通过，41/41。
- `node scripts/check-all.mjs`：通过。
- `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`：通过。
- `node scripts/check-project.mjs local/projects/job-hunt/project-context.yaml`：通过。
- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-28-prototype-location-selection/task.yaml`：通过。
- `git diff --check -- README.md core/context-loading.md core/framework-maintenance.md core/project-context.template.yaml scripts/check-project.mjs skills/prototype/SKILL.md test/check-project.test.mjs`：通过。

## 环境限制

当前 `job-hunt` 项目路径下未发现 `prototypes/` 目录，因此未执行真实多页面原型入口运行验收；测试使用临时项目目录验证登记和路径校验行为。
