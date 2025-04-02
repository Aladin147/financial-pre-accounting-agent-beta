@echo off
ECHO ------------------------------------------------------------------------
ECHO Committing Financial Pre-Accounting Agent v3.2.0-beta
ECHO ------------------------------------------------------------------------
ECHO.

REM Navigate to project directory (adjust this if needed)
CD C:\Users\BLACKWOODS\Desktop\financial-pre-accounting-agent-beta

ECHO Step 1: Ensuring we're on the main branch...
git checkout main
ECHO.

ECHO Step 2: Checking Git status...
git status
ECHO.

ECHO Step 3: Adding all changes...
git add .
ECHO.

ECHO Step 4: Committing changes...
git commit -m "Release v3.2.0-beta with enhanced Document Manager"
ECHO.

ECHO Step 5: Creating version tag...
git tag -a v3.2.0-beta -m "Version 3.2.0-beta: Enhanced Document Manager with batch processing & OCR improvements"
ECHO.

ECHO Step 6: Pushing changes to main branch...
git push origin main
ECHO.

ECHO Step 7: Pushing tag to remote...
git push origin v3.2.0-beta
ECHO.

ECHO ------------------------------------------------------------------------
ECHO Process completed! v3.2.0-beta has been committed to the main branch.
ECHO The tag v3.2.0-beta has been created and pushed to GitHub.
ECHO ------------------------------------------------------------------------

ECHO.
ECHO Press any key to exit...
PAUSE > NUL
