@echo off
echo ==================================
echo ATS Resume Optimizer - Quick Setup
echo ==================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js v18+ first.
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detected
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist "package.json" (
    echo X Backend package.json not found!
    pause
    exit /b 1
)

echo Installing backend dependencies...
call npm install

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo WARNING: Edit backend\.env and add your API keys!
    echo   - Add OPENAI_API_KEY or GEMINI_API_KEY
    echo   - Update MONGODB_URI if using MongoDB Atlas
)

cd ..

REM Frontend setup
echo.
echo Setting up frontend...
cd frontend

if not exist "package.json" (
    echo X Frontend package.json not found!
    pause
    exit /b 1
)

echo Installing frontend dependencies...
call npm install

cd ..

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo Next steps:
echo 1. Edit backend\.env and add your API keys
echo 2. Start MongoDB (or use MongoDB Atlas)
echo 3. Run: cd backend ^&^& npm run dev
echo 4. In new terminal: cd frontend ^&^& npm run dev
echo.
echo See SETUP.md for detailed instructions!
echo.
pause
