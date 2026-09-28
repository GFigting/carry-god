# 需求链接提交分支工具实施计划

> **For agentic workers:** 使用 inline execution 按步骤实施本计划。

**目标：** 实现一个 Node.js CLI，根据需求链接和摘要从远端最新基线创建需求编号分支，执行显式测试清理与文档整理，验证后生成规范本地 commit。

**架构：** 工具拆为纯函数参数/commit 生成模块与 Git/文件系统执行模块。CLI 只编排流程，所有危险动作都通过显式参数和路径安全校验进入；默认 dry-run 之外会创建本地分支和 commit，但不推送、不合并。

**技术栈：** Node.js ESM、node:test、Git CLI、js-yaml。

**规格：** `docs/superpowers/specs/2026-09-28-submit-branch-tool-design.md`

## 全局约束

- 分支名必须等于需求编号，例如 `R260921-001`。
- commit body 只能包含需求链接一行。
- 创建分支前必须 fetch 指定远端基线并记录实际 SHA。
- 删除测试类和更新文档必须由显式参数指定，禁止模糊扫描或仓库外路径。
- 默认不执行 push、merge、deploy 或 PR/MR 创建。

### Task 1: 参数与提交消息纯函数

**Files:**
- Create: `local/tools/submit-branch/submit-branch.mjs`
- Test: `local/tools/submit-branch/submit-branch.test.mjs`

- [x] 实现参数解析，支持 requirement URL、summary、project、base、scope、type、task-no、repo、remove-test、update-doc、doc-note、verify、dry-run、yes。
- [x] 实现需求编号提取、分支名校验、commit 标题生成和仅链接 body 生成。
- [x] 先写测试覆盖默认值、前后端带任务号格式、非法类型、非法需求号和 body 只有 URL。
- [x] 执行 `node --test local/tools/submit-branch/submit-branch.test.mjs`，确认测试先失败。

### Task 2: Git 与路径安全执行器

**Files:**
- Modify: `local/tools/submit-branch/submit-branch.mjs`
- Test: `local/tools/submit-branch/submit-branch.test.mjs`

- [x] 实现命令执行封装和 Git 状态读取，拒绝目标仓库存在未提交改动的情况。
- [x] 实现 fetch 基线、读取远端 SHA、校验分支不存在和创建新分支。
- [x] 实现删除测试文件与文档追加，校验所有路径位于仓库根目录且目标类型正确。
- [x] 实现 dry-run，确保不触发文件写入、分支创建和 commit。
- [x] 使用临时 Git 仓库补充集成测试，覆盖最新基线、分支创建、删除指定测试、文档追加和 commit body。

### Task 3: 项目上下文与验证编排

**Files:**
- Modify: `local/tools/submit-branch/submit-branch.mjs`
- Modify: `local/tools/submit-branch/README.md`
- Test: `local/tools/submit-branch/submit-branch.test.mjs`

- [x] 读取 `local/projects/<project>/project-context.yaml`，解析仓库清单和验证 profile。
- [x] 支持 `--repo` 选择仓库，默认按项目上下文处理；保留 Windows 登记路径并解析为本地路径。
- [x] 实现 targeted/full/none 验证选择，输出每个命令的状态和限制。
- [x] 文档 README 增加安装前提、命令示例、commit 格式、删除测试/整理文档参数和安全边界。
- [x] 运行工具测试、任务校验和差异检查；框架全量测试留待集成窗口执行。

### Task 4: 收尾审查与本地提交

- [x] 复核规格覆盖、提交正文、分支命名、基线 SHA、删除范围和文档变更。
- [x] 保持工具在本机 `local/tools/`；不推送、不合并。
- [x] 输出分支名、基线 SHA、验证结果和未执行的外部动作。
