# CG Harness

CG Harness is an independent Agent execution standard and lightweight task runtime. It absorbs useful methods from GGFrame, superpowers, skills, gstack, and compound-engineering-plugin without depending on their directories or task state.

## Core Commands

```text
node cli/bin/cg.js init --project --path .
node cli/bin/cg.js web --port 3210
node cli/bin/cg.js intake --text "修复登录后页面报错"
node cli/bin/cg.js init TASK-001 --type fix --title "Fix login error"
node cli/bin/cg.js list
node cli/bin/cg.js update TASK-001 --include src --output fix.patch --risk-declared
node cli/bin/cg.js acceptance TASK-001 add --id A1 --text "Regression test passes"
node cli/bin/cg.js check TASK-001
node cli/bin/cg.js transition TASK-001 --to ready --reason "Scope is clear"
node cli/bin/cg.js transition TASK-001 --to in_progress --reason "Start work"
node cli/bin/cg.js evidence TASK-001 add --kind test --path proof.txt --acceptance A1 --result pass
node cli/bin/cg.js context TASK-001 create
node cli/bin/cg.js plan TASK-001 create --text "先实现，再验证"
node cli/bin/cg.js step TASK-001 list
node cli/bin/cg.js step TASK-001 start --id P1
node cli/bin/cg.js step TASK-001 done --id P1
node cli/bin/cg.js artifact TASK-001 add --path report.md
node cli/bin/cg.js learn TASK-001 add --text "记录可复用经验"
node cli/bin/cg.js subtask TASK-001 add --id TASK-001-1 --title "拆分执行单元"
node cli/bin/cg.js resume TASK-001
node cli/bin/cg.js show TASK-001
node cli/bin/cg.js capability TASK-001 record --path adapter-result.json
node cli/bin/cg.js skill import --path ../superpowers/skills/systematic-debugging/SKILL.md
node cli/bin/cg.js skill import-dir --path ../superpowers/skills
```

`init --project` 会创建 `.cg/project.json`，记录项目路径、检测到的技术栈、项目规则文件和 Harness 目录。`intake` 接受自然语言需求，生成 `draft` 任务并保存类型、置信度、匹配依据和待确认问题。需求信号冲突时不会强行进入执行流程。

`context`、`plan`、`artifact`、`learn` 分别生成上下文包、计划、产物记录和可复用经验；`subtask` 建立父子任务关系；`resume` 输出当前任务的恢复信息，便于中断后继续执行。

`web` 启动本地任务控制台，打开 `http://127.0.0.1:3210` 即可查看任务、流转状态和推进计划步骤。页面使用与 CLI 相同的任务存储和状态校验。

正常流程建议先补充可执行范围、输出物和验收标准，再推进状态。进入 `ready` 需要 intent、范围和至少一条验收标准；进入 `under_review` 需要输出物和验证证据；进入 `done` 需要每条验收标准的通过证据，并显式声明剩余风险。

## Core Objects

- Goal: why the work matters; optional external reference
- Task: canonical bounded unit of work and status
- Context: paths, rules, dependencies, and prior decisions
- Evidence: acceptance-linked proof from files, commands, tests, screenshots, or measurements
- Decision: explicit choice and rejected alternative
- Capability: native skill or optional external adapter

## Storage

```text
tasks/TASK-001/
  task.json
  events.jsonl
  decisions.json
  evidence/
  artifacts/
```

JSON is the machine truth. JSONL is the append-only audit log. Markdown is used for human plans, reports, and learning notes.

## Lifecycle

```text
draft -> ready -> in_progress -> under_review -> done -> archived
                          |              |
                          v              v
                       blocked        revision
```

A Task cannot reach `done` without acceptance-linked passing evidence. Providers never own Task state.

外部适配器通过 `capability ... record` 写入结构化结果。适配器不可用时记录 `unavailable` 或 `fallback`，并保留替代能力和能力缺口；适配器不能直接修改任务状态。

## Native Skills

Native contracts live under `skills/`: intake, clarify, context, plan, implement, reproduce, diagnose, refactor-design, baseline, optimize, prototype, verify, review, ship, and learn. External projects are optional adapters that return structured results and fallback information.

## Protocols

- `protocols/skill-contract.md` - common skill input and output envelope
- `protocols/context-package.md` - smallest sufficient project context
- `protocols/evidence-model.md` - evidence categories and acceptance mapping
- `protocols/status-transition.md` - CG Harness and GGFrame status mapping
- `protocols/fallback.md` - provider selection and capability gaps

The end-to-end `/cg-fix` example lives at `examples/fix-flow/`.

## Independence Rule

Removing GGFrame, superpowers, skills, gstack, or compound-engineering-plugin must not prevent the core CLI from creating Tasks, advancing status, recording evidence, validating completion, or showing a Task summary.
