@echo off
echo Stopping SchoolAttend servers...

taskkill /FI "WINDOWTITLE eq Backend (port 3001)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend (port 3000)*" /T /F >nul 2>&1

echo Releasing port 3001 (backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo Releasing port 3000 (frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo.
echo Both servers stopped.
