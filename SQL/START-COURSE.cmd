@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js LTS from https://nodejs.org then run this file again.
 pause
 exit /b 1
)
if not exist "node_modules\@electric-sql\pglite\package.json" (
 call npm install --no-audit --no-fund
 if errorlevel 1 (
  pause
  exit /b 1
 )
)
start "" http://127.0.0.1:4173
node server.mjs
pause
