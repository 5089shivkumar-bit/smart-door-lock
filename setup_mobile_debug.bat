@echo off
echo 📱 Starting Mobile USB Debugging Setup...

:: Check for adb
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ADB (Android Debug Bridge) not found. 
    echo Please install Android Platform Tools and add it to your PATH.
    pause
    exit /b
)

echo 🔍 Checking for connected devices...
adb devices

echo 🔄 Setting up Port Forwarding (ADB Reverse)...
echo 🌐 Frontend:	5173 -> 5173
adb reverse tcp:5173 tcp:5173

echo 🛠️ Admin API:	5000 -> 5000
adb reverse tcp:5000 tcp:5000

echo 🧬 Biometric API:	8000 -> 8000
adb reverse tcp:8000 tcp:8000

echo.
echo ✅ Setup Complete!
echo 📝 Instructions:
echo 1. Open Chrome on your mobile device.
echo 2. Navigate to: http://localhost:5173
echo.
echo ⚠️ Note: Keep this terminal open or do not disconnect the USB cable.
pause
