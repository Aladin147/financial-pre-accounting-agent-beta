/**
 * Document Processor Core Module
 * 
 * Provides central functionality for document processing, detection,
 * and financial data extraction.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');
const { Worker } = require('worker_threads');

// Import specific document type processors
const pdfProcessor = require('./pdf-processor');
const imageProcessor = require('./image-processor');
const docxProcessor = require('./docx-processor');

// Common utility functions
const { extractFinancialData } = require('./financial-extractor');
const { classifyDocument } = require('./document-classifier');

/**
 * Document Type Enum
 */
const DocumentType = {
  PDF: 'pdf',
  IMAGE: 'image',
  DOCX: 'docx',
  UNKNOWN: 'unknown'
};

/**
 * Document Processor Class
 */
class DocumentProcessor {
  /**
   * Create a new document processor instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      tempDir: options.tempDir || path.join(process.cwd(), 'temp'),
      ocrEnabled: options.ocrEnabled !== false,
      enhanceImages: options.enhanceImages !== false,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      ...options
    };
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.options.tempDir)) {
      fs.mkdirSync(this.options.tempDir, { recursive: true });
    }
    
    logger.info('Document processor initialized', {
      options: this.options
    });
  }
  
  /**
   * Detect document type based on file extension and contents
   * @param {string} filePath - Path to the document
   * @returns {Promise<string>} Document type
   */
  async detectDocumentType(filePath) {
    logger.debug('Detecting document type', { filePath });
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Get file extension
      const ext = path.extname(filePath).toLowerCase().substring(1);
      
      // Determine document type based on extension
      let documentType = DocumentType.UNKNOWN;
      
      switch (ext) {
        case 'pdf':
          documentType = DocumentType.PDF;
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'tiff':
        case 'gif':
        case 'bmp':
          documentType = DocumentType.IMAGE;
          break;
        case 'doc':
        case 'docx':
          documentType = DocumentType.DOCX;
          break;
      }
      
      logger.debug('Document type detected', { filePath, documentType });
      return documentType;
    } catch (error) {
      logger.error('Error detecting document type', { 
        filePath, 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Process a document and extract all text content
   * @param {string} filePath - Path to the document
   * @returns {Promise<Object>} Extracted text and metadata
   */
  async extractText(filePath) {
    logger.info('Extracting text from document', { filePath });
    
    try {
      // Detect document type
      const documentType = await this.detectDocumentType(filePath);
      
      // Process based on document type
      let result;
      
      switch (documentType) {
        case DocumentType.PDF:
          result = await pdfProcessor.extractText(filePath, this.options);
          break;
        case DocumentType.IMAGE:
          result = await imageProcessor.extractText(filePath, this.options);
          break;
        case DocumentType.DOCX:
          result = await docxProcessor.extractText(filePath, this.options);
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }
      
      logger.info('Text extraction completed', { 
        filePath, 
        textLength: result.text.length 
      });
      
      return {
        documentType,
        ...result
      };
    } catch (error) {
      logger.error('Error extracting text from document', { 
        filePath, 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Process a document and extract financial data
   * @param {string} filePath - Path to the document
   * @returns {Promise<Object>} Extracted financial data
   */
  async processDocument(filePath) {
    logger.info('Processing document', { filePath });
    
    try {
      // Extract text from document
      const extractionResult = await this.extractText(filePath);
      
      // Extract financial data from text
      const financialData = await extractFinancialData(
        extractionResult.text,
        extractionResult.documentType,
        this.options
      );
      
      // Classify document (incoming/outgoing)
      const classification = await classifyDocument(
        financialData,
        extractionResult.text,
        this.options
      );
      
      // Combine results
      const result = {
        filePath,
        documentType: extractionResult.documentType,
        classification,
        financialData,
        metadata: extractionResult.metadata || {},
        confidence: financialData.confidence,
        processingTime: new Date().toISOString()
      };
      
      logger.info('Document processing completed', { 
        filePath, 
        classification: classification.type,
        confidence: financialData.confidence
      });
      
      return result;
    } catch (error) {
      logger.error('Error processing document', { 
        filePath, 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Process multiple documents in parallel
   * @param {Array<string>} filePaths - Array of file paths
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Array<Object>>} Array of processing results
   */
  async processBatch(filePaths, progressCallback) {
    logger.info('Processing document batch', { count: filePaths.length });
    
    // Process documents sequentially to avoid issues
    const results = [];
    const errors = [];
    let completed = 0;
    
    // Process each document sequentially
    for (const filePath of filePaths) {
      try {
        // Process document
        const result = await this.processDocument(filePath);
        results.push(result);
        
        // Update progress
        completed++;
        if (progressCallback) {
          progressCallback(completed, filePaths.length, errors.length);
        }
        
        logger.info('Document processed successfully', { 
          filePath,
          completed,
          total: filePaths.length
        });
      } catch (error) {
        logger.error('Error processing document in batch', { 
          filePath, 
          error: error.message 
        });
        
        errors.push({
          filePath,
          error: error.message
        });
        
        // Update progress
        completed++;
        if (progressCallback) {
          progressCallback(completed, filePaths.length, errors.length);
        }
      }
    }
    
    logger.info('Batch processing completed', { 
      total: filePaths.length,
      successful: results.length,
      failed: errors.length
    });
    
    return {
      results: results.filter(r => r !== null),
      errors
    };
  }
  
  /**
   * Process a single document in a worker thread
   * @param {string} filePath - Path to the document
   * @returns {Promise<Object>} Processing result
   */
  processInWorker(filePath) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          filePath,
          options: this.options
        }
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}

// Export processor class and types
module.exports = {
  DocumentProcessor,
  DocumentType
};
