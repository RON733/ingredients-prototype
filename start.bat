@echo off
title G Shot Teas - Full-Stack Capstone Server
echo =========================================================
echo   G SHOT TEAS - Ordering ^& Sales Management System
echo   STI College Santa Rosa - Capstone Project
echo =========================================================
echo.

set "PHP_DIR=C:\Users\Tyron Rico\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%PHP_DIR%;%NODE_DIR%;%PATH%"

cd /d "%~dp0backend"

echo [1/3] Verifying database and migrations...
call php artisan migrate --graceful --ansi

echo.
echo [2/3] Starting Laravel Reverb Real-Time WebSocket Server on:
echo       --^> ws://127.0.0.1:8080
start "G Shot Teas - Reverb WebSockets" /min php artisan reverb:start --port=8080

echo.
echo [3/3] Starting G Shot Teas Full-Stack Server on:
echo       --^> http://127.0.0.1:8000
echo.
echo Opening browser...
start http://127.0.0.1:8000
echo.
echo Press CTRL+C to stop the HTTP server.
echo =========================================================
echo.
php artisan serve --host=127.0.0.1 --port=8000
pause