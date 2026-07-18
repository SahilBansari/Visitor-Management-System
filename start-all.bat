@echo off
echo.
echo ========================================
echo    VMS System - Complete Startup
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Check if we're in the right directory
if not exist "vms-backend" (
    echo Error: vms-backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Step 1: Checking database...
cd vms-backend
echo   - Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo Error: Database initialization failed!
    pause
    exit /b 1
)
echo ✓ Database ready

echo.
echo Step 2: Starting backend server...
echo   - Backend will start on http://localhost:3001
echo   - Press Ctrl+C to stop the backend server
start cmd /k npm start
timeout /t 3 /nobreak

echo.
echo Step 3: Starting frontend development server...
cd ..
echo   - Frontend will start on http://localhost:3000
echo   - Frontend dev server will open in 5 seconds
timeout /t 5 /nobreak
call npm run dev

pause
