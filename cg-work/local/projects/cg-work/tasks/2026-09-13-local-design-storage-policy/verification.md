# 验证记录

## 2026-09-13

- `node scripts/check-all.mjs`
  - 结果：通过。框架目录、工作流引用、需求箱存在性和本地资料边界均通过检查。
- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-13-local-design-storage-policy/task.yaml`
  - 结果：通过。
- `node --check scripts/check-all.mjs` 与 `node --check scripts/check-skills.mjs`
  - 结果：通过。
- `node scripts/check-skills.mjs`
  - 结果：失败，报告既有登记镜像内容漂移；`baoyu-design` 不在镜像映射中，符合本次“框架本地化技能”决策。
- `git diff --check -- README.md VERSION core/framework-maintenance.md scripts/check-all.mjs scripts/check-skills.mjs skills/README.md skills/baoyu-design`
  - 结果：通过，未发现空白错误。
