/**
 * Entry point for the renderer process
 * 
 * This file initializes the application UI
 */

// Get DOM references
const rootElement = document.getElementById('root');

// Helper functions
function log(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // If the log area exists, add the message to it
  const logArea = document.getElementById('log-area');
  if (logArea) {
    const entry = document.createElement('div');
    entry.classList.add('log-entry');
    
    if (type === 'success') entry.classList.add('success');
    if (type === 'error') entry.classList.add('error');
    
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
  }
}

// Create basic application structure as a quick fix
document.addEventListener('DOMContentLoaded', () => {
  // Display version information
  const versionInfo = window.electronAPI.getAppVersion();
  console.log(`Financial Pre-Accounting Agent v${versionInfo.version}`);

  // Create main application container
  rootElement.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="branding">
          <div class="company-name">Financial Pre-Accounting Agent</div>
          <div class="app-title">v${versionInfo.version}</div>
        </div>
        
        <div class="app-info">
          <div>Morocco Finance Law 2025 Compliant</div>
        </div>
      </header>
      
      <div class="main-content">
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#dashboard" class="nav-link active">
                  <span class="nav-icon">📊</span>
                  <span>Dashboard</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="#documents" class="nav-link">
                  <span class="nav-icon">📁</span>
                  <span>Document Manager</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="#tax-calculator" class="nav-link">
                  <span class="nav-icon">🧮</span>
                  <span>Tax Calculator</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="#reports" class="nav-link">
                  <span class="nav-icon">📋</span>
                  <span>Reports</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="#settings" class="nav-link">
                  <span class="nav-icon">⚙️</span>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        
        <div class="page-content">
          <div id="dashboard-page" class="active-page">
            <h1>Dashboard</h1>
            <p class="subtitle">Welcome to your Financial Pre-Accounting Dashboard</p>
            
            <div class="grid">
              <div class="card stats-card">
                <div class="stats-value">0</div>
                <div class="stats-label">Incoming Documents</div>
              </div>
              
              <div class="card stats-card">
                <div class="stats-value">0</div>
                <div class="stats-label">Outgoing Documents</div>
              </div>
              
              <div class="card stats-card">
                <div class="stats-value">0</div>
                <div class="stats-label">Tax Calculations</div>
              </div>
            </div>
            
            <div class="card">
              <h2 class="card-title">Finance Law 2025 Updates</h2>
              <p>The Financial Pre-Accounting Agent now includes comprehensive support for Morocco's Finance Law 2025 tax calculations.</p>
              
              <div>
                <h3>Key Tax Features in Version 2.0:</h3>
                <ul>
                  <li>PDF report generation with professional formatting</li>
                  <li>Detailed tax bracket breakdowns</li>
                  <li>Minimum contribution calculations</li>
                  <li>Enhanced document management</li>
                </ul>
              </div>
              
              <div class="cta-container">
                <button class="btn btn-primary" id="calculate-tax-btn">
                  Calculate Taxes
                </button>
                
                <button class="btn btn-outline" id="manage-docs-btn">
                  Manage Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="app-footer">
        <p>Financial Pre-Accounting Agent v${versionInfo.version} | Based on Finance Law 2025 (Law No. 60-24)</p>
      </div>
    </div>
  `;

  // Create page containers for navigation
  const pageContent = document.querySelector('.page-content');
  const pages = [
    { id: 'documents-page', title: 'Document Manager', icon: '📁' },
    { id: 'tax-calculator-page', title: 'Tax Calculator', icon: '🧮' },
    { id: 'reports-page', title: 'Reports', icon: '📋' },
    { id: 'settings-page', title: 'Settings', icon: '⚙️' }
  ];
  
  // Create page containers for each navigation item
  pages.forEach(page => {
    const pageDiv = document.createElement('div');
    pageDiv.id = page.id;
    pageDiv.className = 'page';
    pageDiv.innerHTML = `
      <h1>${page.title}</h1>
      <p class="subtitle">Welcome to the ${page.title}</p>
      <div class="card">
        <h2 class="card-title">${page.title} Module</h2>
        <p>This module provides tools for ${page.title.toLowerCase()} in accordance with Finance Law 2025.</p>
        <div class="content-placeholder">
          <div class="placeholder-icon">${page.icon}</div>
          <p>Content for ${page.title} will be displayed here</p>
        </div>
      </div>
    `;
    pageContent.appendChild(pageDiv);
  });
  
  // Create specific content for the tax calculator page
  const taxPage = document.getElementById('tax-calculator-page');
  if (taxPage) {
    taxPage.innerHTML = `
      <h1>Tax Calculator</h1>
      <p class="subtitle">Calculate taxes based on Morocco's Finance Law 2025</p>
      
      <div class="card">
        <h2 class="card-title">Tax Calculation Form</h2>
        <form id="tax-form" class="tax-form">
          <div class="form-group">
            <label for="revenue">Revenue (MAD)</label>
            <input type="number" id="revenue" placeholder="Enter total revenue" value="1500000">
          </div>
          
          <div class="form-group">
            <label for="expenses">Expenses (MAD)</label>
            <input type="number" id="expenses" placeholder="Enter total expenses" value="800000">
          </div>
          
          <div class="form-group">
            <label for="other-deductions">Other Deductions (MAD)</label>
            <input type="number" id="other-deductions" placeholder="Enter other deductions" value="50000">
          </div>
          
          <div class="form-actions">
            <button type="button" id="calculate-button" class="btn btn-primary">Calculate Tax</button>
            <button type="reset" class="btn btn-outline">Reset</button>
          </div>
        </form>
      </div>
      
      <div id="tax-results" class="card" style="margin-top: 20px; display: none;">
        <h2 class="card-title">Tax Calculation Results</h2>
        <div id="tax-results-content"></div>
      </div>
    `;
  }

  // Add styles for the new components
  const style = document.createElement('style');
  style.textContent = `
    .page {
      display: none;
    }
    
    .active-page {
      display: block;
      animation: fadeIn 0.3s ease forwards;
    }
    
    .content-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: var(--border-radius-md);
      margin-top: 20px;
    }
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      color: var(--text-primary);
      font-size: 14px;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(212, 180, 131, 0.2);
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    
    .tax-result-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .tax-result-row:last-child {
      border-bottom: none;
    }
    
    .tax-result-label {
      font-weight: 500;
    }
    
    .tax-result-value {
      font-weight: 600;
    }
    
    .tax-result-highlight {
      color: var(--primary);
    }
  `;
  document.head.appendChild(style);

  // Add proper event listeners for navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Get the target page ID
      const targetId = link.getAttribute('href').substring(1);
      
      // Update header title
      const headerTitle = document.querySelector('.header-title h2');
      if (headerTitle) {
        headerTitle.textContent = link.querySelector('span:last-child').textContent;
      }
      
      // Update breadcrumb
      const breadcrumb = document.querySelector('.header-breadcrumb span:last-child');
      if (breadcrumb) {
        breadcrumb.textContent = link.querySelector('span:last-child').textContent;
      }
      
      // Hide all pages
      document.querySelectorAll('.page, .active-page').forEach(page => {
        page.classList.remove('active-page');
        page.style.display = 'none';
      });
      
      // Show the target page
      const targetPage = 
        targetId === 'dashboard' ? document.getElementById('dashboard-page') :
        targetId === 'documents' ? document.getElementById('documents-page') :
        targetId === 'tax-calculator' ? document.getElementById('tax-calculator-page') :
        targetId === 'reports' ? document.getElementById('reports-page') :
        targetId === 'settings' ? document.getElementById('settings-page') :
        document.getElementById('dashboard-page');
      
      if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('active-page');
      }
      
      // Log navigation for debugging
      log(`Navigated to: ${targetId}`, 'success');
    });
  });

  // Add event listeners for main buttons
  document.getElementById('calculate-tax-btn')?.addEventListener('click', () => {
    document.querySelector('a[href="#tax-calculator"]').click();
  });

  document.getElementById('manage-docs-btn')?.addEventListener('click', () => {
    document.querySelector('a[href="#documents"]').click();
  });
  
  // Add tax calculator logic
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'calculate-button') {
      const revenue = parseFloat(document.getElementById('revenue').value) || 0;
      const expenses = parseFloat(document.getElementById('expenses').value) || 0;
      const otherDeductions = parseFloat(document.getElementById('other-deductions').value) || 0;
      
      // Calculate taxable income
      const taxableIncome = Math.max(0, revenue - expenses - otherDeductions);
      
      // Apply progressive tax rates (Finance Law 2025)
      let tax = 0;
      if (taxableIncome <= 300000) {
        tax = taxableIncome * 0.175;
      } else if (taxableIncome <= 1000000) {
        tax = 300000 * 0.175 + (taxableIncome - 300000) * 0.2;
      } else {
        tax = 300000 * 0.175 + 700000 * 0.2 + (taxableIncome - 1000000) * 0.2275;
      }
      
      // Calculate minimum contribution
      const minimumContribution = revenue * 0.0025;
      
      // Final tax is the higher of calculated tax and minimum contribution
      const finalTax = Math.max(tax, minimumContribution);
      const effectiveTaxRate = taxableIncome > 0 ? (finalTax / taxableIncome) * 100 : 0;
      
      // Format the numbers with commas
      const formatNumber = (num) => {
        return num.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };
      
      // Show the results
      const taxResultsDiv = document.getElementById('tax-results');
      const taxResultsContent = document.getElementById('tax-results-content');
      
      taxResultsContent.innerHTML = `
        <div class="tax-result-row">
          <span class="tax-result-label">Revenue:</span>
          <span class="tax-result-value">${formatNumber(revenue)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Expenses:</span>
          <span class="tax-result-value">${formatNumber(expenses)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Other Deductions:</span>
          <span class="tax-result-value">${formatNumber(otherDeductions)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Taxable Income:</span>
          <span class="tax-result-value">${formatNumber(taxableIncome)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Calculated Tax:</span>
          <span class="tax-result-value">${formatNumber(tax)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Minimum Contribution:</span>
          <span class="tax-result-value">${formatNumber(minimumContribution)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Final Tax:</span>
          <span class="tax-result-value tax-result-highlight">${formatNumber(finalTax)} MAD</span>
        </div>
        <div class="tax-result-row">
          <span class="tax-result-label">Effective Tax Rate:</span>
          <span class="tax-result-value tax-result-highlight">${effectiveTaxRate.toFixed(2)}%</span>
        </div>
      `;
      
      taxResultsDiv.style.display = 'block';
      
      // Log the calculation
      log('Tax calculation completed successfully', 'success');
    }
  });
});
