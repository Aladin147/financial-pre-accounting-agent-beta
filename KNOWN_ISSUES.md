# Known Issues

**Version:** 1.0.0  
**Last Updated:** April 4, 2025  
**Status:** Active  
**Owner:** Development Team  

## Overview

This document tracks known issues, bugs, limitations, and technical debt items in the Financial Pre-Accounting Agent Beta project. The purpose is to maintain transparency about the current state of the project, prioritize fixes, and ensure that no issues are forgotten or overlooked.

## Issue Tracking Guidelines

Each issue entry should include:

1. **ID**: Unique identifier (e.g., KI-001)
2. **Title**: Brief descriptive title
3. **Description**: Detailed description of the issue
4. **Component**: Affected component or module
5. **Severity**: Critical, Major, Moderate, Minor, or Trivial
6. **Status**: Open, In Progress, Fixed, or Wontfix
7. **Workaround**: Temporary solution if available
8. **Reported Date**: When the issue was identified
9. **Target Fix Version**: Planned version for fix
10. **Assigned To**: Person responsible for fixing

## Current Issues

### KI-001: DashboardGrid Layout Breaks at Specific Widths

- **Description**: The dashboard grid layout breaks when the viewport width is between 768px and 820px, causing widgets to overlap.
- **Component**: UI / DashboardGrid
- **Severity**: Moderate
- **Status**: Open
- **Workaround**: Resize browser window to avoid the problematic width range
- **Reported Date**: March 30, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: UI Team

### KI-002: Memory Leak in Document Processing Service

- **Description**: Memory usage gradually increases when processing large batches of documents, indicating a potential memory leak.
- **Component**: DocumentService
- **Severity**: Major
- **Status**: In Progress
- **Workaround**: Restart the service after processing large batches
- **Reported Date**: March 25, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Backend Team

### KI-003: Tax Calculation Rounding Inconsistency

- **Description**: In some edge cases, tax calculations show rounding inconsistencies of up to 0.01 units.
- **Component**: TaxService
- **Severity**: Minor
- **Status**: Open
- **Workaround**: Manual verification of calculations in affected cases
- **Reported Date**: April 1, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Financial Logic Team

### KI-004: Report Generation Timeout for Very Large Datasets

- **Description**: Report generation times out when processing datasets with more than 10,000 records.
- **Component**: ReportService
- **Severity**: Moderate
- **Status**: Open
- **Workaround**: Split large reports into smaller chunks
- **Reported Date**: March 28, 2025
- **Target Fix Version**: 3.4.0
- **Assigned To**: Backend Team

### KI-005: Purple Theme Color Inconsistency in Dark Mode

- **Description**: Some UI components don't properly adapt to dark mode while using the purple theme, resulting in low contrast text.
- **Component**: UI / ThemeProvider
- **Severity**: Minor
- **Status**: Open
- **Workaround**: Use light mode with the purple theme
- **Reported Date**: April 2, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: UI Team

### KI-006: Archive Generation Fails with Non-ASCII Filenames

- **Description**: The archive generation process fails when document filenames contain non-ASCII characters.
- **Component**: ArchiveGenerator
- **Severity**: Moderate
- **Status**: Open
- **Workaround**: Rename files to use only ASCII characters before archiving
- **Reported Date**: March 31, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Backend Team

### KI-007: Browser Compatibility Issues with Internet Explorer

- **Description**: Several UI components render incorrectly or don't function properly in Internet Explorer 11.
- **Component**: UI / Multiple Components
- **Severity**: Moderate
- **Status**: Wontfix
- **Workaround**: Use a modern browser (Chrome, Firefox, Edge)
- **Reported Date**: March 15, 2025
- **Target Fix Version**: N/A
- **Assigned To**: N/A
- **Note**: Support for Internet Explorer is being discontinued in favor of modern browsers

### KI-008: Performance Degradation with Large Document Libraries

- **Description**: UI responsiveness decreases significantly when navigating document libraries with more than 5,000 documents.
- **Component**: DocumentManager
- **Severity**: Major
- **Status**: In Progress
- **Workaround**: Filter document views to reduce the number of displayed documents
- **Reported Date**: March 20, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Performance Team

### KI-009: Intermittent Connection Loss with Storage Service

- **Description**: Storage service occasionally loses connection, requiring application restart.
- **Component**: StorageService
- **Severity**: Major
- **Status**: Open
- **Workaround**: Restart application if connection is lost
- **Reported Date**: April 3, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Infrastructure Team

### KI-010: ConfigBridge Settings Not Persisting After Application Update

- **Description**: User settings managed through ConfigBridge are sometimes reset after application updates.
- **Component**: ConfigBridge
- **Severity**: Moderate
- **Status**: Open
- **Workaround**: Manually backup settings before updates
- **Reported Date**: March 29, 2025
- **Target Fix Version**: 3.3.0
- **Assigned To**: Backend Team

## Recently Fixed Issues

### KI-011: DatePicker Component Selection Bug

- **Description**: Calendar date selection in DatePicker component sometimes selects wrong date when crossing month boundaries.
- **Component**: UI / DatePicker
- **Severity**: Major
- **Status**: Fixed
- **Fix Version**: 3.2.1
- **Fixed Date**: April 3, 2025
- **Fixed By**: UI Team

### KI-012: PDF Generation Fails for Large Tables

- **Description**: PDF generation fails silently when reports contain tables with more than 100 rows.
- **Component**: PdfGenerator
- **Severity**: Major
- **Status**: Fixed
- **Fix Version**: 3.2.1
- **Fixed Date**: April 2, 2025
- **Fixed By**: Report Team

## Issue Reporting

To report a new issue:

1. Check if the issue is already documented in this file
2. If not, create a new issue entry following the format above
3. Assign appropriate severity and component
4. Add to this document via a pull request
5. Create corresponding ticket in the project management system

## Issue Prioritization

Issues are prioritized based on:

1. Severity (Critical issues addressed first)
2. Impact on user experience
3. Availability of workarounds
4. Strategic importance of affected features
5. Difficulty of implementation

## Issue Review Process

This document is reviewed weekly during team meetings to:

1. Update status of existing issues
2. Prioritize open issues
3. Verify fix effectiveness for closed issues
4. Assign resources to high-priority issues

---

*This Known Issues document is continuously updated as issues are identified and resolved.*
