@echo off
setlocal
cd /d "%~dp0"
if not exist "SQL\node_modules\@electric-sql\pglite\package.json" goto install
if not exist "nodejs\node_modules\vite\package.json" goto install
if not exist "recall\node_modules\electron-builder\package.json" goto install
goto build
:install
call npm run install:apps
if errorlevel 1 exit /b 1
:build
if not exist "nodejs\dist-server\recall.cjs" goto package
if exist "recall\release\win-unpacked\SQL Recall.exe" goto start
:package
call npm run package:win
if errorlevel 1 exit /b 1
:start
call "recall\SQL-Recall.bat"
