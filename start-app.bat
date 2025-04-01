@echo off
echo Starting Financial Pre-Accounting Agent Beta...

rem Navigate to project directory (assuming the script is in the project root)
cd /d "%~dp0"

rem Install dependencies if node_modules doesn't exist
if not exist node_modules (
  echo Installing dependencies...
  npm install
)

rem Launch the application in development mode
echo Launching application...
npm run dev

pause
