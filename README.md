# Pre-Accounting Manager for Moroccan Companies

![Version](https://img.shields.io/badge/version-3.4.0--alpha-blue)
![Finance Law](https://img.shields.io/badge/Finance%20Law-2025-yellow)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-green)

A cross-platform desktop application that serves as a "pre-accountant" tool for Moroccan companies, helping to organize financial documents, generate detailed financial and tax reports, and provide live payment estimations based on the latest Moroccan tax regulations—specifically, the Finance Law 2025 (Law No. 60-24).

## Key Features

### Document Management & Organization
- Structured directory system for organizing financial documents
- Separate categories for incoming invoices, outgoing invoices, bank statements, etc.
- Import, view, search, and manage various document types

### Financial Reporting & Pre-Accounting Analysis
- Automatically generate detailed financial summaries
- Track expenses, revenues, and profit margins
- Breakdown income, costs, and tax-deductible items

### Live Tax Estimation
- Real-time tax calculations based on Finance Law 2025
- Progressive Corporate Income Tax rates (17.5% - 34.0%)
- Value-Added Tax (VAT) calculations
- Social Solidarity Contribution calculations

### Export & Archival Features
- Generate ZIP archives with organized document structure
- Prepare document packages for submission to accountants
- Export financial data in various formats (PDF, Excel)

### Real-Time Data Visualization
- Interactive charts and graphs for financial metrics
- Track revenue and expense trends
- Monitor tax liabilities
- Compare with historical financial data

## System Requirements

- **Operating Systems**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu, Debian, Fedora)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB of free disk space for the application, plus additional space for your documents
- **Node.js**: v16+ (for development only)

## Installation

### Production Installation

1. Download the installer for your operating system from the [Releases](https://example.com/releases) page:
   - Windows: `Financial-Pre-Accounting-Agent-Setup-x.x.x.exe`
   - macOS: `Financial-Pre-Accounting-Agent-x.x.x.dmg`
   - Linux: `financial-pre-accounting-agent_x.x.x_amd64.deb` or `financial-pre-accounting-agent-x.x.x.AppImage`

2. Run the installer and follow the on-screen instructions.

3. Launch the application from your applications menu or desktop shortcut.

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/financial-pre-accounting-agent.git
   cd financial-pre-accounting-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the application for your platform:
   ```bash
   # For all platforms
   npm run build
   
   # Platform-specific builds
   npm run build:win    # Windows
   npm run build:mac    # macOS
   npm run build:linux  # Linux
   ```

## Usage Guide

### Initial Setup

1. When you first launch the application, it will create a data directory in your Documents folder: `Financial Pre-Accounting Data`.

2. You can change this location from the Tools menu: Tools → Change Data Directory.

### Document Management

1. Navigate to the **Document Manager** from the sidebar menu.

2. Use the drag-and-drop area or the "Upload Files" button to import documents.

3. The application will attempt to automatically classify documents into appropriate categories.

4. View your documents in the grid or list view and use the search and filter options to find specific items.

### Tax Calculation

1. Navigate to the **Tax Calculator** from the sidebar menu.

2. Enter your company's financial data, including annual revenue, expenses, and other relevant information.

3. The calculator will automatically compute your tax liability based on the Finance Law 2025 rates.

4. View the detailed breakdown of your tax calculation, including the progressive tax brackets.

5. Export the tax calculation report as PDF or Excel for sharing with your accountant.

### Archive Generation

1. Navigate to the **Archive Generator** from the sidebar menu.

2. Configure the archive options, including the period, document types, and organization structure.

3. Click "Generate Archive" to create a ZIP file containing all your selected documents in an organized structure.

4. This archive can be directly submitted to your accountant or stored for record-keeping.

## Architecture

The application is built using Electron for cross-platform desktop support, with a focus on:

- **Security**: Secure document handling and storage
- **Performance**: Efficient processing of financial data
- **Usability**: Intuitive interface for non-technical users
- **Extensibility**: Modular design to accommodate future tax law changes

### Directory Structure

```
financial-pre-accounting-agent/
├── assets/              # Application icons and images
├── src/                 # Source code
│   ├── common/          # Shared utilities and processors
│   │   └── document-processor/ # Document parsing and analysis
│   ├── services/        # Core application services
│   │   ├── document/    # Document management
│   │   ├── tax/         # Tax calculation
│   │   └── report/      # Report generation
│   ├── renderer/        # UI components
│   └── main/            # Electron main process
├── resources/           # Application resources
│   └── tax-rules/       # Tax rate definitions and rules
└── scripts/             # Helper scripts for development
```

## Legal Disclaimer

This application is designed to assist with pre-accounting tasks and is not intended to replace professional accounting services. The tax calculations are based on our understanding of Finance Law 2025 (Law No. 60-24) but may not cover all specific cases or exemptions. Always consult with a certified accountant or tax professional for final verification of your financial and tax obligations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Finance Law 2025 (Law No. 60-24) documentation
- Electron framework
- Chart.js for data visualization
- jsZip for archive generation

---

© 2025 All Rights Reserved | Pre-Accounting Manager for Moroccan Companies
