# cg-work design preview static server launcher (called by preflight --start).
# Serves the built Vue app: framework-visualization/dist (run `npm run build` first).
# Exits 0 when the service is already up or has been started.
$Port = 8125
$Dist = Join-Path $PSScriptRoot '..\..\..\projects\cg-work\design\framework-visualization\dist'
if (-not (Test-Path (Join-Path $Dist 'index.html'))) {
  Write-Error 'dist/index.html 不存在：请先在 local/projects/cg-work/design/framework-visualization 执行 npm install 与 npm run build'
  exit 1
}
$Root = (Resolve-Path $Dist).Path
$Url = 'http://127.0.0.1:' + $Port + '/index.html'

try {
  $probe = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2
  if ($probe.StatusCode -eq 200) {
    Write-Output "cg-work preview already running: $Url"
    exit 0
  }
} catch {
  # not ready yet, start below
}

$Node = (Get-Command node -ErrorAction Stop).Source
$ServeScript = Join-Path $PSScriptRoot 'serve.mjs'
$Arguments = '"{0}" {1} "{2}"' -f $ServeScript, $Port, $Root
Start-Process -FilePath $Node -WindowStyle Hidden -ArgumentList $Arguments
Start-Sleep -Seconds 1
Write-Output "cg-work preview started: $Url"
exit 0
