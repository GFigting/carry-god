# 上下文驱动项目启动

项目启动、停止或重启应以 `project-context.yaml` 的 `runtime.entrypoints` 为入口。入口可以是可执行命令，也可以是项目仓库或 `cg-work/local/tools/` 下的启动脚本；框架需要引导 Agent 先读取上下文再执行。仅有需求箱而没有项目上下文的目录不纳入项目启动检查。
