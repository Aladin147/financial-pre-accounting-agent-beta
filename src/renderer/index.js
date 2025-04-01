/**
 * Entry point for the renderer process
 * 
 * This file initializes the application UI
 */

// Get DOM references
const rootElement = document.getElementById('root');

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

  // Add simple event listeners for navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      // In a real app, we would show the appropriate page here
      console.log(`Navigating to: ${link.getAttribute('href')}`);
    });
  });

  // Add event listeners for buttons
  document.getElementById('calculate-tax-btn')?.addEventListener('click', () => {
    document.querySelector('a[href="#tax-calculator"]').click();
  });

  document.getElementById('manage-docs-btn')?.addEventListener('click', () => {
    document.querySelector('a[href="#documents"]').click();
  });
});
