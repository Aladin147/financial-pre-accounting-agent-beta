/**
 * Document Classifier
 * 
 * Classifies financial documents as incoming (expenses) or outgoing (revenue)
 * based on text content and extracted financial data.
 */

const { logger } = require('../logger');

// Classification types
const ClassificationType = {
  INCOMING: 'incoming',   // Expense document (purchase invoice, supplier bill)
  OUTGOING: 'outgoing',   // Revenue document (sales invoice, client bill)
  UNKNOWN: 'unknown'      // Couldn't determine
};

/**
 * Keyword sets for document classification
 */
const CLASSIFICATION_KEYWORDS = {
  // Incoming document keywords (expenses)
  INCOMING: {
    STRONG: [
      'fournisseur', 'supplier', 'achat', 'purchase', 
      'bon de commande', 'purchase order', 'nous vous devons',
      'we owe you', 'achats', 'purchases', 'bon de reception',
      'à payer', 'to pay', 'créditeur', 'creditor'
    ],
    MEDIUM: [
      'livré par', 'delivered by', 'réception', 'receipt',
      'charge', 'expense', 'dépense', 'acheteur', 'buyer',
      'note de frais', 'expense report', 'paiement au fournisseur',
      'supplier payment'
    ],
    WEAK: [
      'reçu', 'received', 'entrée', 'input', 'imported',
      'importation'
    ]
  },
  
  // Outgoing document keywords (revenue)
  OUTGOING: {
    STRONG: [
      'client', 'customer', 'vente', 'sale', 'vendu', 'sold',
      'bon de livraison', 'delivery note', 'nous vous facturons',
      'we invoice you', 'vous nous devez', 'you owe us',
      'à recevoir', 'to receive', 'débiteur', 'debtor'
    ],
    MEDIUM: [
      'livré à', 'delivered to', 'prestation', 'service provided',
      'revenu', 'revenue', 'vendeur', 'seller', 'export',
      'exportation', 'client payment', 'paiement client'
    ],
    WEAK: [
      'envoyé', 'sent', 'sortie', 'output', 'exported'
    ]
  }
};

/**
 * Classify document based on extracted financial data and text content
 * @param {Object} financialData - Extracted financial data
 * @param {string} text - Document text content
 * @param {Object} options - Classification options
 * @returns {Promise<Object>} Classification result
 */
async function classifyDocument(financialData, text, options = {}) {
  logger.debug('Classifying document');
  
  try {
    // If the financial extractor already determined a direction, use it
    if (financialData.direction && financialData.direction !== 'unknown') {
      logger.debug('Using direction from financial extractor', { 
        direction: financialData.direction 
      });
      
      return {
        type: financialData.direction,
        confidence: Math.min(0.7, financialData.confidence), // Cap confidence at 0.7
        method: 'financial_data'
      };
    }
    
    // Calculate keyword-based classification scores
    const { incomingScore, outgoingScore } = calculateKeywordScores(text);
    
    // Normalize scores to confidence values (0-1)
    const totalScore = incomingScore + outgoingScore;
    let incomingConfidence = 0;
    let outgoingConfidence = 0;
    
    if (totalScore > 0) {
      incomingConfidence = incomingScore / totalScore;
      outgoingConfidence = outgoingScore / totalScore;
    }
    
    // Determine classification based on confidence scores
    let classificationType = ClassificationType.UNKNOWN;
    let confidence = 0;
    
    if (Math.abs(incomingConfidence - outgoingConfidence) < 0.1) {
      // If scores are too close, classify as unknown
      classificationType = ClassificationType.UNKNOWN;
      confidence = Math.max(incomingConfidence, outgoingConfidence);
    } else if (incomingConfidence > outgoingConfidence) {
      classificationType = ClassificationType.INCOMING;
      confidence = incomingConfidence;
    } else {
      classificationType = ClassificationType.OUTGOING;
      confidence = outgoingConfidence;
    }
    
    // Apply additional heuristics to improve classification
    const enhancedClassification = applyHeuristics(
      classificationType, 
      confidence, 
      financialData, 
      text
    );
    
    logger.info('Document classification completed', { 
      type: enhancedClassification.type,
      confidence: enhancedClassification.confidence
    });
    
    return enhancedClassification;
  } catch (error) {
    logger.error('Error classifying document', { error: error.message });
    
    return {
      type: ClassificationType.UNKNOWN,
      confidence: 0,
      method: 'error'
    };
  }
}

/**
 * Calculate keyword-based classification scores
 * @param {string} text - Document text content
 * @returns {Object} Scores for incoming and outgoing categories
 */
function calculateKeywordScores(text) {
  const lowerText = text.toLowerCase();
  let incomingScore = 0;
  let outgoingScore = 0;
  
  // Calculate incoming score
  CLASSIFICATION_KEYWORDS.INCOMING.STRONG.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      incomingScore += 3;
    }
  });
  
  CLASSIFICATION_KEYWORDS.INCOMING.MEDIUM.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      incomingScore += 2;
    }
  });
  
  CLASSIFICATION_KEYWORDS.INCOMING.WEAK.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      incomingScore += 1;
    }
  });
  
  // Calculate outgoing score
  CLASSIFICATION_KEYWORDS.OUTGOING.STRONG.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      outgoingScore += 3;
    }
  });
  
  CLASSIFICATION_KEYWORDS.OUTGOING.MEDIUM.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      outgoingScore += 2;
    }
  });
  
  CLASSIFICATION_KEYWORDS.OUTGOING.WEAK.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      outgoingScore += 1;
    }
  });
  
  return { incomingScore, outgoingScore };
}

/**
 * Apply heuristics to improve classification accuracy
 * @param {string} initialType - Initial classification type
 * @param {number} initialConfidence - Initial confidence score
 * @param {Object} financialData - Extracted financial data
 * @param {string} text - Document text content
 * @returns {Object} Enhanced classification result
 */
function applyHeuristics(initialType, initialConfidence, financialData, text) {
  // Start with initial values
  let type = initialType;
  let confidence = initialConfidence;
  let method = 'keywords';
  
  // Apply Moroccan-specific heuristic patterns to detect document type 
  // These patterns are common in Moroccan financial documents
  
  // Check for company position patterns
  const lowerText = text.toLowerCase();
  
  // Invoice form detection - specific to Moroccan form layouts
  if (lowerText.includes('facture') || lowerText.includes('invoice')) {
    // Look for "client" or "customer" near the top
    const clientMatch = /(?:client|customer)\s*:\s*([^\n]{3,40})/i.exec(lowerText);
    const supplier = /(?:fournisseur|supplier)\s*:\s*([^\n]{3,40})/i.exec(lowerText);
    
    if (clientMatch && !supplier) {
      // If there's a client field but no supplier field, likely outgoing
      type = ClassificationType.OUTGOING;
      confidence = Math.max(confidence, 0.8);
      method = 'form_structure';
    } else if (supplier && !clientMatch) {
      // If there's a supplier field but no client field, likely incoming
      type = ClassificationType.INCOMING;
      confidence = Math.max(confidence, 0.8);
      method = 'form_structure';
    }
  }
  
  // Look for organization identifier patterns which are more common in Moroccan invoices
  const iceSeller = /ice\s+vendeur\s*:\s*([0-9]{15})/i.exec(lowerText);
  const iceBuyer = /ice\s+acheteur\s*:\s*([0-9]{15})/i.exec(lowerText);
  
  if (iceSeller && iceBuyer) {
    // Both present - need additional checks
    // In Moroccan invoices, the company issuing the invoice typically places its own ICE first
    const sellerPosition = lowerText.indexOf(iceSeller[0]);
    const buyerPosition = lowerText.indexOf(iceBuyer[0]);
    
    if (sellerPosition < buyerPosition) {
      // Seller ICE before buyer ICE, likely outgoing from our perspective
      type = ClassificationType.OUTGOING;
      confidence = Math.max(confidence, 0.85);
      method = 'ice_structure';
    } else {
      // Buyer ICE before seller ICE, likely incoming from our perspective
      type = ClassificationType.INCOMING;
      confidence = Math.max(confidence, 0.85);
      method = 'ice_structure';
    }
  }
  
  // Use the presence of specific phrases to strengthen classification
  // For Moroccan incoming invoices (purchases):
  if (
    lowerText.includes('nous vous remercions pour votre commande') ||
    lowerText.includes('thank you for your order') ||
    lowerText.includes('bon de reception de marchandise')
  ) {
    if (type === ClassificationType.INCOMING) {
      confidence += 0.1; // Strengthen existing classification
    } else if (type === ClassificationType.UNKNOWN) {
      type = ClassificationType.INCOMING;
      confidence = 0.7;
      method = 'phrasing';
    }
  }
  
  // For Moroccan outgoing invoices (sales):
  if (
    lowerText.includes('nous vous remercions pour votre confiance') ||
    lowerText.includes('thank you for your business') ||
    lowerText.includes('bon de livraison')
  ) {
    if (type === ClassificationType.OUTGOING) {
      confidence += 0.1; // Strengthen existing classification
    } else if (type === ClassificationType.UNKNOWN) {
      type = ClassificationType.OUTGOING;
      confidence = 0.7;
      method = 'phrasing';
    }
  }
  
  // Cap confidence at 0.95
  confidence = Math.min(confidence, 0.95);
  
  return {
    type,
    confidence,
    method
  };
}

module.exports = {
  classifyDocument,
  ClassificationType
};
