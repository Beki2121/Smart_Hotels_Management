@echo off
REM SmartHMS Quick Start Script for Windows

echo ================================
echo SmartHMS - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo Node.js found: 
node -v

REM Setup Backend
echo.
echo ================================
echo Setting up Backend...
echo ================================

cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed
)

if not exist ".env" (
    echo Creating .env file...
    (
        echo PORT=3001
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=ilinkmth_smarthms
        echo JWT_SECRET=your_secret_key_change_this
        echo JWT_REFRESH_SECRET=your_refresh_secret_change_this
        echo NODE_ENV=development
    ) > .env
    echo .env file created (update DB credentials if needed)
) else (
    echo .env file exists
)

REM Setup Frontend
echo.
echo ================================
echo Setting up Frontend...
echo ================================

cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

if not exist ".env.local" (
    echo Creating .env.local file...
    (
        echo VITE_API_URL=http://localhost:3001/api/v1
        echo VITE_SOCKET_URL=http://localhost:3001
        echo VITE_ENV=development
    ) > .env.local
    echo .env.local file created
) else (
    echo .env.local file exists
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Setup Database:
echo    mysql -u root -p ^< ..\database-mariadb.sql
echo.
echo 2. Start Backend (open new terminal):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (open new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open in Browser:
echo    http://localhost:5173
echo.
echo Demo Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Happy coding!
pause
