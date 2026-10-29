@echo off
title G Shot Teas - Full-Stack Capstone Server (High-Performance 8-Workers)
echo =========================================================
echo   G SHOT TEAS - Ordering ^& Sales Management System
echo   STI College Santa Rosa - Capstone Project
echo   High-Performance Multi-Worker Mode (8 Workers)
echo =========================================================
echo.

set "PHP_DIR=C:\Users\Tyron Rico\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%PHP_DIR%;%NODE_DIR%;%PATH%"

:: 8 parallel worker threads so requests (Google sign-in, orders, etc.) never block each other!
set "PHP_CLI_SERVER_WORKERS=8"

cd /d "%~dp0backend"

echo [1/2] Verifying Supabase database and migrations...
call php artisan migrate --graceful --ansi

echo.
echo [2/2] Starting G Shot Teas Multi-Worker Server (8 Workers) on:
echo       --^> http://127.0.0.1:8000
echo.
echo Opening browser...
start http://127.0.0.1:8000
echo.
echo Press CTRL+C to stop the server.
echo =========================================================
echo.
php artisan serve --host=127.0.0.1 --port=8000
pause
