const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { logger } = require('../common/logger');
const { initDatabase, documentOps } = require('../data/db');
const { DocumentProcessor } = require('../common/document-processor');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Define the path for user data
const userDataPath = path.join(app.getPath('userData'), 'financial-data');

// Ensure the financial data directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
  logger.info('Created financial data directory at:', { path: userDataPath });
}

// Initialize database
try {
  initDatabase();
  logger.info('Database initialized successfully');
} catch (error) {
  logger.error('Failed to initialize database:', { error: error.message });
}

// Create document directories
const documentsPath = path.join(userDataPath, 'documents');
const incomingInvoicesPath = path.join(documentsPath, 'incoming');
const outgoingInvoicesPath = path.join(documentsPath, 'outgoing');

// Ensure document directories exist
[documentsPath, incomingInvoicesPath, outgoingInvoicesPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info('Created directory:', { path: dir });
  }
});

function createWindow() {
  logger.info('Creating main application window');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security: Disable Node.js integration
      contextIsolation: true, // Security: Enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Use a preload script
    },
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  const isDev = process.argv.includes('--dev');
  
  try {
    // Use standalone.html for more reliable rendering
    const rendererPath = path.join(__dirname, '../../standalone.html');
    logger.info('Loading renderer from path:', { path: rendererPath });
    
    // Always load from local file for simplicity during beta
    mainWindow.loadFile(rendererPath);
    
    if (isDev) {
      // Open DevTools in development mode
      mainWindow.webContents.openDevTools();
      logger.info('Running in development mode with DevTools enabled');
    } else {
      logger.info('Running in production mode');
    }
  } catch (error) {
    logger.error('Error loading renderer:', { error: error.message });
  }

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    logger.info('Application window displayed');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    logger.info('Application window closed');
  });
}

// Create window when Electron is ready
app.on('ready', () => {
  logger.info('Application ready, creating window');
  createWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows closed, quitting application');
    app.quit();
  }
});

// Re-create window on macOS when dock icon is clicked and no windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    logger.info('Activate event received, creating window');
    createWindow();
  }
});

// IPC Handlers for file system operations
ipcMain.handle('get-document-paths', () => {
  logger.debug('get-document-paths IPC handler called');
  return {
    main: documentsPath,
    incoming: incomingInvoicesPath,
    outgoing: outgoingInvoicesPath
  };
});

// Handler to import a file into the documents directory via file dialog
ipcMain.handle('import-document', async (event, targetDir) => {
  logger.info('import-document IPC handler called', { targetDir });
  
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'doc', 'docx', 'csv'] },
      ],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      // For backward compatibility, if only one file is selected, process it directly
      if (result.filePaths.length === 1) {
        const sourcePath = result.filePaths[0];
        const targetPath = path.join(
          targetDir === 'incoming' ? incomingInvoicesPath : 
          targetDir === 'outgoing' ? outgoingInvoicesPath : 
          documentsPath,
          path.basename(sourcePath)
        );
        
        // Copy the file to the appropriate directory
        fs.copyFileSync(sourcePath, targetPath);
        logger.info('Document imported successfully', { 
          source: sourcePath, 
          target: targetPath,
          type: targetDir
        });
        
        // Add document to database
        const isIncoming = targetDir === 'incoming';
        const filename = path.basename(sourcePath);
        
        documentOps.addDocument({
          filename,
          filePath: targetPath,
          documentType: path.extname(sourcePath).substring(1),
          isIncoming,
          documentDate: new Date().toISOString()
        });
        
        return { success: true, path: targetPath };
      } else {
        // If multiple files are selected, use the upload-files handler with the selected paths
        return await handleUploadFiles(event, result.filePaths, targetDir);
      }
    }
    logger.info('Document import cancelled by user');
    return { success: false, message: 'File selection cancelled' };
  } catch (error) {
    logger.error('Error importing document', { error: error.message });
    return { success: false, message: error.message };
  }
});

// Handler for uploading multiple files
ipcMain.handle('upload-files', async (event, filePaths, targetDir, progressChannel) => {
  return await handleUploadFiles(event, filePaths, targetDir, progressChannel);
});

// Helper function to handle file uploads
async function handleUploadFiles(event, filePaths, targetDir, progressChannel) {
  logger.info('Handling upload of multiple files', { 
    fileCount: filePaths.length, 
    targetDir 
  });
  
  try {
    const results = {
      success: true,
      totalFiles: filePaths.length,
      successfulFiles: 0,
      failedFiles: 0,
      processedFiles: [],
      errors: []
    };
    
    // Set target directory
    const targetDirPath = 
      targetDir === 'incoming' ? incomingInvoicesPath : 
      targetDir === 'outgoing' ? outgoingInvoicesPath : 
      documentsPath;
    
    // Process each file
    for (let i = 0; i < filePaths.length; i++) {
      const sourcePath = filePaths[i];
      const filename = path.basename(sourcePath);
      const targetPath = path.join(targetDirPath, filename);
      
      try {
        // Send progress update
        if (progressChannel) {
          event.sender.send(progressChannel, {
            filename,
            percent: Math.round((i / filePaths.length) * 100),
            current: i + 1,
            total: filePaths.length
          });
        }
        
        // Copy the file to the target directory
        fs.copyFileSync(sourcePath, targetPath);
        
        // Add to database
        const isIncoming = targetDir === 'incoming';
        const documentType = path.extname(sourcePath).substring(1).toLowerCase();
        
        const docId = documentOps.addDocument({
          filename,
          filePath: targetPath,
          documentType,
          isIncoming,
          documentDate: new Date().toISOString()
        });
        
        // Add to results
        results.successfulFiles++;
        results.processedFiles.push({
          id: docId,
          filename,
          path: targetPath,
          documentType,
          isIncoming
        });
        
        logger.info('File uploaded successfully', {
          source: sourcePath,
          target: targetPath,
          type: targetDir
        });
      } catch (error) {
        // Log error and continue with next file
        logger.error('Error uploading file', {
          source: sourcePath,
          error: error.message
        });
        
        results.failedFiles++;
        results.errors.push({
          filename,
          error: error.message
        });
      }
    }
    
    // Send final progress update
    if (progressChannel) {
      event.sender.send(progressChannel, {
        percent: 100,
        current: filePaths.length,
        total: filePaths.length,
        completed: true
      });
    }
    
    // Return results
    results.success = results.successfulFiles > 0;
    
    logger.info('Multiple file upload completed', {
      totalFiles: results.totalFiles,
      successful: results.successfulFiles,
      failed: results.failedFiles
    });
    
    return results;
  } catch (error) {
    logger.error('Error handling multiple file upload', {
      error: error.message
    });
    
    return {
      success: false,
      message: error.message,
      totalFiles: filePaths.length,
      successfulFiles: 0,
      failedFiles: filePaths.length
    };
  }
}

// Handler to list documents
ipcMain.handle('list-documents', (event, dirType) => {
  logger.debug('list-documents IPC handler called', { dirType });
  
  try {
    // Get documents from database instead of directly from filesystem
    const documents = documentOps.getDocumentsByType(dirType);
    
    // If no documents in database yet, fall back to filesystem
    if (documents.length === 0) {
      const dirPath = 
        dirType === 'incoming' ? incomingInvoicesPath : 
        dirType === 'outgoing' ? outgoingInvoicesPath : 
        documentsPath;
        
      const files = fs.readdirSync(dirPath);
      
      logger.debug('Reading documents from filesystem', { 
        dirType, 
        count: files.length 
      });
      
      return files.map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          isDirectory: stats.isDirectory(),
        };
      });
    }
    
    logger.debug('Returning documents from database', { 
      dirType, 
      count: documents.length 
    });
    
    // Convert database documents to format expected by UI
    return documents.map(doc => ({
      id: doc.id,
      name: doc.filename,
      path: doc.filePath,
      size: fs.existsSync(doc.filePath) ? fs.statSync(doc.filePath).size : 0,
      createdAt: new Date(doc.dateAdded),
      modifiedAt: new Date(doc.dateAdded),
      isDirectory: false,
      documentDate: doc.documentDate,
      amount: doc.amount,
      vendor: doc.vendor
    }));
  } catch (error) {
    logger.error('Error listing documents:', { error: error.message });
    return [];
  }
});

// Tax calculation handlers
ipcMain.handle('calculate-tax', async (event, data) => {
  logger.info('calculate-tax IPC handler called', { data });
  
  try {
    // Load tax rules from JSON file
    const taxRulesPath = path.join(__dirname, '../../resources/tax-rules/finance-law-2025.json');
    const taxRules = JSON.parse(fs.readFileSync(taxRulesPath, 'utf8'));
    
    // Extract data
    const revenue = parseFloat(data.revenue) || 0;
    const expenses = parseFloat(data.expenses) || 0;
    const otherDeductions = parseFloat(data.otherDeductions) || 0;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, revenue - expenses - otherDeductions);
    
    // Get CIT brackets
    const brackets = taxRules.corporateIncomeTax.progressiveBrackets;
    
    // Calculate tax using progressive rates
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const bracketDetails = [];
    
    let previousThreshold = 0;
    for (const bracket of brackets) {
      const threshold = bracket.threshold === null ? Infinity : bracket.threshold;
      const bracketAmount = Math.min(
        Math.max(0, remainingIncome),
        threshold - previousThreshold
      );
      
      const bracketTax = bracketAmount * bracket.rate;
      totalTax += bracketTax;
      
      if (bracketAmount > 0) {
        bracketDetails.push({
          from: previousThreshold,
          to: previousThreshold + bracketAmount,
          amount: bracketAmount,
          rate: bracket.rate * 100,
          tax: bracketTax
        });
      }
      
      remainingIncome -= bracketAmount;
      previousThreshold = threshold;
      
      if (remainingIncome <= 0 || bracket.threshold === null) break;
    }
    
    // Calculate minimum contribution
    const minContributionRate = taxRules.corporateIncomeTax.minimumContribution.rate;
    const minimumContribution = revenue * minContributionRate;
    
    // Determine final tax (higher of calculated tax or minimum contribution)
    const finalTax = Math.max(totalTax, minimumContribution);
    const isMinimumApplied = finalTax === minimumContribution;
    
    // Return calculation results
    const result = {
      revenue,
      expenses,
      otherDeductions,
      taxableIncome,
      calculatedTax: totalTax,
      minimumContribution,
      finalTax,
      isMinimumApplied,
      bracketDetails,
      effectiveTaxRate: taxableIncome > 0 ? (finalTax / taxableIncome) * 100 : 0,
      taxRuleVersion: taxRules.version
    };
    
    logger.info('Tax calculation completed', { taxableIncome, finalTax });
    return result;
  } catch (error) {
    logger.error('Error calculating tax', { error: error.message });
    return { error: error.message };
  }
});

ipcMain.handle('save-tax-calculation', async (event, calculation) => {
  logger.info('save-tax-calculation IPC handler called');
  
  try {
    const { taxOps } = require('../data/db');
    const result = taxOps.saveCalculation(calculation);
    logger.info('Tax calculation saved', { id: result.id });
    return result;
  } catch (error) {
    logger.error('Error saving tax calculation', { error: error.message });
    return { error: error.message };
  }
});

ipcMain.handle('get-tax-calculations', async () => {
  logger.info('get-tax-calculations IPC handler called');
  
  try {
    const { taxOps } = require('../data/db');
    const calculations = taxOps.getCalculations();
    logger.info('Retrieved tax calculations', { count: calculations.length });
    return calculations;
  } catch (error) {
    logger.error('Error getting tax calculations', { error: error.message });
    return [];
  }
});

// Report handlers
ipcMain.handle('generate-report', async (event, options) => {
  logger.info('generate-report IPC handler called', { reportType: options.reportType });
  
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(userDataPath, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Get company name from settings
    const { settingsOps, documentOps, taxOps } = require('../data/db');
    const companyName = await settingsOps.getSetting('company.name') || 'Your Company';
    
    // Import the PDF generator
    const { 
      generateFinancialSummaryReport, 
      generateTaxReport, 
      generateDocumentInventoryReport 
    } = require('../common/pdf-generator');
    
    let reportPath;
    let format = 'pdf';
    
    switch (options.reportType) {
      case 'financial-summary': {
        // Gather data for financial summary report
        const incomingDocs = await documentOps.getDocumentsByType('incoming');
        const outgoingDocs = await documentOps.getDocumentsByType('outgoing');
        const calculations = await taxOps.getCalculations();
        
        // Calculate totals
        const incomingAmount = incomingDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
        const outgoingAmount = outgoingDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
        
        // Get most recent tax calculation
        const latestCalc = calculations.length > 0 ? calculations[0] : null;
        
        // Prepare report data
        const reportData = {
          revenue: outgoingAmount,
          expenses: incomingAmount,
          profitMargin: outgoingAmount > 0 ? ((outgoingAmount - incomingAmount) / outgoingAmount) * 100 : 0,
          taxableIncome: latestCalc?.taxableIncome || 0,
          citAmount: latestCalc?.finalTax || 0,
          effectiveTaxRate: latestCalc?.effectiveTaxRate || 0,
          vatCollected: outgoingAmount * 0.2, // Simplified assumption for MVP
          vatPaid: incomingAmount * 0.2, // Simplified assumption for MVP
          vatBalance: (outgoingAmount * 0.2) - (incomingAmount * 0.2),
          incomingDocCount: incomingDocs.length,
          outgoingDocCount: outgoingDocs.length,
          incomingAmount,
          outgoingAmount,
          totalDocAmount: incomingAmount + outgoingAmount
        };
        
        // Generate the PDF report
        reportPath = await generateFinancialSummaryReport(reportData, {
          outputDir: reportsDir,
          company: companyName,
          periodStart: options.startDate,
          periodEnd: options.endDate
        });
        
        break;
      }
      
      case 'tax-report': {
        // Get latest tax calculation or create a placeholder
        const calculations = await taxOps.getCalculations();
        const latestCalc = calculations.length > 0 ? calculations[0] : {
          revenue: 0,
          expenses: 0,
          otherDeductions: 0,
          taxableIncome: 0,
          calculatedTax: 0,
          minimumContribution: 0,
          finalTax: 0,
          effectiveTaxRate: 0,
          bracketDetails: []
        };
        
        // Generate the PDF report
        reportPath = await generateTaxReport(latestCalc, {
          outputDir: reportsDir,
          company: companyName,
          periodStart: options.startDate,
          periodEnd: options.endDate
        });
        
        break;
      }
      
      case 'documents-inventory': {
        // Gather document data
        const incomingDocs = await documentOps.getDocumentsByType('incoming');
        const outgoingDocs = await documentOps.getDocumentsByType('outgoing');
        
        // Prepare report data
        const reportData = {
          totalDocuments: incomingDocs.length + outgoingDocs.length,
          incomingDocuments: incomingDocs,
          outgoingDocuments: outgoingDocs,
          rootDirectory: path.join(userDataPath, 'documents'),
          incomingDirectory: path.join(userDataPath, 'documents', 'incoming'),
          outgoingDirectory: path.join(userDataPath, 'documents', 'outgoing')
        };
        
        // Generate the PDF report
        reportPath = await generateDocumentInventoryReport(reportData, {
          outputDir: reportsDir,
          company: companyName
        });
        
        break;
      }
      
      case 'accounting-handover': {
        // For accounting handover package, create a comprehensive report with more details
        // In V2, we'll implement this as a PDF but in a future version it could be a ZIP with multiple reports
        
        // Gather all data
        const incomingDocs = await documentOps.getDocumentsByType('incoming');
        const outgoingDocs = await documentOps.getDocumentsByType('outgoing');
        const calculations = await taxOps.getCalculations();
        const allSettings = await settingsOps.getAllSettings();
        
        // Create similar structure to documents-inventory but with more data
        const reportData = {
          totalDocuments: incomingDocs.length + outgoingDocs.length,
          incomingDocuments: incomingDocs,
          outgoingDocuments: outgoingDocs,
          taxCalculations: calculations,
          settings: allSettings,
          rootDirectory: path.join(userDataPath, 'documents'),
          incomingDirectory: path.join(userDataPath, 'documents', 'incoming'),
          outgoingDirectory: path.join(userDataPath, 'documents', 'outgoing')
        };
        
        // Use document inventory report as base for now
        reportPath = await generateDocumentInventoryReport(reportData, {
          outputDir: reportsDir,
          company: companyName
        });
        
        break;
      }
      
      default:
        // Fallback to simple text report for unsupported types
        const reportFilename = `${options.reportType}_${new Date().toISOString().replace(/:/g, '-')}.txt`;
        reportPath = path.join(reportsDir, reportFilename);
        
        fs.writeFileSync(reportPath, `
Financial Pre-Accounting Agent Report
===================================
Type: ${options.reportType} (Unsupported in this version)
Generated: ${new Date().toLocaleString()}
Period: ${options.startDate || 'N/A'} to ${options.endDate || 'N/A'}

This report type is not yet supported in this version.
`);
        
        format = 'txt';
    }
    
    // Save report to database
    const { reportOps } = require('../data/db');
    const savedReport = reportOps.saveReport({
      name: options.name || `${options.reportType} Report`,
      reportType: options.reportType,
      periodStart: options.startDate,
      periodEnd: options.endDate,
      format,
      filePath: reportPath,
      parameters: options
    });
    
    logger.info('Report generated', { path: reportPath });
    return {
      success: true,
      report: savedReport,
      path: reportPath
    };
  } catch (error) {
    logger.error('Error generating report', { error: error.message });
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-reports', async () => {
  logger.info('get-reports IPC handler called');
  
  try {
    const { reportOps } = require('../data/db');
    const reports = reportOps.getAllReports();
    logger.info('Retrieved reports', { count: reports.length });
    return reports;
  } catch (error) {
    logger.error('Error getting reports', { error: error.message });
    return [];
  }
});

// Settings handlers
ipcMain.handle('get-setting', async (event, key) => {
  logger.debug('get-setting IPC handler called', { key });
  
  try {
    const { settingsOps } = require('../data/db');
    const value = settingsOps.getSetting(key);
    return value;
  } catch (error) {
    logger.error('Error getting setting', { error: error.message, key });
    return null;
  }
});

ipcMain.handle('update-setting', async (event, key, value) => {
  logger.info('update-setting IPC handler called', { key });
  
  try {
    const { settingsOps } = require('../data/db');
    const result = settingsOps.updateSetting(key, value);
    logger.info('Setting updated', { key, result });
    return result;
  } catch (error) {
    logger.error('Error updating setting', { error: error.message, key });
    return false;
  }
});

ipcMain.handle('get-settings-by-category', async (event, category) => {
  logger.debug('get-settings-by-category IPC handler called', { category });
  
  try {
    const { settingsOps } = require('../data/db');
    const settings = settingsOps.getSettingsByCategory(category);
    return settings;
  } catch (error) {
    logger.error('Error getting settings by category', { error: error.message, category });
    return [];
  }
});

// Document processor instance
const tempDir = path.join(userDataPath, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const documentProcessor = new DocumentProcessor({
  tempDir,
  ocrEnabled: true,
  enhanceImages: true,
  confidenceThreshold: 0.6
});

// Document processing handlers
ipcMain.handle('process-document', async (event, filePath) => {
  logger.info('process-document IPC handler called', { filePath });
  
  try {
    // Process the document
    const result = await documentProcessor.processDocument(filePath);
    
    // Save extracted data to the database
    const { id } = documentOps.updateDocumentWithExtractedData(filePath, {
      amount: result.financialData.amount,
      vatAmount: result.financialData.vatInfo.amount,
      vatRate: result.financialData.vatInfo.rate,
      date: result.financialData.date,
      invoiceNumber: result.financialData.invoiceNumber,
      isIncoming: result.classification.type === 'incoming',
      vendor: result.financialData.companies.names[0] || null,
      confidence: result.confidence,
      extractedData: JSON.stringify(result)
    });
    
    logger.info('Document processed and data saved', { 
      filePath, 
      documentId: id, 
      classification: result.classification.type
    });
    
    return {
      success: true,
      result,
      documentId: id
    };
  } catch (error) {
    logger.error('Error processing document', { 
      filePath, 
      error: error.message 
    });
    
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('process-batch-documents', async (event, filePaths, progressChannel) => {
  logger.info('process-batch-documents IPC handler called', { 
    count: filePaths.length 
  });
  
  try {
    // Set up progress tracking
    const updateProgress = (completed, total, failed) => {
      if (progressChannel) {
        event.sender.send(progressChannel, {
          completed,
          total,
          failed,
          percentage: Math.round((completed / total) * 100)
        });
      }
    };
    
    // Process the documents in batch
    const { results, errors } = await documentProcessor.processBatch(
      filePaths,
      updateProgress
    );
    
    // Save extracted data to the database
    const savedDocuments = [];
    
    for (const result of results) {
      if (!result) continue;
      
      try {
        const { id } = documentOps.updateDocumentWithExtractedData(result.filePath, {
          amount: result.financialData.amount,
          vatAmount: result.financialData.vatInfo.amount,
          vatRate: result.financialData.vatInfo.rate,
          date: result.financialData.date,
          invoiceNumber: result.financialData.invoiceNumber,
          isIncoming: result.classification.type === 'incoming',
          vendor: result.financialData.companies.names[0] || null,
          confidence: result.confidence,
          extractedData: JSON.stringify(result)
        });
        
        savedDocuments.push({
          id,
          filePath: result.filePath,
          classification: result.classification.type,
          confidence: result.confidence
        });
      } catch (dbError) {
        logger.error('Error saving document data to database', { 
          filePath: result.filePath, 
          error: dbError.message 
        });
        
        errors.push({
          filePath: result.filePath,
          error: `Database error: ${dbError.message}`
        });
      }
    }
    
    logger.info('Batch processing completed', { 
      total: filePaths.length,
      successful: savedDocuments.length,
      failed: errors.length
    });
    
    return {
      success: true,
      processed: savedDocuments.length,
      failed: errors.length,
      results: savedDocuments,
      errors
    };
  } catch (error) {
    logger.error('Error in batch processing', { error: error.message });
    
    return {
      success: false,
      error: error.message
    };
  }
});

// Currency-related handlers (enhanced in v3.1.5)
ipcMain.handle('get-exchange-rates', async () => {
  logger.info('get-exchange-rates IPC handler called');
  
  try {
    const { fetchExchangeRates } = require('../common/currency-utils');
    const rates = await fetchExchangeRates('MAD');
    logger.info('Exchange rates retrieved successfully');
    return rates;
  } catch (error) {
    logger.error('Error fetching exchange rates', { error: error.message });
    // Return default rates from the currency utils
    const { DEFAULT_EXCHANGE_RATES } = require('../common/currency-utils');
    return DEFAULT_EXCHANGE_RATES;
  }
});

ipcMain.handle('get-historical-exchange-rates', async (event, date) => {
  logger.info('get-historical-exchange-rates IPC handler called', { date });
  
  try {
    const { fetchExchangeRates } = require('../common/currency-utils');
    const rates = await fetchExchangeRates('MAD', date);
    logger.info('Historical exchange rates retrieved successfully', { date });
    return rates;
  } catch (error) {
    logger.error('Error fetching historical exchange rates', { 
      error: error.message,
      date
    });
    // Return default rates from the currency utils
    const { DEFAULT_EXCHANGE_RATES } = require('../common/currency-utils');
    return DEFAULT_EXCHANGE_RATES;
  }
});

ipcMain.handle('convert-currency', async (event, amount, fromCurrency, toCurrency, date = null) => {
  logger.info('convert-currency IPC handler called', { 
    amount, 
    fromCurrency, 
    toCurrency,
    date
  });
  
  try {
    const { convertCurrency } = require('../common/currency-utils');
    const conversionResult = await convertCurrency(amount, fromCurrency, toCurrency, null, date);
    
    logger.info('Currency conversion successful', { 
      fromCurrency, 
      toCurrency, 
      originalAmount: amount, 
      convertedAmount: conversionResult.convertedAmount
    });
    
    return conversionResult;
  } catch (error) {
    logger.error('Error converting currency', { 
      error: error.message,
      fromCurrency,
      toCurrency,
      amount,
      date
    });
    return null;
  }
});

ipcMain.handle('detect-currencies', async (event, text) => {
  logger.info('detect-currencies IPC handler called');
  
  try {
    const { detectCurrencies } = require('../common/currency-utils');
    const detectedCurrencies = detectCurrencies(text);
    
    logger.info('Currencies detected successfully', { 
      count: detectedCurrencies.length
    });
    
    return detectedCurrencies;
  } catch (error) {
    logger.error('Error detecting currencies', { error: error.message });
    return [];
  }
});

ipcMain.handle('process-currencies-in-document', async (event, document, date = null) => {
  logger.info('process-currencies-in-document IPC handler called');
  
  try {
    const { processCurrenciesInDocument } = require('../common/currency-utils');
    const result = await processCurrenciesInDocument(document, date);
    
    logger.info('Document currencies processed successfully', { 
      hasForeignCurrency: result.hasForeignCurrency,
      primaryCurrency: result.currencyAnalysis?.primaryCurrency
    });
    
    return result;
  } catch (error) {
    logger.error('Error processing currencies in document', { error: error.message });
    return {
      ...document,
      currencies: [],
      hasForeignCurrency: false,
      error: error.message,
      currencyAnalysis: {
        primaryCurrency: 'MAD',
        reliable: false,
        errorMessage: error.message
      }
    };
  }
});

ipcMain.handle('format-currency', (event, amount, currencyCode) => {
  logger.debug('format-currency IPC handler called', { 
    amount, 
    currencyCode 
  });
  
  try {
    const { formatCurrency } = require('../common/currency-utils');
    return formatCurrency(amount, currencyCode);
  } catch (error) {
    logger.error('Error formatting currency', { 
      error: error.message,
      amount,
      currencyCode
    });
    return `${amount} ${currencyCode}`;
  }
});

// Utility handlers
ipcMain.handle('view-logs', () => {
  logger.info('view-logs IPC handler called');
  // Execute the logs script
  const logsScriptPath = path.join(__dirname, '../../scripts/view-logs.js');
  require(logsScriptPath);
  return { success: true };
});
