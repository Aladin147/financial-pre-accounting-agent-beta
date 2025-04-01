/**
 * Logger utility for Financial Pre-Accounting Agent
 * 
 * This module provides a centralized logging system for the application,
 * writing logs to both console and file.
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

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

// Ensure logs directory exists
const ensureLogDirectory = () => {
  const logPath = path.join(getAppPath(), 'logs');
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }
  return logPath;
};

// Get current date in YYYY-MM-DD format
const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Get current time in HH:MM:SS.mmm format
const getFormattedTime = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
};

// Log levels
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

class Logger {
  constructor() {
    this.logPath = ensureLogDirectory();
    this.currentLogFile = path.join(this.logPath, `${getFormattedDate()}.log`);
  }

  // Write to log file
  _writeToFile(level, message, meta) {
    try {
      const logDate = getFormattedDate();
      const logFile = path.join(this.logPath, `${logDate}.log`);
      
      // Update log file path if date changed
      if (this.currentLogFile !== logFile) {
        this.currentLogFile = logFile;
      }
      
      const timestamp = getFormattedTime();
      const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
      const logEntry = `[${timestamp}] [${level}] ${message}${metaString}\n`;
      
      fs.appendFileSync(this.currentLogFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Log with level
  log(level, message, meta) {
    // Format console output
    const timestamp = getFormattedTime();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    
    // Output to console with color based on level
    switch(level) {
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] [${level}] ${message}${metaString}`);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] [${level}] ${message}${metaString}`);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] [${level}] ${message}${metaString}`);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`[${timestamp}] [${level}] ${message}${metaString}`);
        break;
      default:
        console.log(`[${timestamp}] [${level}] ${message}${metaString}`);
    }
    
    // Write to file
    this._writeToFile(level, message, meta);
  }

  // Convenience methods for different log levels
  debug(message, meta) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message, meta) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message, meta) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message, meta) {
    this.log(LogLevel.ERROR, message, meta);
  }

  fatal(message, meta) {
    this.log(LogLevel.FATAL, message, meta);
  }

  // Get all logs for a specific date
  getLogs(date) {
    const logDate = date || getFormattedDate();
    const logFile = path.join(this.logPath, `${logDate}.log`);
    
    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf8');
    }
    
    return 'No logs found for the specified date.';
  }
}

// Export a singleton instance
const logger = new Logger();
module.exports = { logger, LogLevel };
