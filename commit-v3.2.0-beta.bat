@echo off
ECHO ------------------------------------------------------------------------
ECHO Committing Financial Pre-Accounting Agent v3.2.0-beta
ECHO ------------------------------------------------------------------------
ECHO.

REM Navigate to project directory (adjust this if needed)
CD C:\Users\BLACKWOODS\Desktop\financial-pre-accounting-agent-beta

ECHO Step 1: Getting current branch...
FOR /F "tokens=*" %%g IN ('git rev-parse --abbrev-ref HEAD') do (SET CURRENT_BRANCH=%%g)
ECHO Current branch: %CURRENT_BRANCH%
ECHO.

ECHO Step 2: Checking Git status...
git status
ECHO.

ECHO Step 3: Adding all changes...
git add .
ECHO.

ECHO Step 4: Committing changes...
git commit -m "Release v3.2.0-beta with enhanced Document Manager"
IF %ERRORLEVEL% NEQ 0 (
  ECHO No changes to commit or commit failed.
  ECHO This is ok if all changes were already committed.
)
ECHO.

ECHO Step 5: Creating/updating version tag...
git tag -d v3.2.0-beta 2>nul
git tag -a v3.2.0-beta -m "Version 3.2.0-beta: Enhanced Document Manager with batch processing & OCR improvements"
ECHO.

ECHO Step 6: Pushing changes to remote branch...
git push origin %CURRENT_BRANCH%
ECHO.

ECHO Step 7: Pushing tag to remote...
git push -f origin v3.2.0-beta
ECHO.

ECHO ------------------------------------------------------------------------
ECHO Process completed! v3.2.0-beta has been tagged and pushed to GitHub.
ECHO ------------------------------------------------------------------------

ECHO.
ECHO Press any key to exit...
PAUSE > NUL
