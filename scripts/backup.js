#!/usr/bin/env node

/**
 * Automated backup script for Financial Pre-Accounting Agent
 * 
 * This script creates timestamped backups of the source code and data
 * to provide version history and data protection.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Base directory for backups
  backupDir: path.join(__dirname, '../backups'),
  
  // Directories to exclude from source backup
  excludeDirs: ['node_modules', 'builds', 'backups'],
  
  // Database location (will be determined at runtime in production)
  dataDir: process.env.APPDATA || (process.platform === 'darwin' ? 
    path.join(process.env.HOME, 'Library/Application Support') : 
    path.join(process.env.HOME, '.local/share'))
};

// Create backup directory if it doesn't exist
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

// Generate timestamp for backup filename
const generateTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
};

// Get version from package.json
const getVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  return packageJson.version;
};

/**
 * Create a backup of source code using Git archive
 */
const backupSourceCode = () => {
  try {
    const timestamp = generateTimestamp();
    const version = getVersion();
    const backupPath = path.join(config.backupDir, `${version}`);
    
    // Create version directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    const backupFilename = path.join(backupPath, `source-${timestamp}.zip`);
    
    // Create a zip archive from the current commit
    console.log(`Creating source code backup at ${backupFilename}...`);
    
    // Create a zip archive
    const output = fs.createWriteStream(backupFilename);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Handle archive events
    output.on('close', () => {
      console.log(`Source code backup complete: ${archive.pointer()} total bytes`);
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Add files to the archive
    const rootDir = path.join(__dirname, '..');
    
    // Function to recursively add files
    const addFilesToArchive = (dirPath, basePath) => {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const relativePath = path.relative(rootDir, filePath);
        
        // Skip excluded directories
        if (config.excludeDirs.some(excludeDir => relativePath.startsWith(excludeDir))) {
          continue;
        }
        
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          // Recursively add subdirectory files
          addFilesToArchive(filePath, path.join(basePath, file));
        } else {
          // Add file to archive
          archive.file(filePath, { name: path.join(basePath, file) });
        }
      }
    };
    
    // Add all files to archive
    addFilesToArchive(rootDir, '');
    
    // Finalize the archive
    archive.finalize();
    
    return backupFilename;
  } catch (error) {
    console.error('Error backing up source code:', error);
    return null;
  }
};

/**
 * Create backup of application data (currently a placeholder)
 * In the future, this would backup the SQLite database
 */
const backupApplicationData = () => {
  try {
    const timestamp = generateTimestamp();
    const version = getVersion();
    const backupPath = path.join(config.backupDir, `${version}`);
    
    // Create version directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    // Note: In the full version, we would determine the actual database path
    // and use SQLite tools to create a proper backup
    console.log('Application data backup is not implemented in this MVP version');
    console.log('This will be added in a future version');
    
    return "Not implemented in MVP";
  } catch (error) {
    console.error('Error backing up application data:', error);
    return null;
  }
};

/**
 * Main backup function
 */
const performBackup = async () => {
  console.log('Starting Financial Pre-Accounting Agent backup...');
  console.log('Timestamp:', generateTimestamp());
  console.log('Version:', getVersion());
  
  // Backup source code
  const sourceBackupPath = backupSourceCode();
  
  // Backup application data (database)
  const dataBackupPath = backupApplicationData();
  
  console.log('\nBackup Summary:');
  console.log('---------------');
  console.log('Source code backup:', sourceBackupPath || 'FAILED');
  console.log('Data backup:', dataBackupPath || 'FAILED');
  console.log('\nBackup Complete!');
};

// Execute backup
performBackup().catch(error => {
  console.error('Backup failed:', error);
  process.exit(1);
});
