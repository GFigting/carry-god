# 学习：生成 CLAUDE.md

## 经验判定

本次为框架新增一个 Agent 自动加载入口（`CLAUDE.md`），方法可复用：

- **可复用点**：为已有 `AGENTS.md` 框架补 Claude 系入口时，`CLAUDE.md` 应做**最小薄指针**（最终形态：正文只指向 `AGENTS.md` 一处，不复制规则、不列其他路由），
  从根源上避免两份指令口径漂移；同时须把 `CLAUDE.md` 登记进校验器固定文件名白名单与命名约定，否则 `check-all.mjs` 会报 `invalid name`。
- **适用范围**：任何以 `AGENTS.md` 为主入口、需要兼容 Claude Code 自动加载的仓库。
- **不适用**：不应把 `CLAUDE.md` 当作独立规则来源去重写框架约束。

## 提升去向

无需修改框架规则本身；本经验留作后续“多 Agent 入口共存”维护参考。
若日后 `AGENTS.md` 口径变更，须同步 `CLAUDE.md`（属文档同步门禁）。
