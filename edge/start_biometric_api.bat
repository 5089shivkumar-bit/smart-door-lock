@echo off
SETLOCAL EnableDelayedExpansion

echo 🔍 Checking for Python installation...

:: Try standard python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PY_CMD=python
    goto FOUND
)

:: Try py launcher
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PY_CMD=py
    goto FOUND
)

:: Try common Windows User path (Python 3.10)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set PY_CMD="%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto FOUND
)

:: Try common Windows User path (Python 3.9)
if exist "%LOCALAPPDATA%\Programs\Python\Python39\python.exe" (
    set PY_CMD="%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
    goto FOUND
)

:: Try AppData Local path
if exist "%USERPROFILE%\AppData\Local\Microsoft\WindowsApps\python.exe" (
    set PY_CMD="%USERPROFILE%\AppData\Local\Microsoft\WindowsApps\python.exe"
    goto FOUND
)

echo ❌ Python not found in standard paths.
echo Please ensure Python is installed and added to your PATH environment variable.
echo Or edit this file to include your specific python.exe path.
pause
exit /b

:FOUND
echo ✅ Using Python command: !PY_CMD!
echo 🚀 Starting Biometric API on http://localhost:8000...

!PY_CMD! biometric_api.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Server crashed or failed to start.
    echo Ensuring dependencies are installed...
    !PY_CMD! -m pip install fastapi uvicorn face_recognition pillow numpy
    echo.
    echo 🔄 Retrying...
    !PY_CMD! biometric_api.py
)

pause
