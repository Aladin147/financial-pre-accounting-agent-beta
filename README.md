# Moroccan Pre-Accounting Manager

A cross-platform desktop application that serves as a "pre-accountant" tool for Moroccan companies. Based on Finance Law 2025 (Law No. 60-24), this tool helps organize financial documents, generate detailed financial and tax reports, and provide live payment estimations according to the latest tax regulations.

## Features

### Document Management & Organization
- Structured directory system for all financial documents with separate incoming and outgoing invoice categories
- Document import, scanning, and OCR capabilities
- Document search and filtering functionality
- Smart document classification and metadata extraction

### Financial Analysis
- Real-time financial dashboards with key metrics
- Revenue and expense tracking
- Profit margin analysis
- Period-to-period comparison

### Tax Calculation Engine
- Corporate Income Tax calculation with progressive rates (17.5%, 20%, 22.75%, 34%)
- VAT calculation with standard (20%) and reduced rates (7%, 10%, 14%)
- Social Solidarity Contribution calculation
- Minimum contribution calculations (0.25% of turnover)
- Special provisions for different company types and economic zones

### Reporting
- Comprehensive financial summary reports
- Detailed tax reports with breakdown by tax type
- Document inventory reports
- Custom period reports (monthly, quarterly, annual)
- PDF and Excel export options

### Archive Generation
- One-click ZIP archive generation for accountant handover
- Customizable document organization structures
- Inclusion of financial and tax summaries
- Optional password protection
- Direct email to accountant feature

### Real-Time Data Visualization
- Interactive financial charts and graphs
- Document distribution visualization
- Tax liability projections
- Historical performance comparisons

## Technology Stack

- **Framework**: Electron
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Database**: Embedded NeDB
- **Document Processing**: PDF.js, Tesseract.js
- **Visualization**: Chart.js
- **Export**: jsPDF, ExcelJS

## Architecture

The application follows a modular service-oriented architecture:

### Main Process Services
- **Document Service**: Handles document organization, processing, and archive generation
- **Tax Service**: Manages tax calculations based on Finance Law 2025
- **Report Service**: Generates comprehensive reports
- **Settings Service**: Manages application configuration
- **Event Bus**: Facilitates communication between services

### Renderer Process Components
- **Document Management UI**: For document upload, organization, and viewing
- **Tax Calculator UI**: For tax estimation and planning
- **Financial Dashboard**: For visualizing financial data
- **Archive Generator**: For creating accountant-ready document archives
- **Settings Panel**: For configuring application behavior

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 8 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/moroccan-pre-accounting-manager.git

# Navigate to project directory
cd moroccan-pre-accounting-manager

# Install dependencies
npm install

# Start the application
npm start
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Package for different platforms
npm run package-win
npm run package-mac
npm run package-linux
```

## Finance Law 2025 Integration

The application is designed specifically for the Moroccan Finance Law 2025 (Law No. 60-24) and includes:

- Progressive Corporate Income Tax rates:
  - 17.5% for income up to MAD 300,000
  - 20.0% for income from MAD 300,001 to MAD 1,000,000
  - 22.75% for income from MAD 1,000,001 to MAD 100 million
  - 34.0% for income above MAD 100 million

- Value-Added Tax rates:
  - Standard rate: 20%
  - Reduced rates: 7%, 10%, 14% for specific product categories

- Social Solidarity Contribution:
  - Progressive rates based on profit thresholds
  - Special exemptions for certain business types

- Minimum tax contribution calculation (0.25% of turnover)

- Special provisions for various sectors and business types

## Customization

The application can be customized through the settings panel:

- Company information
- Document categories and classification rules
- Default tax parameters
- Report templates
- Archive organization preferences
- Integration with accountant systems

## Data Security

- All data is stored locally on your machine
- Optional encryption for sensitive financial information
- Automated backups with configurable frequency
- No cloud dependencies unless explicitly enabled

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Moroccan Tax Authority (Direction Générale des Impôts)
- Finance Law 2025 (Law No. 60-24) documentation
- Electron community
- Open-source libraries used in this project

## Disclaimer

This tool is intended for pre-accounting organization and estimation only. It does not replace professional accounting services or official tax filings. Always consult with a certified accountant for official financial matters.
