@echo off
cd /d "%~dp0"
echo ======================================================================
echo  Cooperative Service Marketplace - Cooperative Admin Command Center
echo ======================================================================
echo.
echo Starting Fast Threaded HTTP Server on Port 8080...
echo.
echo  --^> Open in your browser: http://localhost:8080/index.html
echo  --^> Or: http://127.0.0.1:8080/index.html
echo.
python server.py
pause
