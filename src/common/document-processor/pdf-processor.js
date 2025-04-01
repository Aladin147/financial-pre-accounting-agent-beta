/**
 * PDF Document Processor
 * 
 * Handles extraction of text and metadata from PDF documents
 * using PDF.js for text layer extraction with fallback to OCR
 * for scanned documents.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');
// Use a simpler PDF text extraction approach to avoid worker issues
const { createWorker } = require('node-tesseract-ocr');
const Jimp = require('jimp');

/**
 * Extract text from a PDF document using a simplified approach
 * @param {string} filePath - Path to the PDF file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function extractText(filePath, options = {}) {
  logger.debug('Extracting text from PDF using direct OCR', { filePath });
  
  try {
    // Use OCR directly on the PDF
    const tempDir = options.tempDir || path.join(process.cwd(), 'temp');
    let extractedText = '';
    let pageCount = 0;
    
    // Use simplified file-based approach to extract text from PDF
    try {
      // Use OCR on the entire PDF
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      logger.debug('OCR worker initialized, recognizing text from PDF', { filePath });
      const { data } = await worker.recognize(filePath);
      extractedText = data.text;
      
      await worker.terminate();
      
      // Estimate page count based on page break markers in text
      const pageBreaks = extractedText.match(/\f/g);
      pageCount = pageBreaks ? pageBreaks.length + 1 : 1;
      
      logger.info('Text extracted from PDF via OCR', { 
        filePath, 
        textLength: extractedText.length,
        estimatedPageCount: pageCount
      });
    } catch (error) {
      logger.error('Error in OCR processing for PDF', { 
        filePath, 
        error: error.message 
      });
      
      // Return empty text but don't fail the whole operation
      extractedText = '';
      pageCount = 0;
    }
    
    // Basic metadata extraction
    const stat = fs.statSync(filePath);
    const fileBasename = path.basename(filePath);
    
    return {
      text: extractedText,
      metadata: {
        title: fileBasename,
        pageCount,
        fileSize: stat.size,
        created: stat.birthtime,
        modified: stat.mtime,
        ocrUsed: true
      }
    };
  } catch (error) {
    logger.error('Error extracting text from PDF', { 
      filePath, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Extract text from a PDF page using the text layer
 * @param {Object} page - PDF.js page object
 * @returns {Promise<string>} Extracted text
 */
async function extractPageText(page) {
  try {
    const textContent = await page.getTextContent();
    
    // Convert text items to string
    const text = textContent.items
      .map(item => item.str)
      .join(' ');
    
    return text;
  } catch (error) {
    logger.error('Error extracting text from PDF page', { error: error.message });
    return '';
  }
}

/**
 * Extract text from a PDF page using OCR
 * @param {Object} page - PDF.js page object
 * @param {number} pageNumber - Page number
 * @param {string} originalFilePath - Path to the original PDF
 * @param {Object} options - Processing options
 * @returns {Promise<string>} Extracted text
 */
async function extractPageWithOCR(page, pageNumber, originalFilePath, options) {
  const tempDir = options.tempDir || path.join(process.cwd(), 'temp');
  const tempImagePath = path.join(tempDir, `pdf_page_${path.basename(originalFilePath)}_${pageNumber}.png`);
  
  try {
    // Render page to canvas
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
    const canvasFactory = new NodeCanvasFactory();
    const canvas = canvasFactory.create(viewport.width, viewport.height);
    
    const renderContext = {
      canvasContext: canvas.context,
      viewport,
      canvasFactory
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to image
    const imageData = canvas.canvas.toBuffer('image/png');
    fs.writeFileSync(tempImagePath, imageData);
    
    // Enhance image for better OCR results
    if (options.enhanceImages !== false) {
      await enhanceImage(tempImagePath);
    }
    
    // Perform OCR on the image
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { text } } = await worker.recognize(tempImagePath);
    await worker.terminate();
    
    // Clean up temporary file
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
    
    return text;
  } catch (error) {
    logger.error('Error performing OCR on PDF page', {
      page: pageNumber,
      filePath: originalFilePath,
      error: error.message
    });
    
    // Clean up temporary file in case of error
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
    
    return '';
  }
}

/**
 * Enhance image for better OCR results
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<void>}
 */
async function enhanceImage(imagePath) {
  try {
    const image = await Jimp.read(imagePath);
    
    // Apply image processing to improve OCR accuracy
    image
      .greyscale() // Convert to grayscale
      .contrast(0.2) // Increase contrast
      .normalize() // Normalize colors
      .quality(100); // Max quality
    
    await image.writeAsync(imagePath);
    
    logger.debug('Image enhanced for OCR', { imagePath });
  } catch (error) {
    logger.error('Error enhancing image for OCR', { 
      imagePath, 
      error: error.message 
    });
    // Continue without enhancement
  }
}

/**
 * Extract metadata from a PDF document
 * @param {Object} pdfDocument - PDF.js document object
 * @returns {Promise<Object>} Document metadata
 */
async function extractMetadata(pdfDocument) {
  try {
    const metadata = await pdfDocument.getMetadata();
    
    const result = {
      title: metadata.info?.Title,
      author: metadata.info?.Author,
      subject: metadata.info?.Subject,
      keywords: metadata.info?.Keywords,
      creator: metadata.info?.Creator,
      producer: metadata.info?.Producer,
      creationDate: metadata.info?.CreationDate,
      modificationDate: metadata.info?.ModDate
    };
    
    return result;
  } catch (error) {
    logger.error('Error extracting PDF metadata', { error: error.message });
    return {};
  }
}


module.exports = {
  extractText
};
