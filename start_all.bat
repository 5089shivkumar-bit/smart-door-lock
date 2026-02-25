@echo off
echo 🚀 Starting Smart Door Lock System...
echo.

:: 1. Start Backend API (Port 8000)
echo 🛠️ Starting Backend API...
start "Backend API" cmd /c "cd /d %~dp0backend && npm run dev"

:: 2. Start Biometric API (Port 8001)
echo 🧬 Starting Biometric API...
start "Biometric API" cmd /c "cd /d %~dp0edge && start_biometric_api.bat"

:: 3. Start User Portal (Port 5180)
echo 🌐 Starting User Portal...
start "User Portal" cmd /c "cd /d %~dp0frontend && npm run dev"

:: 4. Start Admin Dashboard (Port 5181)
echo 📊 Starting Admin Dashboard...
start "Admin Dashboard" cmd /c "cd /d %~dp0admin-panel && npm run dev"

echo.
echo ✅ All services are starting in separate windows.
echo 💡 Please wait a few seconds for the servers to initialize.
echo.
echo 🔗 Links:
echo - Frontend Portal: http://localhost:5180
echo - Backend API: http://localhost:8000
echo - Admin Dashboard: http://localhost:5181
echo - Biometric API: http://localhost:8001
echo.
pause
