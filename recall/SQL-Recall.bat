@echo off
set "ELECTRON_RUN_AS_NODE="
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch-recall.ps1"
if errorlevel 1 pause
