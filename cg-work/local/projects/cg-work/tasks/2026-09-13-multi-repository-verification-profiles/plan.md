# 多仓库验证配置变更地图

## 问题事实

- LASEN 后端与前端位于独立仓库；现有 `project.root_path` 只能表达一个主仓库。
- 后端 `mvn -pl lasen-module-fc-service -am ... test` 会重新编译 FC API 与 service，定向测试耗时明显。
- 前端 `ts:check` 未设置 Node 堆上限，默认约 4GB，曾因内存不足未完成；替代验证不等同全量类型检查。

## 唯一来源与调用方

| 规则 | 唯一来源 | 调用方 |
| --- | --- | --- |
| 多仓库与分层验证字段 | `core/project-context.template.yaml` | 项目 `project-context.yaml` |
| 字段语义与加载顺序 | `core/context-loading.md` | 项目初始化、执行任务的 agent |
| 上下文结构校验 | `scripts/check-project.mjs` | 项目初始化与上下文更新 |
| LASEN 实际命令 | `local/projects/lasen/project-context.yaml` | LASEN 任务记录与验证步骤 |

## 设计与兼容性

- 保留 `project.root_path` 作为兼容的主仓库字段；新增可选 `repositories` 列表，至少包含 `id`、`role`、绝对 `root_path`。
- 新增可选 `verification.profiles` 列表。每个 profile 记录 `id`、`stage`、`command`、`outcome` 和可选 `limitation`；`outcome` 只允许 `required`、`environment_limited`、`not_applicable`。
- `check-project.mjs` 校验新增字段，但旧项目上下文不含它们时仍通过。
- LASEN 登记后端 targeted test、前端 targeted lint / browser / build / full type check 四层，不将环境受限项混同为通过。

## 非范围

- 不修改业务仓库代码、package 脚本或系统 Node 内存参数。
- 不自动运行长耗时构建或全量类型检查。
- 不改变任务状态机、工作流或设计产物目录规则。

## 实施步骤

1. 扩展模板、加载规则和校验器的同一字段定义。
2. 更新 LASEN 项目上下文，记录双仓库及验证 profile。
3. 运行项目上下文校验、框架全量校验和任务校验；记录验证范围。
