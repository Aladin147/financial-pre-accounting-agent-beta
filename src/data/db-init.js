/**
 * Database initialization script for Financial Pre-Accounting Agent
 * 
 * This script creates the SQLite database schema for the application.
 * It includes tables for document metadata, financial entries, tax calculations,
 * and application settings.
 */

const path = require('path');
const Database = require('better-sqlite3');
const { app } = require('electron');

// Ensure this script can be run both from Electron and standalone
const getAppPath = () => {
  if (app) {
    return app.getPath('userData');
  }
  // Fallback for standalone execution
  return process.env.APPDATA || 
    (process.platform === 'darwin' ? 
      path.join(process.env.HOME, 'Library/Application Support') : 
      path.join(process.env.HOME, '.local/share'));
};

// Initialize the database
function initDatabase() {
  try {
    // Define the database path in the user's data directory
    const dbPath = path.join(getAppPath(), 'financial-data', 'financial-db.sqlite');
    
    console.log(`Initializing database at: ${dbPath}`);
    
    // Create database connection
    const db = new Database(dbPath);
    
    // Enable foreign keys enforcement
    db.pragma('foreign_keys = ON');
    
    // Create document table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        document_type TEXT NOT NULL,
        category TEXT,
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
        document_date DATETIME,
        amount REAL,
        currency TEXT DEFAULT 'MAD',
        vendor TEXT,
        is_incoming BOOLEAN,
        notes TEXT,
        status TEXT DEFAULT 'active'
      )
    `);
    
    // Create financial entries table
    db.exec(`
      CREATE TABLE IF NOT EXISTS financial_entries (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        entry_date DATETIME NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        category TEXT,
        subcategory TEXT,
        tax_deductible BOOLEAN DEFAULT 0,
        vat_rate REAL,
        vat_amount REAL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
      )
    `);
    
    // Create tax calculations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tax_calculations (
        id TEXT PRIMARY KEY,
        calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        period_type TEXT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_revenue REAL NOT NULL,
        total_expenses REAL NOT NULL,
        taxable_income REAL,
        cit_amount REAL,
        vat_amount REAL,
        other_taxes REAL,
        total_tax_liability REAL,
        tax_rule_version TEXT,
        notes TEXT
      )
    `);
    
    // Create reports table
    db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        report_type TEXT NOT NULL,
        generation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        period_start DATE,
        period_end DATE,
        format TEXT NOT NULL,
        file_path TEXT NOT NULL,
        parameters TEXT
      )
    `);
    
    // Create settings table for application settings
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT
      )
    `);
    
    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
      CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(document_date);
      CREATE INDEX IF NOT EXISTS idx_financial_entries_date ON financial_entries(entry_date);
      CREATE INDEX IF NOT EXISTS idx_financial_entries_document ON financial_entries(document_id);
      CREATE INDEX IF NOT EXISTS idx_tax_calculations_period ON tax_calculations(period_start, period_end);
      CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
    `);
    
    // Insert default settings
    const defaultSettings = [
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
    ];
    
    // Prepare statement for inserting settings
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, category, description)
      VALUES (?, ?, ?, ?)
    `);
    
    // Insert default settings
    const insertSettingsTransaction = db.transaction(() => {
      for (const setting of defaultSettings) {
        insertSetting.run(setting.key, setting.value, setting.category, setting.description);
      }
    });
    
    // Execute the transaction
    insertSettingsTransaction();
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// If this script is run directly, initialize the database
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
