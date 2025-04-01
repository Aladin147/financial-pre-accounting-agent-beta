const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Document management
    getDocumentPaths: () => ipcRenderer.invoke('get-document-paths'),
    importDocument: (targetDir) => ipcRenderer.invoke('import-document', targetDir),
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
      const packageInfo = require('../../package.json');
      return {
        version: packageInfo.version,
        name: packageInfo.name,
      };
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
    
    // Utility functions
    viewLogs: () => ipcRenderer.invoke('view-logs')
  }
);
