# Document Management Enhancements for v3.2.0

This PR implements the document management enhancements for the Financial Pre-Accounting Manager v3.2.0. These changes are part of the document management phase of the v3.2.0 roadmap.

## Changes

### New Components
- Added `DocumentUploader` component with drag-and-drop functionality and multi-file support
- Added `DocumentProcessor` component for batch document processing with OCR

### Main Process Updates
- Enhanced IPC handlers in `main/index.js` to support batch file uploads
- Added progress tracking for document uploads and processing
- Improved error handling for document operations

### UI Enhancements
- Added upload modal with detailed progress tracking and results
- Added document processing interface with selection controls and progress indicators
- Improved document grid with processed status indicators

### Version Updates
- Updated version to 3.2.0-dev in package.json
- Added 3.2.0-dev section to CHANGELOG.md

## Testing Instructions
1. Run the application with `npm start` or using the `start-app.bat` script
2. Navigate to the Document Manager page
3. Test uploading multiple files using the "Upload Files" button
4. Test document processing using the document processor section
5. Verify that documents show appropriate processing status after OCR

## Screenshots
[Add screenshots here before merging]

## Next Steps
- Complete the financial data processing phase
- Implement comprehensive reports generation
- Enhance ZIP archive generation for accountant handover
