/**
 * DOCX Document Processor
 * 
 * Handles extraction of text and metadata from DOCX documents
 * using mammoth.js for Word document processing.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');
const mammoth = require('mammoth');

/**
 * Extract text from a DOCX document
 * @param {string} filePath - Path to the DOCX file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function extractText(filePath, options = {}) {
  logger.debug('Extracting text from DOCX', { filePath });
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the file
    const buffer = fs.readFileSync(filePath);
    
    // Extract metadata
    const metadata = await extractMetadata(buffer);
    
    // Configure extraction options
    const extractionOptions = {
      // Include various styles
      styleMap: [
        "p[style-name='Normal'] => p",
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
        "p[style-name='Title'] => h1.title",
        "p[style-name='Subtitle'] => h2.subtitle",
        "table => table",
        "tr => tr",
        "td => td",
      ]
    };
    
    // Convert the document to HTML and plain text
    const { value: html, messages } = await mammoth.convertToHtml({
      buffer,
      ...extractionOptions
    });
    
    const { value: text } = await mammoth.extractRawText({
      buffer,
      ...extractionOptions
    });
    
    // Log any warnings
    if (messages.length > 0) {
      logger.debug('DOCX conversion warnings', { 
        filePath, 
        messages 
      });
    }
    
    logger.info('DOCX text extraction completed', { 
      filePath, 
      textLength: text.length 
    });
    
    return {
      text,
      html, // Include HTML for potentially better financial data extraction
      metadata: {
        ...metadata,
        warnings: messages
      }
    };
  } catch (error) {
    logger.error('Error extracting text from DOCX', { 
      filePath, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Extract metadata from a DOCX document
 * @param {Buffer} buffer - Document buffer
 * @returns {Promise<Object>} Document metadata
 */
async function extractMetadata(buffer) {
  try {
    // Extract document metadata using mammoth
    const result = await mammoth.extractRawText({
      buffer,
      includeDefaultStyleMap: true
    });
    
    // Get document statistics
    const text = result.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const lineCount = text.split(/\n/).length;
    
    // Extract document properties if available
    // Note: mammoth doesn't provide full metadata extraction, so we use basic stats
    const metadata = {
      wordCount,
      lineCount,
      characterCount: text.length,
      format: 'docx'
    };
    
    return metadata;
  } catch (error) {
    logger.error('Error extracting DOCX metadata', { 
      error: error.message 
    });
    return {};
  }
}

module.exports = {
  extractText
};
