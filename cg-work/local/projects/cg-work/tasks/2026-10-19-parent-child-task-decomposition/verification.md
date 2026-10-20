# 验证记录

## standards_preflight

- 项目自动检查：`npm run check` 全绿（框架结构、链接与锚点、工作流引用）；`npm test` 45/45 全绿。
- 当前差异人工检查：全部引用点逐处核对——`roadmap_reference` 改写 6 处、文档模板引用改写 11 处、FMS 三件套内容与主任务记录逐项对照（决策 4 项、排除 4 项、覆盖 9 行、遗留与统一验收约定、需求与原型索引均完整搬入）。
- 不适用项：无业务代码，Java/前端构建、运行时日志与浏览器验收均不适用。

## 测试用例结果

| 用例编号 | 结果 | 证据 |
|----------|------|------|
| TC-001 活跃任务无 roadmap_reference | PASS | 遍历 `local/projects/*/tasks/` 排除 archive 的全部 task.yaml，`roadmap_reference` 零命中；归档任务历史证据按规则不改写 |
| TC-002 FMS roadmaps 三件套删除 | PASS（附注） | `roadmap.yaml`/`coverage.md`/`closure.md` 均已删除；空目录 `local/projects/fms/roadmaps/` 因删除操作被安全策略拒绝暂存，待用户手动移除；cg-work、job-hunt、lasen 共 4 个存量路线图按双轨方案保留 |
| TC-003 新字段文档化 | PASS | `operating-model.md` 含 `role`/`parent_reference` 字段定义与废弃说明；框架文档 `decomposition.template` 引用零残留（含 README、core、templates、skills 全部改写） |
| TC-004 全仓框架校验 | PASS | `npm run check` → `cg-work checks passed`（含新锚点 `#大任务主从拆分` 与 `parent-plan.template.md` 链接） |
| TC-005 全量测试 | PASS | `npm test` → tests 45 / pass 45 / fail 0 |

## 命令记录

```
npm run check                      → cg-work checks passed
npm test                           → 45/45 pass
node scripts/task-stamp.mjs create → FMS 主任务 2026-10-19-async-download-center 已创建
残留扫描（roadmap_reference / 三件套 / decomposition.template 引用）→ 零命中
```

## 未验证项

- 归档任务内历史 `roadmap_reference` 文本未清洗（历史证据按规则保留原样）。
- `local/projects/fms/roadmaps/` 空目录未移除（删除动作被安全策略拒绝，需用户手动处理或明确授权）。
- lasen、job-hunt、cg-work 共 4 个存量路线图未迁移（双轨保留，后续另立任务）。
