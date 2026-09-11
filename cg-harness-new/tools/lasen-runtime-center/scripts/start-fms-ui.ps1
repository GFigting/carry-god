[CmdletBinding()]
param(
    [ValidateRange(1, 300)]
    [int]$HealthWaitSeconds = 60
)

$ErrorActionPreference = 'Stop'
$toolRoot = Split-Path -Parent $PSScriptRoot
$serviceConfig = Get-Content -LiteralPath (Join-Path $toolRoot 'runtime-services.json') -Raw | ConvertFrom-Json
$service = @($serviceConfig.services | Where-Object { $_.project -eq 'FMS' -and $_.id -eq 'frontend' })
if ($service.Count -ne 1 -or $null -eq $service[0].environment.VITE_PORT) {
    throw 'runtime-services.json 缺少 FMS 前端的 VITE_PORT 配置。'
}
foreach ($setting in $service[0].environment.PSObject.Properties) {
    Set-Item -Path "Env:$($setting.Name)" -Value ([string]$setting.Value)
}
$url = $service[0].url
$port = ([Uri]$url).Port
if ($env:VITE_PORT -ne "$port") {
    throw "FMS 前端 VITE_PORT=$env:VITE_PORT 与服务地址端口 $port 不一致。"
}
$workingDirectory = 'D:\songgf\Projects\fms-ui'

function Test-Health {
    & curl.exe --fail --silent --output NUL --max-time 3 $url
    return $LASTEXITCODE -eq 0
}

if (Test-Health) {
    Write-Output "FMS 前端已运行：$url"
    return
}

if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
    $deadline = (Get-Date).AddSeconds($HealthWaitSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Health) {
            Write-Output "FMS 前端已运行：$url"
            return
        }
        Start-Sleep -Seconds 2
    }
    throw "端口 $port 已被占用但前端健康检查失败，拒绝启动或停止未知进程。"
}

$process = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/d', '/c', 'pnpm.cmd run front') -WorkingDirectory $workingDirectory -WindowStyle Hidden -PassThru

$deadline = (Get-Date).AddSeconds($HealthWaitSeconds)
while ((Get-Date) -lt $deadline) {
    if (Test-Health) {
        Write-Output "FMS 前端已就绪：$url（PID $($process.Id)）"
        return
    }
    if ($process.HasExited) {
        throw "FMS 前端已退出，退出码：$($process.ExitCode)。"
    }
    Start-Sleep -Seconds 2
}

throw "FMS 前端在 $HealthWaitSeconds 秒内未就绪，PID：$($process.Id)。"
