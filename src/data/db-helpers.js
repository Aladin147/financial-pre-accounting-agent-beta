/**
 * Database Helpers
 * 
 * Helper functions for database operations in the Financial Pre-Accounting Agent.
 * These functions help with data validation, type conversion, and other
 * database-related utility tasks.
 */

const path = require('path');
const { logger } = require('../common/logger');

/**
 * Clean and normalize document data for database storage
 * @param {Object} docData - Raw document data
 * @returns {Object} - Cleaned document data
 */
function normalizeDocumentData(docData) {
  if (!docData) return null;
  
  // Basic normalized structure
  const normalizedData = {
    filename: docData.filename || path.basename(docData.filePath || ''),
    filePath: docData.filePath || '',
    documentType: docData.documentType || path.extname(docData.filePath || '').substring(1) || 'unknown',
    isIncoming: typeof docData.isIncoming === 'boolean' ? docData.isIncoming : true,
    documentDate: docData.documentDate || docData.date || new Date().toISOString(),
    amount: parseFloat(docData.amount) || 0,
    vatAmount: parseFloat(docData.vatAmount) || 0,
    vatRate: parseFloat(docData.vatRate) || 0.2, // Default to 20% VAT in Morocco
    invoiceNumber: docData.invoiceNumber || null,
    vendor: docData.vendor || null,
    notes: docData.notes || null,
    tags: Array.isArray(docData.tags) ? docData.tags : [],
    confidence: typeof docData.confidence === 'number' ? Math.min(1, Math.max(0, docData.confidence)) : 0,
    extractedData: docData.extractedData || null,
    dateAdded: docData.dateAdded || new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
  
  // Convert date strings to ISO format if needed
  if (normalizedData.documentDate && !(normalizedData.documentDate instanceof Date) && !isISODateString(normalizedData.documentDate)) {
    try {
      normalizedData.documentDate = new Date(normalizedData.documentDate).toISOString();
    } catch (e) {
      normalizedData.documentDate = new Date().toISOString();
      logger.warn('Invalid document date format, using current date', { 
        originalDate: docData.documentDate 
      });
    }
  }
  
  return normalizedData;
}

/**
 * Check if a string is in ISO date format
 * @param {string} str - String to check
 * @returns {boolean} - True if it's an ISO date string
 */
function isISODateString(str) {
  if (typeof str !== 'string') return false;
  
  // ISO date format regex
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return isoDatePattern.test(str);
}

/**
 * Generate a unique document identifier
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID
 */
function generateDocumentId(prefix = 'DOC') {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate financial totals for a collection of documents
 * @param {Array} documents - Array of document objects
 * @returns {Object} - Financial totals
 */
function calculateDocumentTotals(documents) {
  if (!Array.isArray(documents)) {
    return {
      totalAmount: 0,
      totalVAT: 0,
      count: 0
    };
  }
  
  return documents.reduce((totals, doc) => {
    const amount = parseFloat(doc.amount) || 0;
    const vatAmount = parseFloat(doc.vatAmount) || 0;
    
    return {
      totalAmount: totals.totalAmount + amount,
      totalVAT: totals.totalVAT + vatAmount,
      count: totals.count + 1
    };
  }, { totalAmount: 0, totalVAT: 0, count: 0 });
}

/**
 * Find a document in the database by file path
 * @param {Object} db - Database instance
 * @param {string} filePath - Path to the document file
 * @returns {Object|null} - Found document or null
 */
function findDocumentByPath(db, filePath) {
  if (!db || !filePath) return null;
  
  try {
    const documents = db.get('documents').value() || [];
    return documents.find(doc => doc.filePath === filePath) || null;
  } catch (error) {
    logger.error('Error finding document by path', { 
      filePath, 
      error: error.message 
    });
    return null;
  }
}

/**
 * Parse and validate a tax calculation object
 * @param {Object} data - Raw tax calculation data
 * @returns {Object} - Validated tax calculation data
 */
function validateTaxCalculation(data) {
  if (!data) return null;
  
  return {
    revenue: parseFloat(data.revenue) || 0,
    expenses: parseFloat(data.expenses) || 0,
    otherDeductions: parseFloat(data.otherDeductions) || 0,
    taxableIncome: parseFloat(data.taxableIncome) || 0,
    calculatedTax: parseFloat(data.calculatedTax) || 0,
    minimumContribution: parseFloat(data.minimumContribution) || 0,
    finalTax: parseFloat(data.finalTax) || 0,
    isMinimumApplied: !!data.isMinimumApplied,
    effectiveTaxRate: parseFloat(data.effectiveTaxRate) || 0,
    bracketDetails: Array.isArray(data.bracketDetails) ? data.bracketDetails : [],
    taxRuleVersion: data.taxRuleVersion || 'unknown',
    calculationDate: data.calculationDate || new Date().toISOString(),
    notes: data.notes || null
  };
}

module.exports = {
  normalizeDocumentData,
  generateDocumentId,
  calculateDocumentTotals,
  findDocumentByPath,
  validateTaxCalculation,
  isISODateString
};
