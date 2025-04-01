import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import DocumentManager from './pages/DocumentManager';
import TaxCalculator from './pages/TaxCalculator';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Main application component
function App() {
  // Application state
  const [appVersion, setAppVersion] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load application data on startup
  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Get application version information
        const versionInfo = window.electronAPI.getAppVersion();
        setAppVersion(versionInfo.version);
        
        // Load company name from settings
        const company = await window.electronAPI.getSetting('company.name');
        setCompanyName(company || 'Your Company');
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppData();
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="loading-container">
        <h1>Loading Financial Pre-Accounting Agent...</h1>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Header companyName={companyName} version={appVersion} />
        
        <div className="main-content">
          <Sidebar />
          
          <div className="page-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentManager />} />
              <Route path="/tax-calculator" element={<TaxCalculator />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings updateCompanyName={setCompanyName} />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
        
        <div className="app-footer">
          <p>Financial Pre-Accounting Agent v{appVersion} | Based on Finance Law 2025 (Law No. 60-24)</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
