/**
 * PDF Report Generator for Financial Pre-Accounting Agent
 * 
 * This module provides advanced PDF report generation capabilities
 * using PDFKit for creating professional finance reports.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { logger } = require('./logger');

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info('Created directory:', { path: dirPath });
  }
};

/**
 * PDF Report Generator class
 */
class PDFReportGenerator {
  /**
   * Create a new PDF report
   * @param {Object} options - Report options
   * @param {string} options.title - Report title
   * @param {string} options.filename - Output filename (without extension)
   * @param {string} options.outputDir - Output directory
   * @param {Object} options.metadata - Report metadata
   * @param {string} options.company - Company name
   * @param {string} options.logo - Path to company logo (optional)
   */
  constructor(options) {
    this.title = options.title || 'Financial Report';
    this.filename = options.filename || `report-${Date.now()}`;
    this.outputDir = options.outputDir;
    this.metadata = options.metadata || {};
    this.company = options.company || 'Your Company';
    this.logo = options.logo;
    
    // Ensure output directory exists
    ensureDirectoryExists(this.outputDir);
    
    // Create PDF document
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: this.title,
        Author: 'Financial Pre-Accounting Agent',
        Subject: 'Financial Report',
        Keywords: 'finance, tax, accounting, morocco',
        CreationDate: new Date()
      }
    });
    
    // Set up the output stream
    this.outputPath = path.join(this.outputDir, `${this.filename}.pdf`);
    this.stream = fs.createWriteStream(this.outputPath);
    this.doc.pipe(this.stream);
    
    // Initialize counters and state
    this.currentPage = 1;
    this.totalPages = 1; // Will be updated later
    
    // Register events
    this.registerEvents();
    
    // Set default properties
    this.textColor = '#333333';
    this.accentColor = '#1a73e8';
    this.doc.font('Helvetica');
  }
  
  /**
   * Register document events
   */
  registerEvents() {
    // Track page changes for headers and footers
    this.doc.on('pageAdded', () => {
      this.currentPage++;
      this.totalPages++;
      this.addPageHeader();
      this.doc.fontSize(12);
      this.doc.fillColor(this.textColor);
    });
  }
  
  /**
   * Add page header to the current page
   */
  addPageHeader() {
    this.doc.save();
    
    // Company name or logo
    this.doc.fontSize(14).fillColor(this.accentColor);
    
    if (this.logo && fs.existsSync(this.logo)) {
      this.doc.image(this.logo, 50, 40, { width: 80 });
      this.doc.text(this.company, 140, 50);
    } else {
      this.doc.text(this.company, 50, 50);
    }
    
    // Report title
    this.doc.fontSize(22).fillColor(this.accentColor);
    this.doc.text(this.title, 50, 90, { align: 'center' });
    
    // Date
    this.doc.fontSize(10).fillColor('#666666');
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, 120, { align: 'center' });
    
    // Reset position and styles
    this.doc.fontSize(12).fillColor(this.textColor);
    
    // Horizontal line
    this.doc.moveTo(50, 140).lineTo(this.doc.page.width - 50, 140).stroke();
    
    // Move to content start position
    this.doc.moveDown(2);
    
    this.doc.restore();
  }
  
  /**
   * Add page footer to the current page
   */
  addPageFooter() {
    const footerTop = this.doc.page.height - 50;
    
    this.doc.save();
    this.doc.fontSize(10).fillColor('#666666');
    
    // Page number
    this.doc.text(
      `Page ${this.currentPage} of ${this.totalPages}`,
      50,
      footerTop,
      { align: 'center' }
    );
    
    // Company and application info
    this.doc.text(
      `Financial Pre-Accounting Agent | Based on Finance Law 2025 (Law No. 60-24)`,
      50,
      footerTop + 15,
      { align: 'center' }
    );
    
    // Legal disclaimer
    this.doc.fontSize(8).fillColor('#999999');
    this.doc.text(
      'This document is for informational purposes only and does not replace professional accounting advice.',
      50,
      footerTop + 30,
      { align: 'center' }
    );
    
    this.doc.restore();
  }
  
  /**
   * Add a section title
   * @param {string} title - Section title
   */
  addSectionTitle(title) {
    this.doc.fontSize(16).fillColor(this.accentColor);
    this.doc.text(title, { underline: true });
    this.doc.moveDown();
    this.doc.fontSize(12).fillColor(this.textColor);
  }
  
  /**
   * Add a subsection title
   * @param {string} title - Subsection title
   */
  addSubsectionTitle(title) {
    this.doc.fontSize(14).fillColor(this.accentColor);
    this.doc.text(title);
    this.doc.moveDown(0.5);
    this.doc.fontSize(12).fillColor(this.textColor);
  }
  
  /**
   * Add paragraph text
   * @param {string} text - Paragraph text
   */
  addParagraph(text) {
    this.doc.fontSize(12).fillColor(this.textColor);
    this.doc.text(text, { align: 'justify' });
    this.doc.moveDown();
  }
  
  /**
   * Add a simple table
   * @param {Array} headers - Table headers
   * @param {Array} rows - Table data rows
   * @param {Object} options - Table options
   */
  addTable(headers, rows, options = {}) {
    const cellPadding = options.cellPadding || 5;
    const fontSize = options.fontSize || 10;
    const headerColor = options.headerColor || this.accentColor;
    const lineColor = options.lineColor || '#cccccc';
    const lineWidth = options.lineWidth || 1;
    
    const columnCount = headers.length;
    const columnWidth = (this.doc.page.width - 100) / columnCount;
    
    // Save current position
    const startX = 50;
    let startY = this.doc.y;
    
    // Draw headers
    this.doc.fontSize(fontSize).fillColor(headerColor);
    headers.forEach((header, i) => {
      this.doc.text(
        header,
        startX + (i * columnWidth),
        startY,
        { width: columnWidth, align: 'left' }
      );
    });
    
    // Move to next row
    startY += 20;
    
    // Draw header separator line
    this.doc.moveTo(startX, startY).lineTo(startX + (columnWidth * columnCount), startY).lineWidth(lineWidth).stroke(lineColor);
    
    // Draw rows
    this.doc.fontSize(fontSize).fillColor(this.textColor);
    rows.forEach((row, rowIndex) => {
      const rowY = startY + ((rowIndex + 1) * 20);
      
      // Check if we need a new page
      if (rowY > this.doc.page.height - 70) {
        this.doc.addPage();
        startY = this.doc.y - ((rowIndex + 1) * 20);
      }
      
      // Draw cells
      row.forEach((cell, i) => {
        this.doc.text(
          String(cell), // Convert any non-string values to string
          startX + (i * columnWidth),
          startY + (rowIndex * 20) + cellPadding,
          { width: columnWidth, align: 'left' }
        );
      });
      
      // Draw row separator line (except for the last row)
      if (rowIndex < rows.length - 1) {
        const lineY = startY + ((rowIndex + 1) * 20);
        this.doc.moveTo(startX, lineY).lineTo(startX + (columnWidth * columnCount), lineY).lineWidth(0.5).stroke(lineColor);
      }
    });
    
    // Update document Y position
    this.doc.moveDown(rows.length + 2);
  }
  
  /**
   * Add a key-value information list
   * @param {Array} items - Array of {key, value} objects
   */
  addInfoList(items) {
    const startX = 50;
    const keyWidth = 200;
    const valueX = startX + keyWidth;
    
    items.forEach((item, i) => {
      const y = this.doc.y;
      
      // Key
      this.doc.fontSize(12).fillColor('#666666');
      this.doc.text(item.key, startX, y, { width: keyWidth });
      
      // Value
      this.doc.fontSize(12).fillColor(this.textColor);
      this.doc.text(item.value, valueX, y);
      
      this.doc.moveDown(0.5);
    });
    
    this.doc.moveDown();
  }
  
  /**
   * Add a chart placeholder (in V2 we're just adding a placeholder for charts)
   * @param {string} title - Chart title
   * @param {string} description - Chart description
   */
  addChartPlaceholder(title, description) {
    const boxWidth = 400;
    const boxHeight = 250;
    const x = (this.doc.page.width - boxWidth) / 2;
    const y = this.doc.y;
    
    // Draw chart box placeholder
    this.doc.save();
    this.doc.rect(x, y, boxWidth, boxHeight).lineWidth(1).stroke('#cccccc');
    
    // Chart title
    this.doc.fontSize(14).fillColor(this.accentColor);
    this.doc.text(title, x + 20, y + 20, { width: boxWidth - 40 });
    
    // Chart description
    this.doc.fontSize(10).fillColor('#666666');
    this.doc.text(description, x + 20, y + 50, { width: boxWidth - 40 });
    
    // Chart icon
    this.doc.fontSize(40).fillColor('#dddddd');
    this.doc.text('📊', x + (boxWidth / 2) - 20, y + 100);
    
    // Note about charts
    this.doc.fontSize(10).fillColor('#999999');
    this.doc.text(
      'Interactive charts are available in the application.',
      x + 20,
      y + boxHeight - 30,
      { width: boxWidth - 40, align: 'center' }
    );
    
    this.doc.restore();
    
    // Update Y position
    this.doc.moveDown(boxHeight / 20 + 1);
  }
  
  /**
   * Add a notes section
   * @param {Array} notes - Array of note strings
   */
  addNotes(notes) {
    this.addSectionTitle('Notes');
    
    notes.forEach((note, i) => {
      this.doc.fontSize(10).fillColor('#666666');
      this.doc.text(`${i + 1}. ${note}`, { align: 'left' });
      this.doc.moveDown(0.5);
    });
    
    this.doc.moveDown();
  }
  
  /**
   * Finalize and save the PDF document
   * @returns {Promise<string>} Path to the generated PDF file
   */
  async finalize() {
    return new Promise((resolve, reject) => {
      try {
        // Add footer to all pages
        const range = this.doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          this.doc.switchToPage(i);
          this.addPageFooter();
        }
        
        // End document
        this.doc.end();
        
        // Wait for file to be written
        this.stream.on('finish', () => {
          logger.info('PDF report generated successfully', { path: this.outputPath });
          resolve(this.outputPath);
        });
        
        this.stream.on('error', (err) => {
          logger.error('Error generating PDF report', { error: err.message });
          reject(err);
        });
      } catch (err) {
        logger.error('Error finalizing PDF report', { error: err.message });
        reject(err);
      }
    });
  }
}

/**
 * Create a financial summary report as PDF
 * 
 * @param {Object} data - Report data
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function generateFinancialSummaryReport(data, options) {
  try {
    const { outputDir, company, periodStart, periodEnd } = options;
    const dateFormat = new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Format dates
    const startDateStr = periodStart ? dateFormat.format(new Date(periodStart)) : 'N/A';
    const endDateStr = periodEnd ? dateFormat.format(new Date(periodEnd)) : 'N/A';
    
    // Create PDF report
    const report = new PDFReportGenerator({
      title: 'Financial Summary Report',
      filename: `financial-summary-${Date.now()}`,
      outputDir,
      metadata: {
        period: `${startDateStr} to ${endDateStr}`,
        generatedBy: 'Financial Pre-Accounting Agent v2.0.0-beta'
      },
      company
    });
    
    // Add report period
    report.addInfoList([
      { key: 'Period:', value: `${startDateStr} to ${endDateStr}` },
      { key: 'Currency:', value: 'MAD (Moroccan Dirham)' }
    ]);
    
    // Add summary section
    report.addSectionTitle('Financial Summary');
    
    // Summary data
    const summaryData = [
      { key: 'Total Revenue:', value: `${data.revenue?.toLocaleString() || 0} MAD` },
      { key: 'Total Expenses:', value: `${data.expenses?.toLocaleString() || 0} MAD` },
      { key: 'Net Profit/Loss:', value: `${(data.revenue - data.expenses).toLocaleString() || 0} MAD` },
      { key: 'Profit Margin:', value: `${data.profitMargin?.toFixed(2) || 0}%` }
    ];
    
    report.addInfoList(summaryData);
    
    // Chart placeholder
    report.addChartPlaceholder(
      'Revenue vs Expenses', 
      'This chart shows the comparison between revenue and expenses for the selected period.'
    );
    
    // Tax section
    report.addSectionTitle('Tax Information');
    
    const taxData = [
      { key: 'Taxable Income:', value: `${data.taxableIncome?.toLocaleString() || 0} MAD` },
      { key: 'Corporate Income Tax:', value: `${data.citAmount?.toLocaleString() || 0} MAD` },
      { key: 'VAT Collected:', value: `${data.vatCollected?.toLocaleString() || 0} MAD` },
      { key: 'VAT Paid:', value: `${data.vatPaid?.toLocaleString() || 0} MAD` },
      { key: 'VAT Balance:', value: `${data.vatBalance?.toLocaleString() || 0} MAD` },
      { key: 'Effective Tax Rate:', value: `${data.effectiveTaxRate?.toFixed(2) || 0}%` }
    ];
    
    report.addInfoList(taxData);
    
    // Document summary
    report.addSectionTitle('Document Summary');
    
    report.addSubsectionTitle('Document Counts');
    
    // Document summary table
    const docHeaders = ['Document Type', 'Count', 'Total Amount'];
    const docRows = [
      ['Incoming Invoices', data.incomingDocCount || 0, `${data.incomingAmount?.toLocaleString() || 0} MAD`],
      ['Outgoing Invoices', data.outgoingDocCount || 0, `${data.outgoingAmount?.toLocaleString() || 0} MAD`],
      ['Total', (data.incomingDocCount || 0) + (data.outgoingDocCount || 0), `${data.totalDocAmount?.toLocaleString() || 0} MAD`]
    ];
    
    report.addTable(docHeaders, docRows);
    
    // Add notes
    report.addNotes([
      'This is an automated report generated by the Financial Pre-Accounting Agent.',
      'All financial calculations are based on the data entered into the system.',
      'This report should be verified by a professional accountant before official use.',
      'Tax calculations are based on Finance Law 2025 (Law No. 60-24).'
    ]);
    
    // Finalize and save the report
    const pdfPath = await report.finalize();
    return pdfPath;
  } catch (error) {
    logger.error('Error generating financial summary report', { error: error.message });
    throw error;
  }
}

/**
 * Create a tax report as PDF
 * 
 * @param {Object} data - Report data
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function generateTaxReport(data, options) {
  try {
    const { outputDir, company, periodStart, periodEnd } = options;
    const dateFormat = new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Format dates
    const startDateStr = periodStart ? dateFormat.format(new Date(periodStart)) : 'N/A';
    const endDateStr = periodEnd ? dateFormat.format(new Date(periodEnd)) : 'N/A';
    
    // Create PDF report
    const report = new PDFReportGenerator({
      title: 'Tax Calculation Report',
      filename: `tax-report-${Date.now()}`,
      outputDir,
      metadata: {
        period: `${startDateStr} to ${endDateStr}`,
        generatedBy: 'Financial Pre-Accounting Agent v2.0.0-beta'
      },
      company
    });
    
    // Add report period
    report.addInfoList([
      { key: 'Period:', value: `${startDateStr} to ${endDateStr}` },
      { key: 'Tax Calculation Date:', value: dateFormat.format(new Date()) },
      { key: 'Tax Rule Version:', value: data.taxRuleVersion || '1.0.0' }
    ]);
    
    // Add summary section
    report.addSectionTitle('Tax Calculation Summary');
    
    // Summary data
    const summaryData = [
      { key: 'Total Revenue:', value: `${data.revenue?.toLocaleString() || 0} MAD` },
      { key: 'Total Expenses:', value: `${data.expenses?.toLocaleString() || 0} MAD` },
      { key: 'Other Deductions:', value: `${data.otherDeductions?.toLocaleString() || 0} MAD` },
      { key: 'Taxable Income:', value: `${data.taxableIncome?.toLocaleString() || 0} MAD` }
    ];
    
    report.addInfoList(summaryData);
    
    // Corporate Income Tax section
    report.addSectionTitle('Corporate Income Tax (CIT) Calculation');
    
    // Final tax info
    const taxInfoData = [
      { key: 'Calculated CIT:', value: `${data.calculatedTax?.toLocaleString() || 0} MAD` },
      { key: 'Minimum Contribution:', value: `${data.minimumContribution?.toLocaleString() || 0} MAD` },
      { key: 'Final Tax Amount:', value: `${data.finalTax?.toLocaleString() || 0} MAD` },
      { key: 'Effective Tax Rate:', value: `${data.effectiveTaxRate?.toFixed(2) || 0}%` }
    ];
    
    report.addInfoList(taxInfoData);
    
    // Tax brackets table
    report.addSubsectionTitle('Tax Bracket Breakdown');
    
    if (data.bracketDetails && data.bracketDetails.length > 0) {
      const bracketHeaders = ['Income Bracket', 'Rate', 'Taxable Amount', 'Tax'];
      const bracketRows = data.bracketDetails.map(bracket => [
        `${bracket.from?.toLocaleString() || 0} - ${bracket.to ? bracket.to.toLocaleString() : 'Above'} MAD`,
        `${bracket.rate?.toFixed(2) || 0}%`,
        `${bracket.amount?.toLocaleString() || 0} MAD`,
        `${bracket.tax?.toLocaleString() || 0} MAD`
      ]);
      
      report.addTable(bracketHeaders, bracketRows);
    } else {
      report.addParagraph('No tax bracket details available.');
    }
    
    // Minimum contribution note
    if (data.isMinimumApplied) {
      report.addParagraph(`Note: The minimum contribution of ${(data.minimumContribution / data.revenue * 100).toFixed(2)}% of turnover (${data.minimumContribution?.toLocaleString() || 0} MAD) has been applied as it exceeds the calculated tax amount.`);
    }
    
    // VAT section if data is available
    if (data.vatCollected !== undefined || data.vatPaid !== undefined) {
      report.addSectionTitle('Value Added Tax (VAT) Summary');
      
      const vatData = [
        { key: 'VAT Collected (Output):', value: `${data.vatCollected?.toLocaleString() || 0} MAD` },
        { key: 'VAT Paid (Input):', value: `${data.vatPaid?.toLocaleString() || 0} MAD` },
        { key: 'VAT Balance (To Pay/Recover):', value: `${data.vatBalance?.toLocaleString() || 0} MAD` }
      ];
      
      report.addInfoList(vatData);
    }
    
    // Tax filing information
    report.addSectionTitle('Tax Filing Information');
    
    const filingInfo = [
      { key: 'Annual Return Deadline:', value: 'March 31, 2026' },
      { key: 'Next Quarterly Payment:', value: 'June 30, 2025' }
    ];
    
    report.addInfoList(filingInfo);
    
    // Chart placeholder
    report.addChartPlaceholder(
      'Tax Breakdown', 
      'This chart shows the breakdown of your tax liability by category.'
    );
    
    // Add notes
    report.addNotes([
      'This tax calculation is based on Finance Law 2025 (Law No. 60-24).',
      'The calculation applies progressive tax rates as specified in the law.',
      'A minimum contribution of 0.25% of turnover applies if it exceeds the calculated tax.',
      'This report is for estimation purposes and should be verified by a professional accountant.'
    ]);
    
    // Finalize and save the report
    const pdfPath = await report.finalize();
    return pdfPath;
  } catch (error) {
    logger.error('Error generating tax report', { error: error.message });
    throw error;
  }
}

/**
 * Create a document inventory report as PDF
 * 
 * @param {Object} data - Report data
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function generateDocumentInventoryReport(data, options) {
  try {
    const { outputDir, company } = options;
    
    // Create PDF report
    const report = new PDFReportGenerator({
      title: 'Document Inventory Report',
      filename: `document-inventory-${Date.now()}`,
      outputDir,
      company
    });
    
    // Add report date
    const dateFormat = new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    report.addInfoList([
      { key: 'Inventory Date:', value: dateFormat.format(new Date()) }
    ]);
    
    // Add summary section
    report.addSectionTitle('Document Inventory Summary');
    
    // Summary data
    const summaryData = [
      { key: 'Total Documents:', value: data.totalDocuments || 0 },
      { key: 'Incoming Invoices:', value: data.incomingDocuments?.length || 0 },
      { key: 'Outgoing Invoices:', value: data.outgoingDocuments?.length || 0 }
    ];
    
    report.addInfoList(summaryData);
    
    // Incoming documents section
    report.addSectionTitle('Incoming Invoices (Expenses)');
    
    if (data.incomingDocuments && data.incomingDocuments.length > 0) {
      const incomingHeaders = ['Document Name', 'Date', 'Amount', 'Category'];
      const incomingRows = data.incomingDocuments.map(doc => [
        doc.filename || 'Unnamed',
        doc.documentDate ? dateFormat.format(new Date(doc.documentDate)) : 'N/A',
        `${doc.amount?.toLocaleString() || 0} MAD`,
        doc.category || 'Uncategorized'
      ]);
      
      report.addTable(incomingHeaders, incomingRows);
    } else {
      report.addParagraph('No incoming invoices found.');
    }
    
    // Outgoing documents section
    report.addSectionTitle('Outgoing Invoices (Revenue)');
    
    if (data.outgoingDocuments && data.outgoingDocuments.length > 0) {
      const outgoingHeaders = ['Document Name', 'Date', 'Amount', 'Category'];
      const outgoingRows = data.outgoingDocuments.map(doc => [
        doc.filename || 'Unnamed',
        doc.documentDate ? dateFormat.format(new Date(doc.documentDate)) : 'N/A',
        `${doc.amount?.toLocaleString() || 0} MAD`,
        doc.category || 'Uncategorized'
      ]);
      
      report.addTable(outgoingHeaders, outgoingRows);
    } else {
      report.addParagraph('No outgoing invoices found.');
    }
    
    // Chart placeholder
    report.addChartPlaceholder(
      'Document Distribution', 
      'This chart shows the distribution of documents by category.'
    );
    
    // Directory structure
    report.addSectionTitle('Document Directory Structure');
    report.addParagraph('Documents are organized in the following directory structure:');
    
    // Simple tree structure
    const directoryInfo = [
      { key: 'Root Directory:', value: data.rootDirectory || 'financial-data/documents' },
      { key: 'Incoming Invoices:', value: data.incomingDirectory || 'financial-data/documents/incoming' },
      { key: 'Outgoing Invoices:', value: data.outgoingDirectory || 'financial-data/documents/outgoing' }
    ];
    
    report.addInfoList(directoryInfo);
    
    // Add notes
    report.addNotes([
      'This report provides an inventory of all financial documents in the system.',
      'Documents are categorized as Incoming (expenses) or Outgoing (revenue).',
      'All amounts are in Moroccan Dirhams (MAD).',
      'Document dates are shown in the local time zone.'
    ]);
    
    // Finalize and save the report
    const pdfPath = await report.finalize();
    return pdfPath;
  } catch (error) {
    logger.error('Error generating document inventory report', { error: error.message });
    throw error;
  }
}

// Export the report generator functions
module.exports = {
  PDFReportGenerator,
  generateFinancialSummaryReport,
  generateTaxReport,
  generateDocumentInventoryReport
};
