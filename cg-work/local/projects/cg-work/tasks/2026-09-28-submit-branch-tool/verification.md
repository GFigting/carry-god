# 验证记录

## 自动化验证

- `node --test local/tools/submit-branch/submit-branch.test.mjs`：通过，6/6 项通过。
- 集成测试覆盖临时远端仓库的 fetch 基线、需求编号分支创建、显式删除测试文件、文档追加和仅链接 commit body。
- `node --test test/*.test.mjs`：环境受限未通过，38/39 通过；既有 `test/weekly-report.test.mjs` 引用了不存在的 `tools/weekly-report/weekly-report.mjs`，与本工具无关。

## 静态检查

- `git diff --check`：待本次跟踪文件提交前执行。
- standards_preflight：已人工检查协议字面量集中于参数校验，路径写入均经过仓库根目录校验。

## 未执行项

- 项目业务仓库的 Maven/前端完整验证：本次只新增本机工具，未改变业务仓库代码，工具的 `--verify full` 会列出 profile 并明确 skipped。
