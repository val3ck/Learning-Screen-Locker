@echo off
setlocal
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install it from https://nodejs.org and try again.
  pause
  exit /b 1
)
node --check "%~dp0server.mjs"
if errorlevel 1 (
  pause
  exit /b 1
)
if /i "%~1"=="--check" exit /b 0
node "%~dp0server.mjs" --open
if errorlevel 1 pause
