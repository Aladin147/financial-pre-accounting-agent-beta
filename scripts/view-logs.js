#!/usr/bin/env node

/**
 * Log viewer utility for Financial Pre-Accounting Agent
 * 
 * This script allows viewing application logs from the command line.
 * It can show logs for a specific date or all logs.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get the application data path
const getAppPath = () => {
  return process.env.APPDATA || 
    (process.platform === 'darwin' ? 
      path.join(process.env.HOME, 'Library/Application Support') : 
      path.join(process.env.HOME, '.local/share'));
};

// Path to logs
const logsPath = path.join(getAppPath(), 'financial-pre-accounting-agent-beta', 'logs');

// Check if logs directory exists
if (!fs.existsSync(logsPath)) {
  console.log(`No logs found. Log directory does not exist: ${logsPath}`);
  process.exit(0);
}

// Get log files
const logFiles = fs.readdirSync(logsPath).filter(file => file.endsWith('.log'));

// Display available log files
console.log('Available log files:');
logFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for file selection
rl.question('\nEnter file number to view (or "all" to see all logs): ', (answer) => {
  if (answer.toLowerCase() === 'all') {
    // Show all logs
    logFiles.forEach(file => {
      console.log(`\n--- ${file} ---\n`);
      const logContent = fs.readFileSync(path.join(logsPath, file), 'utf8');
      console.log(logContent);
    });
    rl.close();
  } else {
    // Show specific log file
    const fileIndex = parseInt(answer) - 1;
    if (fileIndex >= 0 && fileIndex < logFiles.length) {
      const selectedFile = logFiles[fileIndex];
      const logContent = fs.readFileSync(path.join(logsPath, selectedFile), 'utf8');
      console.log(`\n--- ${selectedFile} ---\n`);
      console.log(logContent);
    } else {
      console.log('Invalid selection. Please run the script again.');
    }
    rl.close();
  }
});

// Handle close
rl.on('close', () => {
  console.log('\nLog viewing completed.');
  process.exit(0);
});
