# 审查记录 · browser-test 接入 cg-work

## 改动面

| 文件 | 性质 |
|---|---|
| `local/tools/browser-test/scripts/validate-config.mjs` | `credentials` 改为可选；声明时仍按原规则校验 |
| `local/tools/browser-test/run.mjs` | 无 `credentials` 时返回空对象，跳过凭据加载 |
| `local/tools/browser-test/cg-work/test-suites.json` | 新增：目标 + `design-preview` 套件 |
| `local/tools/browser-test/cg-work/serve.mjs` | 新增：只读静态服务 |
| `local/tools/browser-test/cg-work/start-static.ps1` | 新增：预检启动脚本 |
| `local/tools/browser-test/README.md` | 更新：目录结构、cg-work 入口、凭据口径 |

## 复核结论

- fms / lasen 配置与流程未改动；两者都声明了完整 `credentials`，行为不变。
- 判定逻辑（步骤全集、截图存在性、二维判定）未改，仅放宽了凭据必填。
- 静态服务限制在 127.0.0.1、只读、路径前缀校验；不写文件、不执行外部命令。
- 新增断言只用了既有 `EXPECT_KEYS`，未扩展断言类型。

## 遗留

- 预检不转发 `--start`：`run.mjs prepare` 前必须服务已就绪。已在 README 写明，未改流程。
- 套件覆盖不到计算样式，设计侧仍需人工/工具测量。
