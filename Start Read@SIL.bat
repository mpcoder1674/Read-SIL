@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20.19 or newer is required. Install Node.js and try again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with npm enabled and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing Read@SIL dependencies for the first run...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example.
)
start "" http://localhost:8000
call npm start
pause
