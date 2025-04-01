import React from 'react';

/**
 * Application header component
 * 
 * Displays company name, application title, and version information
 */
function Header({ companyName, version }) {
  return (
    <header className="app-header">
      <div className="branding">
        <div className="company-name">{companyName}</div>
        <div className="app-title">Financial Pre-Accounting Agent</div>
      </div>
      
      <div className="app-info">
        <div className="version">v{version}</div>
      </div>
    </header>
  );
}

export default Header;
