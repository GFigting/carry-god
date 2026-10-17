# 审查记录

## 结论

task.yaml 字段重构的实现符合已确认方案（方向 E：全部重构 + 后续"无过渡字段"清理），符合规则文档与校验器一致性的要求。

## 审查要点

1. **字段 schema 收敛**：`execution_profile` + `artifact_profile` 合并为单一 `delivery_path` 三选一枚举，`check-task.mjs` 的 `resolveDeliveryPath()` 只接受新格式，旧字段在 `legacyTopLevelKeys` 中直接报"已废弃"。三值天然互斥，原 lightweight+compact 冲突分支随之消除，校验逻辑变简单而非变复杂。
2. **引用分组**：6 个扁平 `*_reference` 收进 `artifacts.*`，`resolveArtifactRef()` 只读新位置；外部关联引用（prototype/requirements/roadmap/depends_on 等）保持顶层，边界清晰。
3. **历史兼容清理（无过渡字段）**：`project_id`、`title`、`documentation.targets`、`documentation.not_needed_reason`、`requirements_reference_note`、`status_history` 字符串简写全部移除识别分支；文档中"继续兼容"措辞同步改为"已被拒绝，需先迁移"。4 处对废弃字段的提及均为"不再接受"的声明式说明，非兼容承诺。
4. **next_action 放宽**：仅 pending/in_progress/review/blocked 强制，done/cancelled 终态可选，与 `next_user_action` 职责分工明确。
5. **测试**：删除 3 个已无对应行为的用例（用户指示），夹具全部迁到新 schema；`npm test` 85/87，2 个失败为 `check-project.test.mjs` 绝对路径存量问题（重构前已存在）。
6. **归档数据零改动**：全部迁移跳过 `archived: true` 记录，符合用户"忽略已归档数据"的约束。

## 审查发现与处理

- 修复了 `check-task.mjs` 原型章节报错使用直引号与测试弯引号断言不一致的问题（报错文案统一为弯引号）。
- 修复了迁移过程中夹具出现重复 `artifacts:` YAML 键导致解析失败的问题。
- 归档与历史任务文件中对旧字段的描述属审计记录，按惯例不改写历史。

## 遗留项

- ~33 个 YAML 本身损坏的活跃任务（job-hunt ~29 + lasen 4，`requirements_reference` key 名丢失）为框架外部治理问题，不在本次范围。
- `check-project.test.mjs` 的 2 个绝对路径断言失败为存量问题，与本次重构无关。
