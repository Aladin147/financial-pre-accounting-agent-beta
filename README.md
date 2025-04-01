# Financial Pre-Accounting Agent Beta v3.0.0-alpha.1

A cross-platform desktop application that serves as a "pre-accountant" tool for Moroccan companies, with comprehensive implementation of Finance Law 2025 (Law No. 60-24) tax regulations and intelligent document processing.

## Project Overview

Financial Pre-Accounting Agent is designed to help Moroccan businesses organize their financial documents, generate detailed financial and tax reports, and provide live payment estimations based on the latest Moroccan tax regulations—specifically, the Finance Law 2025 and related updates.

### Key Features (MVP v1.0.0)

- **Document Management & Organization**
  - Maintains a structured directory system for financial documents
  - Categorizes documents into incoming and outgoing invoices
  - Enables document importing, viewing, and organization

- **Tax Calculation Engine**
  - Implements Finance Law 2025 tax rules including:
    - Progressive Corporate Income Tax rates (17.5%, 20%, 22.75%, 34%)
    - Minimum contribution calculations
    - VAT handling
  - Provides detailed tax breakdowns

- **Basic Reporting**
  - Financial summaries
  - Tax estimation reports
  - Document inventory reports

## Getting Started

### Prerequisites

- Node.js (v12 or higher, but below v22)
- npm 

### Quick Start

The easiest way to run the application is to use the included batch file:

1. Double-click the `start-app.bat` file
2. The script will automatically install dependencies and launch the application

### Manual Installation and Running

```bash
# Clone the repository
git clone https://github.com/username/financial-pre-accounting-agent-beta.git
cd financial-pre-accounting-agent-beta

# Install dependencies
npm install

# Start the application in development mode
npm run dev
```

### Building Distributables

```bash
# Build for current platform
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## Troubleshooting

### Dependency Errors

If you encounter errors related to `better-sqlite3` or other native modules during installation:

1. This MVP version has been configured to use a lightweight JSON-based database (LowDB) instead of SQLite
2. Make sure you're using a Node.js version compatible with the dependencies (v12-v21 recommended)
3. Check the logs for more detailed error information

### Logging System

The application includes a comprehensive logging system:

1. Logs are stored in your application data directory:
   - Windows: `%APPDATA%\financial-pre-accounting-agent-beta\logs`
   - macOS: `~/Library/Application Support/financial-pre-accounting-agent-beta/logs`
   - Linux: `~/.local/share/financial-pre-accounting-agent-beta/logs`

2. View logs using the built-in log viewer:
   ```bash
   npm run logs
   ```

3. Log files are organized by date (YYYY-MM-DD.log)

### Common Issues

1. **Application won't start**
   - Check Node.js version compatibility
   - Delete `node_modules` folder and run `npm install` again
   - Check the logs for detailed error messages

2. **No documents showing in Document Manager**
   - Documents are stored in your application data directory
   - The first import might require restarting the application

3. **Tax calculations not working**
   - Verify the tax rules JSON file is properly formatted
   - Check the console for any JavaScript errors

## Security & Privacy

This application is designed with security and privacy in mind:

- **Completely Offline Operation**: No internet connection is required
- **Local Storage**: All data is stored locally on your device
- **No Telemetry**: The application does not collect any usage statistics or personal data
- **Local Data Storage**: For the MVP, data is stored in JSON files within your user directory

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: User interface library
- **LowDB**: Simple JSON-based database (for MVP)
- **Chart.js**: Data visualization
- **Excel.js & PDFKit**: Report generation

## Project Structure

```
financial-pre-accounting-agent-beta/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React UI components
│   ├── common/            # Shared utilities
│   │   └── logger.js      # Logging system
│   └── data/              # Data models and database
│       └── db.js          # LowDB implementation
├── resources/             # Static resources
│   └── tax-rules/         # Tax rule definitions
├── scripts/
│   ├── backup.js          # Backup utility
│   └── view-logs.js       # Log viewer
├── builds/                # Build outputs
├── start-app.bat          # Quick start script for Windows
└── docs/                  # Documentation
```

## Development Roadmap

- **v1.0.0-mvp** (Released): Core functionality with basic document management and tax calculations
  - Uses LowDB for simplified database operations
  - Basic logging and error handling
  - Minimal UI implementation

- **v2.0.0-beta** (Released): Enhanced document management, comprehensive tax engine, advanced reporting
  - Complete PDF report generation with professional formatting
  - Detailed implementation of Finance Law 2025 tax rules
  - Enhanced document metadata tracking
  - Improved user interface and experience

- **v3.0.0-alpha.1** (Current): Document intelligence and automated data extraction
  - Offline document text extraction from PDF, images, and Word documents
  - Automatic financial data recognition (amounts, dates, invoice numbers)
  - Smart document classification as incoming or outgoing
  - Confidence scoring for all extracted data
  - Batch processing of documents

- **v3.0.0-beta** (Planned): Advanced visualization, ZIP archiving
  - Interactive dashboards and charts
  - Excel report generation
  - ZIP archive generation for accountant handover

- **v4.0.0** (Planned): Production-ready with installer packages, documentation, and optimizations
  - Installer packages for all platforms
  - User documentation and tutorials
  - Performance optimizations
  - Cloud sync capabilities (optional)

## New in Version 2.0.0

### PDF Report Generation
- Professional PDF reports with company branding
- Multiple report types: Financial Summary, Tax Report, Document Inventory
- Detailed tax calculation breakdowns with visual elements

### Enhanced Tax Engine
- Complete implementation of Finance Law 2025 progressive tax rates
- Detailed bracket-by-bracket calculations
- Support for minimum contribution calculation
- Social solidarity contribution handling

### UI Improvements
- More responsive and intuitive interface
- Better error handling and user feedback
- Improved document management workflow

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is meant to assist with pre-accounting tasks and does not replace professional accounting advice. Always verify calculations with a certified accountant.
