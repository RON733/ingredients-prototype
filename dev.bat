@echo off
title G Shot Teas - Vite Vue 3 Dev Server
echo =========================================================
echo   Starting Vite Dev Server with Hot Module Replacement...
echo   URL: http://localhost:5173
echo =========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause
