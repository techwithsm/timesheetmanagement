@echo off
echo Starting SchoolAttend servers...

start "Backend (port 3001)" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 4 /nobreak >nul
start "Frontend (port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting. Open http://localhost:3000 in your browser.
echo Close the two terminal windows to stop the servers.
