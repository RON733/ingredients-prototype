@echo off
echo ===================================
echo   G Shot Teas - Dev Server
echo ===================================
echo Open your browser to: http://localhost:8080
echo Press CTRL+C to stop.
echo.
python -m http.server 8080 --directory "%~dp0"
pause
