param([switch]$Edge)
$ErrorActionPreference = 'Stop'
$englishRoot = Split-Path -Parent $PSScriptRoot
$serverPath = Join-Path $englishRoot 'server.js'
$baseUrl = 'http://localhost:5500'
$healthUrl = 'http://127.0.0.1:5500/api/review/status'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
function Test-ReviewServer {
  & $nodePath -e "fetch(process.argv[1],{signal:AbortSignal.timeout(1500)}).then(r=>r.json()).then(d=>process.exit(d.app==='english-review'&&d.build==='review-2.0.0-complete'?0:1)).catch(()=>process.exit(1))" $healthUrl
  return $LASTEXITCODE -eq 0
}
if (-not (Test-ReviewServer)) {
  $listeners = @(Get-NetTCPConnection -LocalPort 5500 -State Listen -ErrorAction SilentlyContinue)
  foreach ($listener in $listeners) {
    $serverProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $listener.OwningProcess)
    if ($serverProcess.CommandLine -and $serverProcess.CommandLine.IndexOf($serverPath,[StringComparison]::OrdinalIgnoreCase) -ge 0) { Stop-Process -Id $serverProcess.ProcessId -ErrorAction SilentlyContinue }
    else { throw 'Port 5500 is used by another application. Close that service or choose another port.' }
  }
  $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
  Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $englishRoot -WindowStyle Hidden
  for ($attempt = 0; $attempt -lt 20; $attempt++) { if (Test-ReviewServer) { break }; Start-Sleep -Milliseconds 250 }
  if (-not (Test-ReviewServer)) { throw 'English review server did not start. Run node server.js to see the error.' }
}
if ($Edge) { try { Start-Process -FilePath 'msedge.exe' -ArgumentList $baseUrl; exit } catch {} }
Start-Process -FilePath $baseUrl
