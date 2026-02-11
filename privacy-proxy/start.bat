@echo off
REM Haven Privacy Proxy - Windows Launcher
REM Double-click this file to start the privacy proxy

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo X Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the proxy
echo.
node src/index.js

pause
