@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  pause
  exit /b 1
)
if not exist "dist-server\recall.cjs" (
  if not exist "node_modules\.bin\vite.cmd" (
    call npm ci
    if errorlevel 1 exit /b 1
  )
  call npm run build
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
node -e "fetch('http://127.0.0.1:5174/api/backend-path/health',{signal:AbortSignal.timeout(1000)}).then(r=>r.json()).then(d=>process.exit(d.app==='backend-path'&&d.protocol===1?0:1)).catch(()=>process.exit(1))"
if not errorlevel 1 (
  start "" "http://127.0.0.1:5174/"
  exit /b 0
)
start "" /b node "dist-server\recall.cjs"
node -e "const until=Date.now()+5000;async function probe(){try{const r=await fetch('http://127.0.0.1:5174/api/backend-path/health',{signal:AbortSignal.timeout(650)});const d=await r.json();if(d.app==='backend-path'&&d.protocol===1)return}catch{}if(Date.now()>until)process.exitCode=1;else setTimeout(probe,200)}probe()"
if errorlevel 1 (
  echo Could not start Backend Path on port 5174. Check the application using that port.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:5174/"
