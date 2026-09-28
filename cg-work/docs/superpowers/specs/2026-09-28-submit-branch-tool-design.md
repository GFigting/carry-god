# 需求链接提交分支工具设计

## 目标

提供一个本地 CLI：用户给出需求链接和摘要后，工具在项目配置的仓库上从远端最新基线创建与需求编号一致的分支，执行用户指定的测试清理和文档整理，完成验证并创建规范的本地 Git commit。

## 范围与非目标

范围：

- 解析需求链接中的需求编号；链接本身不联网校验、不作为执行依赖。
- 按项目上下文选择仓库和默认基线；执行 `git fetch` 后从 `origin/<base>` 创建分支。
- 生成前端/后端约定的 commit 标题，支持需求号、任务号、类型和 scope。
- 显式删除指定测试文件，显式更新指定文档，并执行项目任务记录/验证检查。
- 默认只创建本地分支和 commit。

非目标：

- 不自动推送、合并、部署或创建 PR/MR。
- 不猜测需要删除的测试文件，不扫描并批量删除测试。
- 不解析需求网站正文，不替用户决定业务范围、修改文件或验证命令。

## CLI 契约

```text
node local/tools/submit-branch/submit-branch.mjs <requirement-url> \
  --summary <summary> \
  [--project lasen] \
  [--base prep-3.0] \
  [--scope fc] \
  [--type feat] \
  [--task-no T260928-008] \
  [--repo fc-backend] \
  [--remove-test <path>]... \
  [--update-doc <path>]... \
  [--doc-note <note>]... \
  [--verify targeted|full|none] \
  [--dry-run] \
  [--yes]
```

必填参数：

- `requirement-url`：原样保存到 commit body 和任务交接信息。
- `--summary`：commit 标题和任务摘要使用的中文描述。

默认值与规则：

- `--project` 默认 `lasen`。
- `--base` 默认 `prep-3.0`；显式传入时优先使用参数。
- `--project fms` 使用 FMS 项目上下文，默认基线为 `dev`、scope 为 `fms`；项目差异配置平铺在工具目录的 `project-defaults.mjs`，其他项目可通过项目上下文接入，并可用 `--base`、`--scope` 覆盖默认值。
- 分支名从 URL 中的 `reqNo` 参数提取，并要求形如 `R\d{6}-\d{3}`；无法提取时直接失败，用户可用 `--branch`（后续扩展）显式提供。
- `--type` 默认 `feat`，允许 `feat`、`fix`、`types`、`perf`、`refactor`、`docs`、`test`、`chore`。
- `--scope` 默认使用项目/仓库标识；显式传入时覆盖默认值。
- `--task-no` 存在时，commit 标题使用 `REQ(TASK)`；不存在时只使用需求号。
- `--verify` 默认 `targeted`；`none` 只允许 dry-run 或显式 `--yes`。

Commit 标题格式：

```text
<type>(<scope>): <requirement-no>[<task-no>] <summary>
```

Commit body 固定只包含需求链接：

```text
<requirement-url>
```

## 执行流程

1. 读取 `local/projects/<project>/project-context.yaml`，解析仓库清单和验证 profile。
2. 校验参数、需求编号格式、仓库路径和工作树状态；非 dry-run 时要求目标仓库没有未提交改动，避免覆盖用户工作。
3. 对每个目标仓库执行 `git fetch <remote> <base>`，读取远端基线 SHA。
4. 校验本地分支名未存在，创建 `<requirement-no>` 分支并指向远端基线。
5. 仅执行用户显式指定的测试删除和文档更新；所有路径必须位于对应仓库内。
6. 根据验证模式执行基础 diff 检查；`targeted` 标记通过，`none` 不执行验证，`full` 列出项目上下文 profile 并明确标记 skipped，避免擅自运行需要模块参数或交互环境的命令。
7. 输出变更摘要、验证结果、commit 预览；非 dry-run 时创建一个本地 commit。
8. 输出分支名、基线 SHA、commit SHA、需求链接和未执行的推送/合并动作；基线信息不写入 commit body。

## 安全与错误处理

- 任何 fetch、分支创建、删除文件或 commit 失败立即停止，不自动回滚用户已有改动。
- 删除测试前解析并确认每个目标为普通文件，且路径位于仓库目录；目录、仓库外路径和未列出的文件拒绝处理。
- 文档更新只写入显式指定的文件；`--doc-note` 以追加的变更记录段落写入，不覆盖正文。
- 需求链接只作为文本处理，避免触发联网、认证和外部副作用。
- dry-run 不修改文件、不创建分支、不执行 commit；输出完整执行计划。
- 远端推送和合并不在 CLI 默认流程中，后续若增加必须使用显式独立参数。

## 测试策略

- 单元测试覆盖参数解析、需求编号提取、commit 标题/body 生成、路径安全校验和 dry-run 行为。
- 集成测试使用临时 Git 仓库验证 fetch 基线、分支创建、指定测试删除、文档追加和 commit 生成。
- 工具本身执行 `node --test local/tools/submit-branch/*.test.mjs`；框架改动继续执行 `node --test test/*.test.mjs`。

## 自审结论

- 已覆盖用户确认的分支命名、最新基线、提交格式、测试清理和文档整理要求。
- 没有把需求网站访问、自动推送、自动合并或模糊删除纳入默认行为。
- 后续实现保持单入口 CLI，Git 操作、参数规则和文档/测试收尾逻辑拆成可单测函数。
