param(
  [int]$Port = 0,
  [switch]$NoBrowser
)

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeEntry = Join-Path $toolRoot 'server.mjs'
$serviceConfig = Get-Content -Raw (Join-Path $toolRoot 'runtime-services.json') | ConvertFrom-Json
if ($Port -eq 0) {
  $Port = $serviceConfig.runtimeCenter.port
}
$runtimeUrl = "http://127.0.0.1:$Port"
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if ($listener) {
  $existing = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
  if ($existing.Name -ne 'node.exe' -or $existing.CommandLine -notmatch 'server\.mjs') {
    throw "端口 $Port 已被其他进程占用（PID $($listener.OwningProcess)），未启动运行中心。"
  }
  Write-Host "项目运行中心已运行：$runtimeUrl"
} else {
  $env:LASEN_RUNTIME_CENTER_PORT = "$Port"
  $process = Start-Process -FilePath 'node.exe' -ArgumentList 'server.mjs' -WorkingDirectory $toolRoot -WindowStyle Hidden -PassThru
  $ready = $false
  for ($attempt = 1; $attempt -le 12; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
      Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 "$runtimeUrl/api/status" | Out-Null
      $ready = $true
      break
    } catch {
      # Wait for Node to bind the port before reporting a startup failure.
    }
  }
  if (-not $ready) {
    throw "项目运行中心启动超时（PID $($process.Id)）。"
  }
  Write-Host "项目运行中心已启动：$runtimeUrl（PID $($process.Id)）"
}

if (-not $NoBrowser) {
  Start-Process $runtimeUrl
}
