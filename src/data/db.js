/**
 * Database layer for Financial Pre-Accounting Agent
 * 
 * This module provides a simplified database implementation using LowDB,
 * which stores data in JSON files. This is used for the MVP version as
 * a lightweight alternative to SQLite.
 */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../common/logger');

// Get the app data path
const getAppPath = () => {
  try {
    // When running in Electron
    if (app) {
      return app.getPath('userData');
    }
  } catch (error) {
    // Fallback for when not running in Electron context
    return process.env.APPDATA || 
      (process.platform === 'darwin' ? 
        path.join(process.env.HOME, 'Library/Application Support') : 
        path.join(process.env.HOME, '.local/share'));
  }
};

// Database file path
const DB_PATH = path.join(getAppPath(), 'financial-data', 'financial-db.json');

// Initialize the database
function initDatabase() {
  try {
    logger.info('Initializing database at: ' + DB_PATH);
    
    // Ensure directory exists
    const dbDir = path.dirname(DB_PATH);
    const fs = require('fs');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create the adapter and database
    const adapter = new FileSync(DB_PATH);
    const db = low(adapter);
    
    // Set default data structure
    db.defaults({
      documents: [],
      financialEntries: [],
      taxCalculations: [],
      reports: [],
      settings: [
        // Company information
        {
          key: 'company.name',
          value: 'Your Company',
          category: 'company',
          description: 'Company name'
        },
        {
          key: 'company.taxId',
          value: '',
          category: 'company',
          description: 'Tax ID / Registration number'
        },
        // Tax settings
        {
          key: 'tax.fiscalYearStart',
          value: '01-01',
          category: 'tax',
          description: 'Fiscal year start date (MM-DD)'
        },
        {
          key: 'tax.vatRate',
          value: '20',
          category: 'tax',
          description: 'Standard VAT rate (%)'
        },
        {
          key: 'tax.minimumContributionRate',
          value: '0.25',
          category: 'tax',
          description: 'Minimum contribution rate (%)'
        },
        // Backup settings
        {
          key: 'backup.autoBackup',
          value: 'true',
          category: 'backup',
          description: 'Enable automatic backups'
        },
        {
          key: 'backup.backupInterval',
          value: 'daily',
          category: 'backup',
          description: 'Backup frequency (daily, weekly, monthly)'
        },
        // Appearance settings
        {
          key: 'appearance.theme',
          value: 'light',
          category: 'appearance',
          description: 'Application theme (light, dark, system)'
        },
        {
          key: 'appearance.language',
          value: 'en',
          category: 'appearance',
          description: 'Interface language (en, fr, ar)'
        }
      ]
    }).write();
    
    logger.info('Database initialized successfully');
    return db;
  } catch (error) {
    logger.error('Database initialization failed:', { error: error.message });
    throw error;
  }
}

// Get database instance (creates if not exists)
let dbInstance = null;
function getDb() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

// Document operations
const { normalizeDocumentData, findDocumentByPath } = require('./db-helpers');

const documentOps = {
  // Add a document to the database
  addDocument(document) {
    try {
      const db = getDb();
      const id = document.id || uuidv4();
      const now = new Date().toISOString();
      
      const newDocument = {
        id,
        filename: document.filename,
        filePath: document.filePath,
        documentType: document.documentType,
        category: document.category || '',
        dateAdded: now,
        documentDate: document.documentDate || now,
        amount: document.amount || 0,
        currency: document.currency || 'MAD',
        vendor: document.vendor || '',
        isIncoming: !!document.isIncoming,
        notes: document.notes || '',
        status: document.status || 'active'
      };
      
      db.get('documents')
        .push(newDocument)
        .write();
      
      logger.info('Document added:', { id });
      return newDocument;
    } catch (error) {
      logger.error('Error adding document:', { error: error.message });
      throw error;
    }
  },
  
  // Get all documents
  getAllDocuments() {
    try {
      const db = getDb();
      return db.get('documents').value();
    } catch (error) {
      logger.error('Error getting all documents:', { error: error.message });
      throw error;
    }
  },
  
  // Get documents by type (incoming, outgoing, or all)
  getDocumentsByType(type) {
    try {
      const db = getDb();
      let documents = db.get('documents');
      
      if (type === 'incoming') {
        documents = documents.filter({ isIncoming: true });
      } else if (type === 'outgoing') {
        documents = documents.filter({ isIncoming: false });
      }
      
      return documents.value();
    } catch (error) {
      logger.error('Error getting documents by type:', { error: error.message, type });
      throw error;
    }
  },
  
  // Get document by ID
  getDocumentById(id) {
    try {
      const db = getDb();
      return db.get('documents')
        .find({ id })
        .value();
    } catch (error) {
      logger.error('Error getting document by ID:', { error: error.message, id });
      throw error;
    }
  },
  
  // Update a document
  updateDocument(id, updates) {
    try {
      const db = getDb();
      const document = db.get('documents')
        .find({ id })
        .value();
      
      if (!document) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      db.get('documents')
        .find({ id })
        .assign(updates)
        .write();
      
      logger.info('Document updated:', { id });
      return db.get('documents')
        .find({ id })
        .value();
    } catch (error) {
      logger.error('Error updating document:', { error: error.message, id });
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument(id) {
    try {
      const db = getDb();
      db.get('documents')
        .remove({ id })
        .write();
      
      logger.info('Document deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Error deleting document:', { error: error.message, id });
      throw error;
    }
  },
  
  // Update or create a document with extracted data
  updateDocumentWithExtractedData(filePath, extractedData) {
    try {
      const db = getDb();
      let document = findDocumentByPath(db, filePath);
      
      // Normalize the data to ensure all fields are properly formatted
      const normalizedData = normalizeDocumentData({
        ...extractedData,
        filePath
      });
      
      if (document) {
        // Update existing document
        const id = document.id;
        
        logger.info('Updating document with extracted data:', { id, filePath });
        
        db.get('documents')
          .find({ id })
          .assign({
            ...normalizedData,
            dateModified: new Date().toISOString()
          })
          .write();
        
        document = db.get('documents')
          .find({ id })
          .value();
      } else {
        // Create new document
        const id = uuidv4();
        
        logger.info('Creating new document with extracted data:', { filePath });
        
        document = {
          id,
          ...normalizedData,
          dateAdded: new Date().toISOString(),
          dateModified: new Date().toISOString()
        };
        
        db.get('documents')
          .push(document)
          .write();
      }
      
      return document;
    } catch (error) {
      logger.error('Error updating document with extracted data:', { 
        filePath, 
        error: error.message 
      });
      throw error;
    }
  }
};

// Settings operations
const settingsOps = {
  // Get a setting by key
  getSetting(key) {
    try {
      const db = getDb();
      const setting = db.get('settings')
        .find({ key })
        .value();
      
      return setting ? setting.value : null;
    } catch (error) {
      logger.error('Error getting setting:', { error: error.message, key });
      throw error;
    }
  },
  
  // Get all settings in a category
  getSettingsByCategory(category) {
    try {
      const db = getDb();
      return db.get('settings')
        .filter({ category })
        .value();
    } catch (error) {
      logger.error('Error getting settings by category:', { error: error.message, category });
      throw error;
    }
  },
  
  // Update a setting
  updateSetting(key, value) {
    try {
      const db = getDb();
      const setting = db.get('settings')
        .find({ key })
        .value();
      
      if (!setting) {
        throw new Error(`Setting with key ${key} not found`);
      }
      
      db.get('settings')
        .find({ key })
        .assign({ value })
        .write();
      
      logger.info('Setting updated:', { key, value });
      return true;
    } catch (error) {
      logger.error('Error updating setting:', { error: error.message, key });
      throw error;
    }
  },
  
  // Get all settings
  getAllSettings() {
    try {
      const db = getDb();
      return db.get('settings').value();
    } catch (error) {
      logger.error('Error getting all settings:', { error: error.message });
      throw error;
    }
  }
};

// Tax calculation operations
const taxOps = {
  // Save a tax calculation
  saveCalculation(calculation) {
    try {
      const db = getDb();
      const id = calculation.id || uuidv4();
      const now = new Date().toISOString();
      
      const newCalculation = {
        id,
        calculationDate: now,
        periodType: calculation.periodType || 'custom',
        periodStart: calculation.periodStart,
        periodEnd: calculation.periodEnd,
        totalRevenue: calculation.totalRevenue || 0,
        totalExpenses: calculation.totalExpenses || 0,
        taxableIncome: calculation.taxableIncome || 0,
        citAmount: calculation.citAmount || 0,
        vatAmount: calculation.vatAmount || 0,
        otherTaxes: calculation.otherTaxes || 0,
        totalTaxLiability: calculation.totalTaxLiability || 0,
        taxRuleVersion: calculation.taxRuleVersion || '1.0.0',
        notes: calculation.notes || ''
      };
      
      db.get('taxCalculations')
        .push(newCalculation)
        .write();
      
      logger.info('Tax calculation saved:', { id });
      return newCalculation;
    } catch (error) {
      logger.error('Error saving tax calculation:', { error: error.message });
      throw error;
    }
  },
  
  // Get all tax calculations
  getCalculations() {
    try {
      const db = getDb();
      return db.get('taxCalculations').value();
    } catch (error) {
      logger.error('Error getting tax calculations:', { error: error.message });
      throw error;
    }
  },
  
  // Get calculation by ID
  getCalculationById(id) {
    try {
      const db = getDb();
      return db.get('taxCalculations')
        .find({ id })
        .value();
    } catch (error) {
      logger.error('Error getting tax calculation by ID:', { error: error.message, id });
      throw error;
    }
  }
};

// Report operations
const reportOps = {
  // Save a report
  saveReport(report) {
    try {
      const db = getDb();
      const id = report.id || uuidv4();
      const now = new Date().toISOString();
      
      const newReport = {
        id,
        name: report.name,
        reportType: report.reportType,
        generationDate: now,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        format: report.format,
        filePath: report.filePath,
        parameters: report.parameters || {}
      };
      
      db.get('reports')
        .push(newReport)
        .write();
      
      logger.info('Report saved:', { id, name: report.name });
      return newReport;
    } catch (error) {
      logger.error('Error saving report:', { error: error.message });
      throw error;
    }
  },
  
  // Get all reports
  getAllReports() {
    try {
      const db = getDb();
      return db.get('reports').value();
    } catch (error) {
      logger.error('Error getting all reports:', { error: error.message });
      throw error;
    }
  },
  
  // Get report by ID
  getReportById(id) {
    try {
      const db = getDb();
      return db.get('reports')
        .find({ id })
        .value();
    } catch (error) {
      logger.error('Error getting report by ID:', { error: error.message, id });
      throw error;
    }
  }
};

// Export database operations
module.exports = {
  initDatabase,
  getDb,
  documentOps,
  settingsOps,
  taxOps,
  reportOps
};
