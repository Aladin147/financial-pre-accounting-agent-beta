@echo off
echo Stopping any running instances of the application...
taskkill /F /IM electron.exe > nul 2>&1
echo Starting the Financial Pre-Accounting Agent...
cd /d "%~dp0"
start "" npm start
echo Application restarted. UI improvements have been applied.
