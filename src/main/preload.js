const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Document management
    getDocumentPaths: () => ipcRenderer.invoke('get-document-paths'),
    importDocument: (targetDir) => ipcRenderer.invoke('import-document', targetDir),
    uploadFiles: (files, targetDir, progressCallback) => {
      // Create a unique channel for progress updates
      const channel = `upload-files-progress-${Date.now()}`;
      
      // Set up progress listener
      ipcRenderer.on(channel, (event, progress) => {
        if (typeof progressCallback === 'function') {
          progressCallback(progress);
        }
      });
      
      // Convert File objects to paths (required for upload)
      const filePaths = Array.from(files).map(file => file.path);
      
      // Invoke the upload method
      return ipcRenderer.invoke('upload-files', filePaths, targetDir, channel);
    },
    listDocuments: (dirType) => ipcRenderer.invoke('list-documents', dirType),
    processDocument: (filePath) => ipcRenderer.invoke('process-document', filePath),
    processBatchDocuments: (filePaths, progressCallback) => {
      // Set up progress updates
      const channel = `process-batch-progress-${Date.now()}`;
      ipcRenderer.on(channel, (event, progress) => {
        if (typeof progressCallback === 'function') {
          progressCallback(progress);
        }
      });
      return ipcRenderer.invoke('process-batch-documents', filePaths, channel);
    },
    
    // Basic version info
    getAppVersion: () => {
      try {
        // Try the relative path first
        const packageInfo = require('../../package.json');
        return {
          version: packageInfo.version,
          name: packageInfo.name,
        };
      } catch (error) {
        // Fallback values if package.json can't be loaded
        console.error('Error loading package.json:', error.message);
        return {
          version: '3.1.0-beta',
          name: 'Financial Pre-Accounting Agent',
        };
      }
    },
    
    // Tax calculations
    calculateTax: (data) => ipcRenderer.invoke('calculate-tax', data),
    saveTaxCalculation: (calculation) => ipcRenderer.invoke('save-tax-calculation', calculation),
    getTaxCalculations: () => ipcRenderer.invoke('get-tax-calculations'),
    
    // Reports
    generateReport: (options) => ipcRenderer.invoke('generate-report', options),
    getReports: () => ipcRenderer.invoke('get-reports'),
    
    // Settings
    getSetting: (key) => ipcRenderer.invoke('get-setting', key),
    updateSetting: (key, value) => ipcRenderer.invoke('update-setting', key, value),
    getSettingsByCategory: (category) => ipcRenderer.invoke('get-settings-by-category', category),
    
    // Currency related functions (enhanced in v3.1.5)
    getExchangeRates: () => ipcRenderer.invoke('get-exchange-rates'),
    getHistoricalExchangeRates: (date) => ipcRenderer.invoke('get-historical-exchange-rates', date),
    convertCurrency: (amount, fromCurrency, toCurrency, date = null) => 
      ipcRenderer.invoke('convert-currency', amount, fromCurrency, toCurrency, date),
    detectCurrencies: (text) => ipcRenderer.invoke('detect-currencies', text),
    processCurrenciesInDocument: (document, date = null) => 
      ipcRenderer.invoke('process-currencies-in-document', document, date),
    formatCurrency: (amount, currencyCode) => ipcRenderer.invoke('format-currency', amount, currencyCode),
    
    // Utility functions
    viewLogs: () => ipcRenderer.invoke('view-logs')
  }
);
