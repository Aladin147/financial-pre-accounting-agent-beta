# Release Instructions for Financial Pre-Accounting Agent v3.2.0-beta

This document provides step-by-step instructions for completing the v3.2.0-beta release process.

## Preparation Steps (Completed)

The following preparation steps have already been completed:

1. ✅ Version updated in package.json from "3.2.0-dev" to "3.2.0-beta"
2. ✅ CHANGELOG.md updated with release date and version
3. ✅ README.md updated with v3.2.0-beta features and version numbers
4. ✅ Release notes created in release_notes.md
5. ✅ Git commit script prepared (commit-v3.2.0-beta.bat)

## Release Process

Follow these steps to complete the release:

### Step 1: Verify Changes

1. Review all changes in the following files:
   - package.json - Verify version is "3.2.0-beta"
   - CHANGELOG.md - Verify release information is correct
   - README.md - Verify version badge and new features section
   - release_notes.md - Verify content accurately describes the release

2. Run the application to ensure everything works correctly:
   ```
   start-app.bat
   ```

### Step 2: Commit and Tag Release

1. Run the commit script to commit changes, create a tag, and push to GitHub:
   ```
   commit-v3.2.0-beta.bat
   ```

2. Verify in GitHub that:
   - All changes have been pushed successfully to the main branch
   - The v3.2.0-beta tag exists
   - The commit message properly describes the release

### Step 3: Create GitHub Release

1. Go to the GitHub repository
2. Navigate to "Releases"
3. Click "Create a new release"
4. Select the v3.2.0-beta tag
5. Enter "Financial Pre-Accounting Agent v3.2.0-beta" as the release title
6. Copy and paste the content from release_notes.md into the description
7. Mark it as a pre-release (beta)
8. Publish the release

## Post-Release

Now that the v3.2.0-beta release is complete, you can begin planning and developing features for v3.3.0:

- Code architecture refactoring
- "Review & Edit" screen for document data
- Improved error handling and user feedback
- Unit tests for tax calculation logic
- Additional features as outlined in the development roadmap

Use the master branch for future development, updating the version to "3.3.0-dev" when ready to begin work on the next version.

Happy coding!
