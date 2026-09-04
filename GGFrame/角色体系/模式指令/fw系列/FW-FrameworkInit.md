---
type: framework_command
series: fw
overview: true
overview_order: 110
summary: "初始化框架的本地配置，识别项目并写入项目注册表。"
when_to_use: "首次 clone 框架、迁移电脑、项目路径变化或需要重新配置项目时。"
result: "生成或补齐本地配置文件，并登记确认后的项目路径与元数据。"
caution: "仅 Teacher 模式；写入前展示变更，不猜测项目归属或静默覆盖配置。"
trigger: /frameworkInit
scope: teacher_only
priority: 3
version: "1.3"
updated: 2026-07-23
---

# /frameworkInit — 框架初始化引导

## 触发

- `/frameworkInit`、`初始化引导`、`frameworkInit`

## 适用范围

**仅 asTeacher 模式可用**。若当前为 TL 模式，提示用户先执行 `/asTeacher`。

## 目的

引导用户在新机器上重新配置框架的项目工程路径，由 Agent 更新 `配置与元数据/项目注册表.yaml`，使框架适配当前开发环境。

---

## 执行流程

### Phase 0: 首次初始化检测（git clone 后首次使用）

**触发条件**：`配置与元数据/项目注册表.yaml` 不存在，但 `配置与元数据/项目注册表.template.yaml` 存在。

> 框架通过 git 分享。.gitignore 排除了实际配置文件（含本地路径等敏感信息），仓库中只有 `.template.yaml` 模板。新用户 clone 后需从模板复制出实际配置文件。

#### 步骤 0.1: 欢迎与说明

```
🏗️ 检测到这是首次使用 GGFrame！
   框架核心文件已就绪，但本地配置文件尚未创建。

   需要配置两个文件 + 一个模板：
   1. 配置与元数据/项目注册表.yaml  — 项目路径和元数据
   2. 配置与元数据/框架设置.yaml    — 知识库路径
   3. A.目标体系/目标总览.md        — 从模板创建（框架的北极星文件）
```

#### 步骤 0.2: 引导复制模板

1. Agent 自动执行：复制 `项目注册表.template.yaml` → `项目注册表.yaml`
2. Agent 自动执行：复制 `框架设置.template.yaml` → `框架设置.yaml`
3. Agent 检查 `A.目标体系/目标总览.md` 是否存在：
   - 若不存在 → 复制 `A.目标体系/目标总览-模版.md` → `A.目标体系/目标总览.md`
   - 若已存在 → 跳过
4. 提示用户：

> ✅ 已从模板创建本地配置文件：
>    - 配置与元数据/项目注册表.yaml
>    - 配置与元数据/框架设置.yaml
>    - A.目标体系/目标总览.md（从模版创建，含 GOAL-00N 示例条目）
>
> 📄 目标总览.md 是框架的北极星文件，AI 通过它理解你的工作方向。
>    请按实际情况填写 Goal 条目，删除 GOAL-00N 示例条目。
>
> 接下来需要配置你的项目路径。请告诉我你的项目根目录（如 D:/dev/projects）。

#### 步骤 0.3: 后续流程

复制完成后，继续执行 Phase 2（跳过 Phase 1 的注册表已存在检查，因为刚创建的是空的）。

如果用户后续想更新框架（git pull），本地 `.yaml` 文件已被 `.gitignore` 排除，不会被覆盖。模板文件 `.template.yaml` 可能被框架更新，Agent 升级时提示用户对比差异。

---

### Phase 1: 框架状态预检

1. 读取 `配置与元数据/项目注册表.yaml`，获取当前 `projects_root` 和所有已注册项目
2. 读取 `A.目标体系/目标总览.md`，统计活跃 Goal 数
3. 扫描 `A.目标体系/GOAL-XXX/`，统计工作记录、关联任务和 `产物/{任务序号}/` 子目录数
4. 扫描 `任务系统/进行中/`，统计进行中任务数
5. 向用户展示摘要：

```
📊 当前框架状态
├── 项目根目录: {projects_root}
├── 已注册项目: {N} 个（{在线数} 个目录存在，{缺失数} 个目录缺失）
├── 目标: {M} 个
├── 产物工件目录: {P} 个
└── 进行中任务: {Q} 个
```

### Phase 2: 重置询问

询问用户：

> 是否需要先重置框架（清空目标/任务/产物工件）再重新初始化？
> - 选择"是" → 跳转执行 `/frameworkClean` 流程，完成后继续
> - 选择"否" → 直接进入项目路径配置

### Phase 3: 项目根目录配置

1. 展示当前 `projects_root` 值
2. 询问用户新的项目根目录路径（如 `D:/dev/projects`）
3. 验证路径有效性：
   - 路径不存在 → 提示并询问是否创建
   - 路径存在 → 扫描子目录，列出所有候选项目目录

### Phase 4: 项目逐项确认

对注册表中的每个项目 + 扫描发现的新目录，逐项处理：

#### 已注册项目（目录存在）
```
✅ fms-rear → D:/zhuangjl/dev/projects/fms-rear （目录存在，无需更改）
```

#### 已注册项目（目录缺失）
```
⚠️ lasen-rear → D:/old/path/lasen-rear （目录不存在）
   1. 输入新路径
   2. 从注册表移除
   3. 暂不处理
```

#### 未注册目录（新发现）
```
🔍 发现新目录: D:/dev/projects/new-project
   1. 注册到项目注册表
   2. 跳过
```
若用户选择注册，按最小信息集收集：
- `name`: 项目中文名（必填）
- `tech_stack`: 技术栈（选填，可后续补充）
- `alias`: 口语简称（选填）
- `description`: 简要描述（选填）

### Phase 5: 变更确认

汇总所有变更，展示差异预览：

```
📋 以下变更将写入 项目注册表.yaml：

【修改】
  projects_root: "D:/old/path" → "D:/new/path"

【路径更新】
  lasen-rear: "D:/old/path/lasen-rear" → "D:/new/path/lasen-rear"

【新增项目】
  + new-project: "D:/dev/projects/new-project"

【移除项目】
  - abandoned-project （目录已不存在）

确认写入？[是/否/修改]
```

### Phase 6: 写入 + 后续建议

1. 用户确认后，使用 Edit 工具更新 `配置与元数据/项目注册表.yaml`
2. 报告写入结果
3. 建议后续操作：
   - 对路径变更的项目，建议重新初始化 CodeGraph 索引（`cd {项目目录} && codegraph init -i`）
   - 对新注册项目，提示可补充 `tech_stack`、`business_domains` 等详细字段

---

## 行为约束

### 必须做
- 逐项确认，不批量假设
- 变更前展示完整差异预览
- 用户确认后才写入文件
- 路径使用正斜杠 `/`
- 对目录扫描发现的 `.git` 目录下的项目，自动尝试推断项目名

### 禁止做
- 不删除用户未确认的项目条目
- 不修改项目的 `tech_stack`、`business_domains`、`description` 等元数据字段（路径和基本信息除外）
- 不在 TL 模式下响应此命令

### 错误处理

| 场景 | 处理 |
|------|------|
| 注册表文件不存在 | 从框架模板重建最小注册表 |
| 用户输入的路径格式错误 | 提示正确格式，要求重新输入 |
| 无任何项目需要注册 | 提示至少需要注册一个项目，否则框架无法工作 |

---

## 最小注册表模板

当 `项目注册表.yaml` 不存在时，使用以下模板：

```yaml
projects_root: "{用户输入的路径}"

projects:
  # 项目将在此处注册
```

---

## 与 frameworkClean 的关系

- `frameworkInit` 在 Phase 2 会询问是否先执行重置
- 用户也可以单独执行 `/frameworkClean` 后再执行 `/frameworkInit`
- 两者独立但互补：`frameworkClean` 清理数据，`frameworkInit` 重建配置
