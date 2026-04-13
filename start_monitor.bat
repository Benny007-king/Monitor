@echo off
echo ===================================================
echo       Gateway Monitor - Build and Start Script
echo ===================================================
echo.

echo [Step 1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [Step 2/3] Building the App...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [Step 3/3] Starting server on port 3000 in Production mode...
set "NODE_ENV=production"
call npx tsx server.ts
pause