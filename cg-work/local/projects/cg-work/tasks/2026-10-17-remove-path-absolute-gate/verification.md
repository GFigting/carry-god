# 验证证据

## 自动检查

- `node --test test/check-project.test.mjs` → **11/11 通过**（原 2 个失败用例「接受登记项目仓库内原型路径和入口」「接受相对 project.root_path 的项目路径」恢复通过）
- `npm test` → **tests 45 / pass 45 / fail 0**，全量通过，此前 2 个存量失败随校验移除一并消除
- `npm run check` → `cg-work checks passed`（框架结构、链接锚点、受管任务记录全绿）

## 规则一致性扫描

全仓（README、core/、workflows/、skills/、scripts/、test/）检索 `绝对路径`：

- 保留的约束均为仍有校验支撑：`project.root_path` 必须绝对或 `.`（check-project.mjs:43）、`repositories[].root_path` 必须绝对（:149）、无 base 字段（`submission.instructions`）必须绝对（:276）、`product.roadmap_path` 登记约定；
- 已清除的旧表述：「除 `cg-work` 外…使用绝对路径」在 project-context.md、documentation-standards.md、template、project-initialization SKILL、README 中的 5 处均已改写为「绝对路径或相对 `project.root_path` 解析的路径」。

## 行为边界

- 相对路径存在性仍被检查（解析不到 `project.root_path` 时报「无法校验」而非放行）；
- `requirements.inbox_path` 仍必须指向 basename 为 `requirements-inbox` 的目录且存在；
- 测试夹具未修改，2 个原失败由校验放宽自然恢复，不改断言迁就实现。
