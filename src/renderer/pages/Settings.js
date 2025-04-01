import React, { useState, useEffect } from 'react';

/**
 * Settings page component
 * 
 * Allows users to configure application settings and company information
 */
function Settings({ updateCompanyName }) {
  const [companySettings, setCompanySettings] = useState({
    'company.name': '',
    'company.taxId': ''
  });
  
  const [taxSettings, setTaxSettings] = useState({
    'tax.fiscalYearStart': '',
    'tax.vatRate': '',
    'tax.minimumContributionRate': ''
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    'appearance.theme': 'light',
    'appearance.language': 'en'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load settings from each category
        const companyData = await window.electronAPI.getSettingsByCategory('company');
        const taxData = await window.electronAPI.getSettingsByCategory('tax');
        const appearanceData = await window.electronAPI.getSettingsByCategory('appearance');
        
        // Process company settings
        const companyObj = {};
        companyData.forEach(setting => {
          companyObj[setting.key] = setting.value;
        });
        setCompanySettings(companyObj);
        
        // Process tax settings
        const taxObj = {};
        taxData.forEach(setting => {
          taxObj[setting.key] = setting.value;
        });
        setTaxSettings(taxObj);
        
        // Process appearance settings
        const appearanceObj = {};
        appearanceData.forEach(setting => {
          appearanceObj[setting.key] = setting.value;
        });
        setAppearanceSettings(appearanceObj);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Handle input changes for company settings
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for tax settings
  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTaxSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for appearance settings
  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save all settings
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save company settings
      for (const [key, value] of Object.entries(companySettings)) {
        await window.electronAPI.updateSetting(key, value);
      }
      
      // Save tax settings
      for (const [key, value] of Object.entries(taxSettings)) {
        await window.electronAPI.updateSetting(key, value);
      }
      
      // Save appearance settings
      for (const [key, value] of Object.entries(appearanceSettings)) {
        await window.electronAPI.updateSetting(key, value);
      }
      
      // Update company name in parent component if function provided
      if (updateCompanyName && companySettings['company.name']) {
        updateCompanyName(companySettings['company.name']);
      }
      
      setSaveMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading settings...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p className="subtitle">Configure application settings and preferences</p>
      
      {saveMessage && (
        <div className={`alert ${saveMessage.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {saveMessage}
        </div>
      )}
      
      <div className="settings-grid">
        <div className="card">
          <h2 className="card-title">Company Information</h2>
          <div className="form-group">
            <label htmlFor="company.name" className="form-label">Company Name</label>
            <input
              type="text"
              id="company.name"
              name="company.name"
              className="form-control"
              value={companySettings['company.name']}
              onChange={handleCompanyChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="company.taxId" className="form-label">Tax ID / Registration Number</label>
            <input
              type="text"
              id="company.taxId"
              name="company.taxId"
              className="form-control"
              value={companySettings['company.taxId']}
              onChange={handleCompanyChange}
            />
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">Tax Settings</h2>
          <div className="form-group">
            <label htmlFor="tax.fiscalYearStart" className="form-label">Fiscal Year Start (MM-DD)</label>
            <input
              type="text"
              id="tax.fiscalYearStart"
              name="tax.fiscalYearStart"
              className="form-control"
              placeholder="01-01"
              value={taxSettings['tax.fiscalYearStart']}
              onChange={handleTaxChange}
            />
            <small className="form-help">Format: MM-DD (e.g., 01-01 for January 1)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="tax.vatRate" className="form-label">Default VAT Rate (%)</label>
            <input
              type="number"
              id="tax.vatRate"
              name="tax.vatRate"
              className="form-control"
              min="0"
              max="100"
              step="0.1"
              value={taxSettings['tax.vatRate']}
              onChange={handleTaxChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tax.minimumContributionRate" className="form-label">Minimum Contribution Rate (%)</label>
            <input
              type="number"
              id="tax.minimumContributionRate"
              name="tax.minimumContributionRate"
              className="form-control"
              min="0"
              max="100"
              step="0.01"
              value={taxSettings['tax.minimumContributionRate']}
              onChange={handleTaxChange}
            />
            <small className="form-help">Default: 0.25% of turnover</small>
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">Appearance</h2>
          <div className="form-group">
            <label htmlFor="appearance.theme" className="form-label">Theme</label>
            <select
              id="appearance.theme"
              name="appearance.theme"
              className="form-control"
              value={appearanceSettings['appearance.theme']}
              onChange={handleAppearanceChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="appearance.language" className="form-label">Language</label>
            <select
              id="appearance.language"
              name="appearance.language"
              className="form-control"
              value={appearanceSettings['appearance.language']}
              onChange={handleAppearanceChange}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
            <small className="form-help">Note: Language support is limited in this MVP version</small>
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">About</h2>
          <div className="about-info">
            <p><strong>Financial Pre-Accounting Agent</strong></p>
            <p>Version: 1.0.0-MVP</p>
            <p>This application helps Moroccan companies organize financial documents, generate reports, and calculate taxes based on Finance Law 2025.</p>
            <p className="legal">Licensed under MIT License</p>
          </div>
          
          <div className="version-info">
            <p>Based on Finance Law 2025 (Law No. 60-24)</p>
            <p>Tax rules version: 1.0.0</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="form-actions centered">
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
      
      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> This application provides estimates based on the information provided and our understanding of Moroccan tax law.
          It is not a substitute for professional accounting advice. Always consult with a certified accountant for official tax guidance.
        </p>
      </div>
    </div>
  );
}

export default Settings;
