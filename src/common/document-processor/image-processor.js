/**
 * Image Document Processor
 * 
 * Handles extraction of text from image documents
 * using Tesseract OCR with image preprocessing for better results.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');
const { createWorker } = require('node-tesseract-ocr');
const Jimp = require('jimp');

/**
 * Extract text from an image document
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function extractText(filePath, options = {}) {
  logger.debug('Extracting text from image', { filePath });
  
  try {
    // Create temp directory if it doesn't exist
    const tempDir = options.tempDir || path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a temp copy of the image for preprocessing
    const tempImagePath = path.join(tempDir, `ocr_${path.basename(filePath)}`);
    fs.copyFileSync(filePath, tempImagePath);
    
    // Preprocess image to improve OCR results
    if (options.enhanceImages !== false) {
      await enhanceImage(tempImagePath);
    }
    
    // Get image metadata
    const metadata = await extractImageMetadata(filePath);
    
    // Perform OCR
    const text = await performOCR(tempImagePath);
    
    // Clean up temp file
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
    
    // Return extracted text and metadata
    return {
      text,
      metadata
    };
  } catch (error) {
    logger.error('Error extracting text from image', { 
      filePath, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Enhance image for better OCR results
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<void>}
 */
async function enhanceImage(imagePath) {
  try {
    logger.debug('Enhancing image for OCR', { imagePath });
    
    const image = await Jimp.read(imagePath);
    
    // Apply various enhancements to improve OCR
    image
      .greyscale() // Convert to grayscale
      .contrast(0.2) // Increase contrast
      .normalize(); // Normalize colors
    
    // Apply threshold to make text more distinct (binarize)
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const value = this.bitmap.data[idx];
      this.bitmap.data[idx] = value > 160 ? 255 : 0; // threshold at value 160
      this.bitmap.data[idx + 1] = value > 160 ? 255 : 0;
      this.bitmap.data[idx + 2] = value > 160 ? 255 : 0;
    });
    
    // Scale image if it's small
    if (image.bitmap.width < 1000 || image.bitmap.height < 1000) {
      const factor = Math.min(1.5, 1000 / Math.min(image.bitmap.width, image.bitmap.height));
      image.scale(factor);
    }
    
    await image.writeAsync(imagePath);
    logger.debug('Image enhancement completed', { imagePath });
    
  } catch (error) {
    logger.error('Error enhancing image', { 
      imagePath, 
      error: error.message 
    });
    // Continue without enhancement
  }
}

/**
 * Perform OCR on an image
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Extracted text
 */
async function performOCR(imagePath) {
  logger.debug('Performing OCR on image', { imagePath });
  
  try {
    // Configure and create Tesseract worker
    const worker = createWorker();
    
    // Language options optimized for financial documents
    const config = {
      lang: 'eng+ara+fra', // English, Arabic, and French for Moroccan documents
      oem: 1, // LSTM only
      psm: 3, // Auto page segmentation
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      tessjs_create_box: '0',
      tessjs_create_unlv: '0',
      tessjs_create_osd: '0',
      // Language model configurations
      preserve_interword_spaces: '1',
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;(){}[]!?@#$%^&*+-=€£$¥یﻢﻍ|<>"\'/\\',
    };
    
    await worker.load();
    await worker.loadLanguage('eng+ara+fra');
    await worker.initialize('eng+ara+fra');
    
    // Set additional parameters for better recognition of financial documents
    await worker.setParameters(config);
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imagePath);
    
    // Terminate worker
    await worker.terminate();
    
    logger.debug('OCR completed', { 
      imagePath, 
      textLength: text.length 
    });
    
    return text;
  } catch (error) {
    logger.error('Error performing OCR', { 
      imagePath, 
      error: error.message 
    });
    return '';
  }
}

/**
 * Extract metadata from an image file
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Image metadata
 */
async function extractImageMetadata(imagePath) {
  try {
    const image = await Jimp.read(imagePath);
    
    // Extract basic image metadata
    const metadata = {
      width: image.bitmap.width,
      height: image.bitmap.height,
      format: image.getExtension(),
      colorType: image.hasAlpha() ? 'with alpha' : 'no alpha',
      size: fs.statSync(imagePath).size,
      createdAt: fs.statSync(imagePath).birthtime,
      modifiedAt: fs.statSync(imagePath).mtime,
    };
    
    return metadata;
  } catch (error) {
    logger.error('Error extracting image metadata', { 
      imagePath, 
      error: error.message 
    });
    return {};
  }
}

module.exports = {
  extractText
};
