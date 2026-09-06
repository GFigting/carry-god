---
type: adapter
id: CGHN-ADAPTER-CODEX
host: codex
---

# Codex 适配器

本适配器把宿主启动行为映射到通用框架，不改变核心规则。

## 加载顺序

1. 读取 `../../AGENTS.md`。
2. 读取 `../../core/operating-model.md` 和 `../../core/loading-protocol.md`。
3. 按任务阶段读取 `../../workflow/` 中的流程和模板。
4. 按触发条件读取 `../../registry/capabilities.yaml` 中列出的能力。
5. 将本轮验证和决策写入任务记录或交付摘要。

## 宿主边界

能力文件不得假定特定 shell、模型、插件或桌面 UI。需要宿主特有操作时，应在本目录增加明确的适配说明，不把宿主细节写入 `core/`。
