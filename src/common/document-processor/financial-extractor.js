/**
 * Financial Data Extractor
 * 
 * Extracts financial information from document text using
 * regex pattern matching and heuristic analysis optimized
 * for Moroccan financial documents.
 */

const { logger } = require('../logger');

// Regular expressions for Moroccan financial documents
const PATTERNS = {
  // Amount patterns (supporting various formats and currencies)
  // Handles formats like 1,234.56 MAD, 1.234,56 MAD, 1 234,56 MAD, etc.
  AMOUNT: /(\b\d{1,3}(?:[ \.,]\d{3})*(?:[ \.,]\d{2})?\b|\b\d+(?:[ \.,]\d{2})?\b)(?:\s*(?:MAD|DH|DHs|د\.م\.|\$|USD|EUR|€|Dhs))?/gi,
  
  // VAT patterns (Moroccan standard VAT is 20%)
  VAT_AMOUNT: /(?:TVA|VAT|T\.V\.A\.|ض\.ق\.م\.)\s*(?:\d{1,2}(?:[,.]\d{1,2})?%)?(?:\s*:)?\s*(\d{1,3}(?:[ \.,]\d{3})*(?:[ \.,]\d{2})?\b|\b\d+(?:[ \.,]\d{2})?\b)/gi,
  VAT_RATE: /(?:TVA|VAT|T\.V\.A\.|ض\.ق\.م\.)\s*(?:à|at|de|of)?\s*(\d{1,2}(?:[,.]\d{1,2})?)(?:\s*%)/gi,
  
  // Date patterns (handles various Moroccan date formats)
  DATE: /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|fév|mar|avr|mai|jun|jul|aoû|sep|oct|nov|déc|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4})\b/gi,
  
  // Invoice number patterns
  INVOICE_NUM: /(?:(?:N°|N|#|Nr|Reference|Ref)(?:\.?\s*):?\s*|facture(?:\s+n°|:)\s*)([A-Z0-9][-A-Z0-9\/]{3,25})/gi,
  
  // Tax ID patterns (Moroccan specific)
  TAX_ID: /(?:IF|ICE|RC|PATENTE|TP|I\.F\.|identifiant\s+fiscal)(?:\.?\s*:?\s*)([0-9]{1,15})/gi,
  
  // Company name patterns
  COMPANY_NAME: /(?:société|company|entreprise|s\.a\.r\.l|sarl|s\.a|sa)\s+([A-Za-z0-9\s]{3,50})/gi,
  
  // Invoice types
  INVOICE_TYPE: /(?:facture|invoice|credit note|debit note|delivery note|bon de livraison|avoir|note de débit|devis|quotation|pro\s*forma)/gi,
  
  // Total keyword patterns
  TOTAL_KEYWORDS: /(?:total|montant|amount|somme)(?:\s+(?:ht|ttc|tva incluse|net))?\s*(?::)?\s*(\d{1,3}(?:[ \.,]\d{3})*(?:[ \.,]\d{2})?\b|\b\d+(?:[ \.,]\d{2})?\b)/gi,
  
  // Payment terms
  PAYMENT_TERMS: /(?:payment|paiement)(?:\s+(?:terms|conditions|délai))?\s*(?::)?\s*(.{5,50})/gi,
  
  // Bank account details
  BANK_DETAILS: /(?:rib|iban|account|compte)(?:\s+(?:number|bancaire|banque))?\s*(?::)?\s*([A-Z0-9]{10,30})/gi
};

/**
 * Clean and standardize text before extraction
 * @param {string} text - Raw text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/[\r\n]+/g, ' \n ')    // Preserve some line breaks with spaces
    .replace(/[^\x00-\x7F]/g, ' ')  // Handle non-ASCII chars
    .trim();
}

/**
 * Normalize a numeric amount
 * @param {string} amountStr - Amount string to normalize
 * @returns {number} Normalized amount
 */
function normalizeAmount(amountStr) {
  if (!amountStr) return 0;
  
  // Remove currency symbols and non-numeric chars (except . and ,)
  let cleaned = amountStr.replace(/[^\d.,]/g, '');
  
  // Determine format by looking at the positions of . and ,
  const lastDotIndex = cleaned.lastIndexOf('.');
  const lastCommaIndex = cleaned.lastIndexOf(',');
  
  // Standardize to US format (1234.56)
  if (lastCommaIndex > lastDotIndex && lastCommaIndex > cleaned.length - 4) {
    // Format is like 1.234,56 (European)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDotIndex > lastCommaIndex && lastDotIndex > cleaned.length - 4) {
    // Format is like 1,234.56 (US)
    cleaned = cleaned.replace(/,/g, '');
  } else if (lastCommaIndex > -1 && lastDotIndex === -1) {
    // Only commas, European format
    cleaned = cleaned.replace(/,/g, '.');
  }
  
  // Convert to number
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Extract all instances of a pattern from text
 * @param {string} text - Text to search in
 * @param {RegExp} pattern - Regex pattern
 * @returns {Array} Matches
 */
function extractPattern(text, pattern) {
  const matches = [];
  let match;
  
  // Create a new RegExp object with the global flag to avoid infinite loops
  const globalPattern = new RegExp(pattern.source, 'gi');
  
  while ((match = globalPattern.exec(text)) !== null) {
    // If capture group exists, push the captured value, otherwise push the full match
    matches.push(match[1] ? match[1] : match[0]);
  }
  
  return matches;
}

/**
 * Find the total amount in a document
 * @param {string} text - Document text
 * @returns {number} Total amount
 */
function findTotalAmount(text) {
  // First try to find marked totals
  const totalKeywordMatches = extractPattern(text, PATTERNS.TOTAL_KEYWORDS);
  
  if (totalKeywordMatches.length > 0) {
    // Get all amounts mentioned with total keywords
    const amounts = totalKeywordMatches.map(t => normalizeAmount(t));
    
    // Return the highest amount as the most likely total
    return Math.max(...amounts);
  }
  
  // If no marked totals, look for all amounts
  const amountMatches = extractPattern(text, PATTERNS.AMOUNT);
  
  if (amountMatches.length > 0) {
    // Get all amounts
    const amounts = amountMatches.map(a => normalizeAmount(a));
    
    // Return the highest amount as the most likely total
    return Math.max(...amounts);
  }
  
  return 0;
}

/**
 * Extract dates from text and find the most likely document date
 * @param {string} text - Document text
 * @returns {string} Document date in ISO format
 */
function findDocumentDate(text) {
  const dateMatches = extractPattern(text, PATTERNS.DATE);
  
  if (dateMatches.length === 0) {
    return null;
  }
  
  // For now, just return the first date found
  // In a more advanced version, we could look for dates near invoice keywords
  const dateStr = dateMatches[0];
  
  try {
    // Try to parse the date - may need more sophisticated parsing for various formats
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toISOString() : null;
  } catch (e) {
    return null;
  }
}

/**
 * Find VAT amount in a document
 * @param {string} text - Document text
 * @returns {Object} VAT information
 */
function findVATInfo(text) {
  // Try to find explicit VAT amounts
  const vatAmountMatches = extractPattern(text, PATTERNS.VAT_AMOUNT);
  const vatRateMatches = extractPattern(text, PATTERNS.VAT_RATE);
  
  // Find VAT rate
  let vatRate = 0.2; // Default VAT rate in Morocco
  if (vatRateMatches.length > 0) {
    const rateStr = vatRateMatches[0];
    const rate = parseFloat(rateStr);
    if (!isNaN(rate)) {
      vatRate = rate / 100; // Convert percentage to decimal
    }
  }
  
  // Find VAT amount
  let vatAmount = 0;
  if (vatAmountMatches.length > 0) {
    vatAmount = normalizeAmount(vatAmountMatches[0]);
  }
  
  return {
    rate: vatRate,
    amount: vatAmount
  };
}

/**
 * Extract invoice number from text
 * @param {string} text - Document text
 * @returns {string} Invoice number
 */
function findInvoiceNumber(text) {
  const invoiceNumMatches = extractPattern(text, PATTERNS.INVOICE_NUM);
  return invoiceNumMatches.length > 0 ? invoiceNumMatches[0] : null;
}

/**
 * Determine if the document is likely an expense or revenue document
 * @param {string} text - Document text
 * @returns {string} 'incoming' or 'outgoing'
 */
function determineDocumentDirection(text) {
  // This is simplified - a more sophisticated approach would use machine learning
  // For now, we look for key terms that indicate incoming vs outgoing
  
  const incomingKeywords = [
    'fournisseur', 'supplier', 'nous avons acheté', 'we purchased',
    'achat', 'purchase', 'bon de commande', 'order', 'bon de reception'
  ];
  
  const outgoingKeywords = [
    'client', 'customer', 'nous avons vendu', 'we sold', 'vente',
    'sale', 'prestation', 'service provided', 'bon de livraison'
  ];
  
  let incomingScore = 0;
  let outgoingScore = 0;
  
  const lowerText = text.toLowerCase();
  
  // Calculate scores
  incomingKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      incomingScore++;
    }
  });
  
  outgoingKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      outgoingScore++;
    }
  });
  
  // If scores are tied, look for "to" and "from" company names
  if (incomingScore === outgoingScore) {
    // This could be improved with named entity recognition
    return 'unknown';
  }
  
  return incomingScore > outgoingScore ? 'incoming' : 'outgoing';
}

/**
 * Extract company names from document
 * @param {string} text - Document text
 * @returns {Object} Company details
 */
function extractCompanies(text) {
  const companyMatches = extractPattern(text, PATTERNS.COMPANY_NAME);
  const taxIdMatches = extractPattern(text, PATTERNS.TAX_ID);
  
  return {
    names: companyMatches,
    taxIds: taxIdMatches
  };
}

/**
 * Extract financial data from document text
 * @param {string} text - Document text
 * @param {string} documentType - Document type (pdf, image, docx)
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Extracted financial data
 */
async function extractFinancialData(text, documentType, options = {}) {
  logger.debug('Extracting financial data from document text', { 
    textLength: text?.length,
    documentType 
  });
  
  try {
    // Clean and prepare text
    const cleanedText = cleanText(text);
    
    // Start building the result
    const result = {
      amount: 0,
      vatInfo: { rate: 0, amount: 0 },
      date: null,
      invoiceNumber: null,
      direction: 'unknown',
      companies: { names: [], taxIds: [] },
      confidence: 0,
      keywords: []
    };
    
    // Extract the total amount
    result.amount = findTotalAmount(cleanedText);
    
    // Extract VAT information
    result.vatInfo = findVATInfo(cleanedText);
    
    // Extract document date
    result.date = findDocumentDate(cleanedText);
    
    // Extract invoice number
    result.invoiceNumber = findInvoiceNumber(cleanedText);
    
    // Extract companies
    result.companies = extractCompanies(cleanedText);
    
    // Determine document direction (incoming/outgoing)
    result.direction = determineDocumentDirection(cleanedText);
    
    // Calculate confidence score based on how many fields were extracted
    let fieldsExtracted = 0;
    fieldsExtracted += result.amount > 0 ? 1 : 0;
    fieldsExtracted += result.vatInfo.amount > 0 ? 1 : 0;
    fieldsExtracted += result.date ? 1 : 0;
    fieldsExtracted += result.invoiceNumber ? 1 : 0;
    fieldsExtracted += result.companies.names.length > 0 ? 1 : 0;
    fieldsExtracted += result.direction !== 'unknown' ? 1 : 0;
    
    // Calculate confidence score (0-1)
    result.confidence = fieldsExtracted / 6;
    
    // Extract financial keywords
    result.keywords = extractKeywords(cleanedText);
    
    logger.info('Financial data extraction completed', { 
      amount: result.amount,
      confidence: result.confidence
    });
    
    return result;
  } catch (error) {
    logger.error('Error extracting financial data', { 
      error: error.message 
    });
    return {
      amount: 0,
      vatInfo: { rate: 0, amount: 0 },
      date: null,
      invoiceNumber: null,
      direction: 'unknown',
      companies: { names: [], taxIds: [] },
      confidence: 0,
      keywords: []
    };
  }
}

/**
 * Extract financial keywords from text
 * @param {string} text - Document text
 * @returns {Array} Keywords
 */
function extractKeywords(text) {
  // List of financial terms to look for
  const keywordPatterns = [
    /facture|invoice/i,
    /avoir|credit note/i,
    /devis|quote/i,
    /commande|order/i,
    /paiement|payment/i,
    /livraison|delivery/i,
    /total/i,
    /tva|vat/i,
    /remise|discount/i,
    /achat|purchase/i,
    /vente|sale/i,
    /client|customer/i,
    /fournisseur|supplier/i,
    /montant|amount/i
  ];
  
  // Extract matching keywords
  const keywords = [];
  keywordPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      keywords.push(pattern.source.split('|')[0].replace(/\\i/g, ''));
    }
  });
  
  return keywords;
}

module.exports = {
  extractFinancialData,
  normalizeAmount,
  findTotalAmount,
  findDocumentDate,
  findVATInfo,
  findInvoiceNumber,
  determineDocumentDirection,
  extractCompanies
};
