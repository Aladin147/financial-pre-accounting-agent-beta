@echo off
echo.
echo ====================================================
echo   Launching Switch Component Demo
echo ====================================================
echo.

rem Determine if we have Chrome or Edge available
where chrome >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Opening with Chrome...
  start chrome "%~dp0switch-demo.html"
  goto end
)

where msedge >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Opening with Microsoft Edge...
  start msedge "%~dp0switch-demo.html"
  goto end
)

rem Fallback to default browser
echo Opening with default browser...
start "" "%~dp0switch-demo.html"

:end
echo.
echo If the demo does not open automatically, manually open switch-demo.html in your browser.
echo ====================================================
echo.

timeout /t 3
