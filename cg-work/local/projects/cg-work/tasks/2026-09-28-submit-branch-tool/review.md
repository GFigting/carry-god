# 实现审查

## 结论

实现符合需求范围：工具只接受需求链接作为文本元数据，不联网校验；分支创建顺序为 fetch 基线 → 创建分支 → 清理/文档 → 验证 → commit；提交正文严格为单行需求链接。

项目接入：已支持 `--project fms`，从 FMS 项目上下文读取 `fms-server`、`fms-job`，并在未显式覆盖时使用 `dev` 基线和 `fms` scope；LASEN 默认值保持不变。

## 安全检查

- 已拒绝绝对路径、仓库外路径、非普通文件和已存在需求分支。
- 未显式提供的测试与文档不会被扫描、删除或修改。
- 默认不 push、merge、deploy 或创建 PR/MR。
- `local/tools/` 保持本机工具目录，不纳入框架提交。

## 遗留项

full 验证 profile 可能包含 `<TestClass>`、`<affected-files>` 或浏览器交互，需要使用者根据实际改动补参后执行；工具会明确返回 skipped，不将基础 diff 检查冒充完整验证。
