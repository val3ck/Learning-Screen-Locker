@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js is required. Install Node.js, then open this file again.
  pause
  exit /b 1
)
where git >nul 2>nul || (
  echo Git for Windows is required. Install Git, then open this file again.
  pause
  exit /b 1
)
node server.mjs --open
if errorlevel 1 pause
