# 需求包：产物与字段简化（第 3 项）

- 日期：2026-10-02
- 来源：用户对"工作流与产物判定"的确认，执行其中的第 3 项（删死字段、定死位置）
- 状态：原始需求，未拆分

## 原始诉求

依据 126 条任务记录与 28 个字段的实测使用率，删掉从未使用的字段、把同一事实的多个书写位置收敛为一处，并去掉冗余的目录 marker。

## 实测依据

- 从未使用：`child_task_references` 0/126、`follow_up_task_references` 0/126。
- 同一事实三种字段名：`acceptance_summary` 46 条、`acceptance_criteria` 7 条、`acceptance` 4 条。
- 同一事实两个位置：`standards_preflight` 按框架正文应写在 `plan.md`/`verification.md` 段落，但有 5 条记录写成 `task.yaml` 字段。
- 冗余 marker：需求箱同时强制 `README.md` 与 `.gitkeep`；README 已保证目录非空，`.gitkeep` 无独立作用。

## 约束

- 不得改写任何事实：迁移只做字段改名与内容搬移，不得重写或补造证据。
- 不删除历史文件与历史任务记录；已存在的 `.gitkeep` 保留原样，只停止强制要求。
- 迁移后必须逐条复校验，确认没有把通过变成失败。
