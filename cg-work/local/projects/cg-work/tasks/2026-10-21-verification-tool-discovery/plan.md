# 项目验证入口探测线索补齐

## 需求与取舍

用户反馈：框架对业务项目测试工具的发现能力弱，目前不太容易发现。核对规则链路后确认三处断链：

1. `project-initialization` 第 5 步只有一句"识别测试命令和构建命令"，无探测线索，也未说明登记去向；
2. `core/templates/project-context.template.yaml` 的 `verification.profiles` 无结构示例，新项目初始化容易留空；
3. 加载规则只写了"执行验证前先读取 profiles"，profiles 缺失时无兜底口径。

用户确认：探测清单正文放 `core/project-context.md`（唯一来源），技能里只留指针。测试、Lint、编译、构建入口共用同一探测清单——现有 fms/lasen 的 profiles 本就登记 `targeted_compile`/`static` 阶段，口径一致。

## 变更内容

| 文件 | 变更 |
|---|---|
| `core/project-context.md` | 字段规范新增「验证入口探测线索」小节：四层探测顺序（CI/自动化配置 → 项目自述文档 → 构建工具配置映射 → monorepo/多模块展开）、按 `stage` 登记、四层无线索时留空并记录缺口；加载规则补 profiles 缺失时的兜底（先探测补登记，无法确认记环境限制，不得编造命令） |
| `skills/project-initialization/SKILL.md` | 第 5 步改为指针引用 core 小节，并明确登记到 `verification.profiles` |
| `core/templates/project-context.template.yaml` | `profiles` 补注释形态的示例条目（id/stage/command/outcome/limitation）与指针 |
| `VERSION` | 2.32.0 → 2.33.0（兼容能力新增） |

## 测试用例

| 编号 | 检查 | 预期 |
|---|---|---|
| TC-001 | `npm run check` | 全绿；技能内 `#验证入口探测线索` 指针锚点有效 |
| TC-002 | `npm test` | 全部通过；`project-discovery.test.mjs` 对初始化技能的断言不受影响 |
| TC-003 | `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml` | 模板注释不进入受管上下文，受管项目校验通过 |

## 兼容性

不改变校验器行为与既有字段语义；存量项目上下文无需迁移；历史任务不受影响。
