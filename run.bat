@echo off
setlocal
title REALITYX - 3D World Builder

cd /d "%~dp0"

echo ==========================================
echo          REALITYX - 3D WORLD BUILDER
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo [ERROR] package.json not found.
    echo Place this BAT file in the project root.
    pause
    exit /b 1
)

echo [INFO] Node.js:
node --version
echo [INFO] npm:
call npm --version
echo.

if not exist "node_modules" (
    echo [INFO] Installing REALITYX dependencies...
    echo [INFO] This may take several minutes.
    echo.

    call npm install --verbose

    if errorlevel 1 (
        echo.
        echo [ERROR] Installation failed.
        echo Try running: npm cache clean --force
        echo Then run this BAT file again.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependencies already installed.
)

echo.
echo [INFO] Starting REALITYX...
echo [INFO] Keep this window open.
echo.

call npm run dev

echo.
echo [INFO] REALITYX development server stopped.
pause
endlocal
