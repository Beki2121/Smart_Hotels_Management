@echo off
cd /d "d:\$Website\Smart Hotel Management\Smart_Hotel_Management\frontend"
echo Installing frontend dependencies...
call npm install
echo.
echo Dependencies installed!
echo.
echo To start the frontend, run:
echo npm run dev
echo.
pause
