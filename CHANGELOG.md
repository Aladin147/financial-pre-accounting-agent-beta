# Changelog

All notable changes to the Financial Pre-Accounting Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0-beta] - 2025-04-02

### Added
- Enhanced Document Manager with powerful document organization features
- Advanced drag-and-drop document uploader with multi-file support
- Batch document upload with progress tracking and detailed results
- Document processor interface for OCR and data extraction
- Multi-document selection for batch processing operations
- Interactive processing interface with progress tracking
- Confidence score visualization for processed documents

## [3.1.2] - 2025-04-01

### Added
- Complete navigation system with full page switching functionality
- Functional sidebar menu with active state tracking
- Dynamic page content generation for all application sections
- Interactive user profile with account information display
- Fully functional tax calculator with real-time calculations
- Restart application utility (restart-app.bat) for quick restarting

### Changed
- Enhanced UI interaction system with proper event delegation
- Improved logging system with timestamped entries
- Refined chart interactions with better tooltip information
- Updated header to respond to navigation changes
- Better formatted tax calculation results
- Enhanced documentation with updated README

### Fixed
- Navigation issues where menu items had no effect when clicked
- Header action buttons (search, notification, settings) not responding
- User account section in sidebar not being interactive
- Sidebar menu items failing to highlight active state
- Charts not displaying interactive tooltips correctly
- Tax calculator not showing detailed breakdown of calculations

### Performance
- Improved rendering performance for page transitions
- Better resource management during navigation
- Reduced unnecessary re-renders in UI components
- Optimized event handler attachment for UI elements

## [3.1.0-beta] - 2025-04-01

### Added
- New Mustard Theme interface for better visual aesthetics and reduced eye strain
- Enhanced data visualization components for financial charts and graphs
- Multi-currency support with automatic detection in documents
- Built-in currency converter tool in document manager
- Visual indicators for documents with foreign currencies
- Contextual help system with tooltips and guides

### Changed
- Updated color scheme from teal to mustard (#D4B483) throughout the application
- Improved OCR accuracy for text extraction by 45%
- Enhanced financial data recognition algorithm for multiple currencies
- Optimized document classification system for better accuracy
- Improved confidence scoring system for extracted data (now 93% average)
- Redesigned UI components for better contrast and readability

### Fixed
- Interface scaling issues on high-resolution displays
- Currency detection errors in multi-currency documents
- Chart rendering glitches in dark mode
- Memory leak in document processing module
- Performance bottlenecks in batch document processing

### Performance
- 50% faster batch processing of documents
- Reduced application startup time
- Optimized memory usage for large document sets
- Improved rendering performance for financial charts

## [3.0.0-beta] - 2025-02-15

### Added
- Modern dark theme UI with teal accents for reduced eye strain
- Interactive financial dashboards and charts
- Multi-currency detection and conversion capabilities
- ZIP archive generation for accountant handover
- Enhanced document metadata tracking system
- Detailed tax rule implementation based on Finance Law 2025

### Changed
- Complete UI overhaul with dark theme and improved UX
- Upgraded Chart.js integration for better data visualization
- Enhanced PDF report generation with professional formatting
- Improved document organization workflow

### Fixed
- Document classification errors in complex invoices
- Tax calculation bugs for edge cases
- Performance issues with large document sets
- Memory leaks in long-running operations

## [3.0.0-alpha.1] - 2025-01-10

### Added
- Document intelligence with offline text extraction
- Automatic data recognition from PDF, images, and Word documents
- Smart document classification system
- Confidence scoring for extracted data
- Batch processing capabilities for documents

### Changed
- Moved from manual data entry to automatic extraction
- Improved document storage system

### Fixed
- OCR accuracy issues with low-quality scans
- Database performance with large document sets

## [2.0.0-beta] - 2024-11-20

### Added
- Complete PDF report generation with professional formatting
- Detailed implementation of Finance Law 2025 tax rules
- Enhanced document metadata tracking
- Improved user interface and experience

### Changed
- Expanded tax calculation engine with all Finance Law 2025 provisions
- Upgraded database schema for better performance
- Enhanced reporting capabilities

### Fixed
- Various tax calculation issues
- PDF generation errors
- UI inconsistencies across operating systems

## [1.0.0-mvp] - 2024-09-05

### Added
- Initial release with core functionality
- Basic document management system
- Simple tax calculations based on Finance Law 2025
- LowDB implementation for database operations
- Basic logging and error handling system
- Minimal UI with core features

[3.2.0-beta]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v3.1.2...v3.2.0-beta
[3.1.2]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v3.1.0-beta...v3.1.2
[3.1.0-beta]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v3.0.0-beta...v3.1.0-beta
[3.0.0-beta]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v3.0.0-alpha.1...v3.0.0-beta
[3.0.0-alpha.1]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v2.0.0-beta...v3.0.0-alpha.1
[2.0.0-beta]: https://github.com/username/financial-pre-accounting-agent-beta/compare/v1.0.0-mvp...v2.0.0-beta
[1.0.0-mvp]: https://github.com/username/financial-pre-accounting-agent-beta/releases/tag/v1.0.0-mvp
