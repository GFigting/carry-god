---
type: tool-manual
tool_id: "UTIL-002"
tool_name: "Git操作手册"
category: "版本控制"

tags:
  - type/tool-manual
  - tool/git
created: "2026-05-24"
updated: "2026-07-14"
---

# Git 操作手册

## 常用命令

### 分支管理

| 场景 | 命令 | 说明 |
|------|------|------|
| 创建分支并切换 | `git checkout -b feat/xxx` | 从当前分支创建新分支并切换过去 |
| 查看所有分支 | `git branch -a` | 列出本地和远程所有分支 |
| 删除本地分支 | `git branch -d feat/xxx` | 安全删除（已合并的分支） |
| 强制删除本地分支 | `git branch -D feat/xxx` | 强制删除（即使未合并） |
| 删除远程分支 | `git push origin --delete feat/xxx` | 删除远程分支 |
| 重命名分支 | `git branch -m old-name new-name` | 重命名当前所在分支 |
| 查看已合并到当前分支的分支 | `git branch --merged` | 方便清理已合并分支 |
| 查看未合并到当前分支的分支 | `git branch --no-merged` | 检查是否有遗漏的分支 |
| 设置分支上游 | `git push -u origin feat/xxx` | 首次推送并建立追踪关系 |

### 合并与变基

| 场景 | 命令 | 说明 |
|------|------|------|
| 合并分支（保留历史） | `git merge feat/xxx` | 将 feat/xxx 合并到当前分支，生成 merge commit |
| 合并分支（快进） | `git merge --ff-only feat/xxx` | 仅当可以快进时才合并，避免额外 commit |
| 合并并压缩 | `git merge --squash feat/xxx` | 将所有提交压缩为一个，不自动 commit |
| 变基到主干 | `git rebase main` | 将当前分支的提交重新应用到 main 最新节点之后 |
| 交互式变基 | `git rebase -i HEAD~3` | 对最近 3 个 commit 进行合并、编辑、重排 |
| 变基冲突后继续 | `git rebase --continue` | 解决冲突后继续变基 |
| 变基冲突后放弃 | `git rebase --abort` | 放弃变基恢复到变基前状态 |
| 将 feature 分支变基到 main | `git checkout feat/xxx && git rebase main` | 在合并前先变基，保持提交历史线性 |

### 回滚操作

| 场景 | 命令 | 说明 |
|------|------|------|
| 撤销工作区修改 | `git checkout -- <file>` | 放弃单个文件的未暂存修改 |
| 撤销所有工作区修改 | `git checkout -- .` | 放弃所有未暂存修改（高危操作） |
| 撤销暂存区文件 | `git reset HEAD <file>` | 将文件从暂存区移回工作区 |
| 撤销最近一次 commit（保留修改） | `git reset --soft HEAD~1` | commit 被撤销，修改回到暂存区 |
| 撤销最近一次 commit（保留在工作区） | `git reset --mixed HEAD~1` | commit 被撤销，修改回到工作区（默认） |
| 彻底撤销最近一次 commit | `git reset --hard HEAD~1` | commit 和修改全部丢弃（高危操作） |
| 安全回滚（生成新 commit） | `git revert <commit-hash>` | 创建反向提交来回滚，不改变历史 |
| 回滚多个连续提交 | `git revert <oldest>..<newest>` | 逐个回滚范围内的提交 |
| 查看操作历史用于恢复 | `git reflog` | 查看所有 HEAD 变更记录，找回"丢失"的 commit |

### Cherry-pick

| 场景 | 命令 | 说明 |
|------|------|------|
| 拣选单个提交 | `git cherry-pick <commit-hash>` | 将某个提交应用到当前分支 |
| 拣选多个提交 | `git cherry-pick <hash1> <hash2> <hash3>` | 依次应用多个不连续的提交 |
| 拣选连续范围 | `git cherry-pick <hash1>..<hash2>` | 应用 hash1（不含）到 hash2（含）之间的提交 |
| 拣选但不自动 commit | `git cherry-pick -n <hash>` | 仅应用修改不提交，方便后续调整 |
| 拣选冲突后继续 | `git cherry-pick --continue` | 解决冲突后继续 |
| 拣选冲突后放弃 | `git cherry-pick --abort` | 放弃拣选操作 |

### Stash 暂存

| 场景 | 命令 | 说明 |
|------|------|------|
| 暂存当前修改 | `git stash` | 将工作区和暂存区修改暂存起来 |
| 暂存并添加备注 | `git stash save "WIP: 修复登录Bug"` | 添加描述信息便于后续识别 |
| 暂存包含未跟踪文件 | `git stash -u` | 连同未跟踪的新文件一起暂存 |
| 查看暂存列表 | `git stash list` | 列出所有暂存项 |
| 恢复最近一次暂存 | `git stash pop` | 恢复并删除暂存记录 |
| 恢复暂存（不删除记录） | `git stash apply` | 恢复但保留暂存记录 |
| 恢复指定暂存 | `git stash pop stash@{2}` | 恢复特定索引的暂存 |
| 删除所有暂存 | `git stash clear` | 清空所有暂存（不可恢复） |
| 从暂存创建分支 | `git stash branch feat/new-branch` | 将暂存恢复到一个新分支上 |

### Tag 标签

| 场景 | 命令 | 说明 |
|------|------|------|
| 创建轻量标签 | `git tag v1.0.0` | 仅指向某个提交的引用 |
| 创建附注标签 | `git tag -a v1.0.0 -m "正式发布 v1.0.0"` | 包含作者、日期、备注的完整标签 |
| 为历史提交打标签 | `git tag -a v0.9.0 <commit-hash> -m "补标签"` | 给过去的提交补打标签 |
| 查看所有标签 | `git tag -l` | 列出所有标签 |
| 查看标签详情 | `git show v1.0.0` | 查看标签指向的提交详情 |
| 推送单个标签 | `git push origin v1.0.0` | 推送指定标签到远程 |
| 推送所有标签 | `git push origin --tags` | 推送所有本地标签到远程 |
| 删除本地标签 | `git tag -d v1.0.0` | 删除本地标签 |
| 删除远程标签 | `git push origin --delete v1.0.0` | 删除远程标签 |

### 日志与信息查看

| 场景 | 命令 | 说明 |
|------|------|------|
| 简洁单行日志 | `git log --oneline -20` | 最近 20 条提交，单行显示 |
| 图形化分支历史 | `git log --graph --oneline --all` | 查看所有分支的提交图谱 |
| 查看文件修改历史 | `git log -p -- <file>` | 查看文件每次修改的 diff |
| 查看某个提交详情 | `git show <commit-hash>` | 查看提交的完整信息 |
| 查看谁改了什么 | `git blame <file>` | 逐行显示文件的最后修改者及提交 |
| 搜索提交信息 | `git log --grep="关键词"` | 在提交信息中搜索 |
| 查看两个分支差异 | `git diff main..feat/xxx` | 查看两个分支之间的代码差异 |
| 查看暂存区与最新提交的差异 | `git diff --staged` | 即 `git diff --cached` |
| 查看某个文件的某行是谁改的 | `git blame -L 10,30 <file>` | 查看指定行范围的 blame |

### 远程仓库操作

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看远程仓库 | `git remote -v` | 列出所有远程仓库 URL |
| 更新远程分支列表 | `git fetch origin` | 拉取远程更新但不合并 |
| 拉取并合并 | `git pull origin main` | 等价于 fetch + merge |
| 拉取并变基 | `git pull --rebase origin main` | 等价于 fetch + rebase，推荐在工作分支使用 |
| 强制推送（慎用） | `git push --force-with-lease` | 带安全检查的强制推送，优于 `--force` |

## 工作流说明

### 推荐的 Git 工作流：Trunk-Based + Feature Branch

```
main ────────────────────────────────────────●──●── v1.2.0
         \                                    /
feat/A    ●──●──●───────────────────────────
                       \                    /
feat/B                  ●──●──●────────────
```

**原则**：
1. `main` 分支始终保持可发布状态，任何提交都通过 CI 校验
2. 功能开发从 `main` 切出 `feat/xxx` 分支，完成后提 PR 合并回 `main`
3. 提交信息遵循 Conventional Commits 格式：`feat: 添加用户登录`、`fix: 修复空指针`
4. 合并前执行 `git rebase main` 保持提交历史线性，减少冲突
5. 发布时打 tag，附注标签记录版本号和发布说明

### 紧急修复流程 (Hotfix)

```
main ──────●─────────────●──(v1.2.0)──●──(v1.2.1)
            \           /              /
hotfix/xxx   ●──●──────              /
                                     /
release/v1.2.0 ●──────────────────
```

1. 从 `main` 的最新 tag 切出 `hotfix/xxx` 分支
2. 修复完成后提 PR 合并回 `main`，立即打补丁版本 tag
3. 同时将修复 cherry-pick 到其他长期维护分支（如 `release/1.x`）

### 分支命名规范

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat/` | 新功能 | `feat/user-login` |
| `fix/` | Bug 修复 | `fix/login-redirect-loop` |
| `hotfix/` | 紧急线上修复 | `hotfix/oome-crash` |
| `refactor/` | 重构 | `refactor/order-service` |
| `docs/` | 文档 | `docs/api-guide` |
| `chore/` | 构建/工具 | `chore/update-gradle` |
| `test/` | 测试 | `test/add-unit-tests` |

## 最佳实践

1. **频繁提交、小步提交**：每个 commit 只做一件事，便于代码审查和问题定位
2. **提交前自查**：提交前 `git diff --staged` 检查改动，避免误提交调试代码、密钥等
3. **多用 `git pull --rebase`**：避免不必要的 merge commit，保持历史整洁
4. **冲突解决后验证**：解决冲突后务必运行项目编译和测试，确保没有引入问题
5. **用 `git stash` 临时保存工作**：切换分支前暂存未完成的工作，避免污染其他分支
6. **定期 `git fetch origin --prune`**：清理已被远程删除的本地引用，避免误操作
7. **重写历史仅在私有分支进行**：已推送到共享仓库的分支，禁止 `git reset --hard` 或 `git rebase` 改写历史
8. **使用 `--force-with-lease` 代替 `--force`**：强制推送前检查是否有他人的新提交，防止覆盖他人工作
9. **tag 不可随意删除**：标签是发布的唯一标识，删除后 CI/CD 流水线可能失衡，需团队确认
10. **敏感信息一旦提交需彻底清理**：使用 `git filter-branch` 或 BFG Repo-Cleaner，并轮换所有泄露的密钥

## 框架提交技能

### 技能：个人分支提交与推送

**触发场景**：用户要求“提交当前框架修改”“push 我当前分支”“保存我的工作进度”等，且目标是个人工作分支。

**目标**：把当前个人分支上的全部有效修改提交并推送到该分支的远端上游，保留个人目标、产物、工作记录等上下文。

**适用分支**：
- 个人分支，如 `caleb-ls`
- 不直接适用于 `main`

**执行步骤**：
1. 先执行 `git status --short --branch`、`git diff --stat`、`git remote -v`，确认当前分支、上游和改动规模。
2. 用 `git diff --check` 检查空白错误、冲突标记等提交前问题。
3. 查看 `git status --short` 和 `git diff --name-status`，确认是否包含预期文件。
4. 对个人分支提交，默认可以包含 `A.目标体系/GOAL-*`、产物、工作记录、管理报告和个人沉淀，除非用户明确要求排除。
5. 执行 `git add -A` 暂存当前改动。
6. 用 `git diff --cached --stat` 复核暂存范围。
7. 使用中文提交信息，格式建议为 `{模块}-{具体功能}`，例如 `框架-目标协作流程更新`。
8. 执行 `git commit -m "<message>"`。
9. 执行普通 `git push` 推送到当前上游。
10. 最后用 `git status --short --branch` 和 `git log -1 --oneline` 确认工作树干净、提交已在当前分支。

**验收标准**：
- 本地分支与远端上游同步。
- 工作树干净，或仅剩用户明确要求保留的未提交内容。
- 最终汇报提交 hash、提交信息、分支和推送结果。

### 技能：公共框架筛选同步到 main

**触发场景**：用户要求“把框架能力合并到 main”“除了个人目标和产物外同步公共框架内容”等。

**目标**：只把公共框架能力从个人分支同步到 `main`，排除个人目标、产物、工作记录、管理报告和个人知识沉淀。

**核心原则**：
- 不直接把个人分支整体 merge 到 `main`。
- 从 `origin/main` 创建临时同步分支，按白名单挑选公共框架路径。
- 合并到 `main` 前必须验证排除范围为空。

**公共框架白名单**：
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- `agent.md`
- `🏠_总览.md`
- `角色体系/`
- `通用能力层/`
- `_封存/`
- `A.Teacher分析/` 中属于框架演进、框架复盘、框架版本历史的内容

**必须排除**：
- `A.目标体系/GOAL-*`
- `A.目标体系/管理报告/`
- `A.目标体系/*/产物/`
- `A.目标体系/*/工作记录.md`
- `知识沉淀/KB_CALEB/`
- `知识沉淀/未处理信息/`
- 其他明显只属于个人项目目标、个人产物或个人上下文的文件

**执行步骤**：
1. 在个人分支上先确认工作树状态：`git status --short --branch`。
2. 同步远端：`git fetch origin`。
3. 从主干创建临时分支：`git switch -c framework-public-sync origin/main`。
4. 从个人分支按白名单取文件，例如：
   ```bash
   git checkout caleb-ls -- .gitignore AGENTS.md CLAUDE.md agent.md "🏠_总览.md" "角色体系" "通用能力层" "_封存" "A.Teacher分析"
   ```
5. 检查是否混入个人内容：
   ```bash
   git diff --name-only -- "A.目标体系" "知识沉淀"
   git diff --cached --name-only -- "A.目标体系" "知识沉淀"
   ```
   两个命令都应为空，或仅出现经人工判断属于公共框架的文件。
6. 执行 `git diff --cached --check`，修复空白错误。
7. 提交临时同步分支，例如 `git commit -m "框架-同步公共能力与模式指令"`。
8. 切换到 `main`：`git switch main`。
9. 快进合并：`git merge --ff-only framework-public-sync`。
10. 推送主干：`git push origin main`。
11. 用 `git status --short --branch`、`git log -1 --oneline`、`git diff --name-only origin/main..main -- "A.目标体系" "知识沉淀"` 做最终核查。
12. 临时分支已合并后可删除：`git branch -d framework-public-sync`。

**验收标准**：
- `main` 与 `origin/main` 同步。
- `main` 最新提交只包含公共框架能力。
- `A.目标体系`、个人产物、管理报告、个人知识沉淀未进入公共提交。
- 最终汇报提交 hash、推送范围和明确排除项。

### 技能：将 main 框架能力回灌个人分支

**触发场景**：公共框架能力已经进入 `main` 后，用户要求“切回我的分支并更新框架”“把 main 的框架能力加载到个人分支内，并且不影响已有目标和产物”。

**目标**：让个人分支获得 `main` 的公共框架更新，同时保留个人分支已有的 `A.目标体系/GOAL-*`、产物、工作记录和个人知识沉淀。

**执行步骤**：
1. 在切分支前执行 `git status --short --branch`，识别当前工作树是否有未提交的个人目标内容。
2. 如果当前分支存在未跟踪的个人目标文件，先确认它们不会被目标分支覆盖；必要时使用 `git stash push -u -- <path>` 临时保存指定路径，避免全仓库误暂存。
3. 切回个人分支：`git switch <personal-branch>`。
4. 合入主干公共框架能力：`git merge main`。若能快进则快进；若产生 merge commit，提交信息说明是框架能力回灌。
5. 合并后检查个人内容是否仍存在：
   ```bash
   git status --short --branch
   git diff --name-status main..HEAD -- "A.目标体系" "知识沉淀"
   ```
6. 如果第 2 步做过临时保存，恢复指定个人目标文件，并保持其原有提交状态，不把它们混入框架同步提交。
7. 推送个人分支：`git push`。

**验收标准**：
- 个人分支包含 `main` 的最新公共框架提交。
- 个人目标、产物、工作记录未被删除或回退。
- 如有原本未提交的个人目标文件，仍以未提交状态保留。
- 最终汇报个人分支最新提交、是否产生 merge commit、未提交个人文件状态。

## Agent 使用提示

<!-- Agent 在调用该工具时应遵循的规范 -->

### 安全边界

| 命令类型 | 自动执行 | 需确认 | 说明 |
|----------|----------|--------|------|
| `git status`, `git log`, `git diff` | 是 | | 只读命令，无副作用 |
| `git branch`, `git tag`（查看类） | 是 | | 查看分支/标签，无副作用 |
| `git fetch`, `git pull` | | 是 | 涉及远程通信，可能引入变更 |
| `git stash`, `git stash pop` | | 是 | 可能影响用户的工作区状态 |
| `git checkout`, `git switch` | | 是 | 切换分支可能丢失未保存的工作 |
| `git merge`, `git rebase` | | 是 | 可能产生冲突，需用户介入 |
| `git cherry-pick` | | 是 | 可能产生冲突 |
| `git reset --soft/--mixed` | | 是 | 修改本地提交历史 |
| `git reset --hard`, `git clean -fd` | | **禁止** | 不可逆地删除代码，Agent 绝不能自动执行 |
| `git push --force` | | **禁止** | 覆盖远程历史，Agent 绝不能自动执行 |
| `git push --force-with-lease` | | **严重警告** | 即使是安全强制推送也需用户明确授权 |
| `git push`（普通） | | 是 | 推送到远程，需用户确认 |
| `git branch -D`, `git stash clear` | | 是 | 删除本地数据，需用户确认 |

### 建议的权限模式

- **只读操作（可自动）**：`git status`、`git log`、`git diff`、`git show`、`git branch -a`、`git stash list`、`git remote -v`、`git blame`
- **本地修改（需确认）**：`git add`、`git commit`、`git stash`、`git branch`（创建/删除）、`git merge`、`git rebase`
- **远程操作（需确认）**：`git push`、`git pull`、`git fetch`
- **危险操作（用户必须手动或明确授权 + 双重确认）**：`git reset --hard`、`git push --force`、`git push --force-with-lease`、`git branch -D`（强制删除分支）、`git clean -fd`

### Agent 行为规范

1. Agent 在执行任何写操作前，必须先执行 `git status` 评估当前工作区状态
2. 如果工作区有未提交的修改，Agent 必须提醒用户保存或暂存后再执行危险操作
3. 批量操作前应先 `--dry-run` 或列出影响范围，如 `git clean -n`
4. Agent 提交代码时，commit message 必须遵循 Conventional Commits 格式
5. Agent 不应主动 amend 他人的提交或改写已推送的公共历史
6. 遇到合并冲突时，Agent 应列出冲突文件并提示用户手动解决，不得自行选择 "ours" 或 "theirs"
