import React, { useState, useEffect } from 'react';

/**
 * Dashboard page component
 * 
 * Displays an overview of the financial data, documents, and recent activity
 */
function Dashboard() {
  const [documents, setDocuments] = useState({ incoming: [], outgoing: [] });
  const [calculations, setCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get document counts
        const incomingDocs = await window.electronAPI.listDocuments('incoming');
        const outgoingDocs = await window.electronAPI.listDocuments('outgoing');
        
        setDocuments({
          incoming: incomingDocs || [],
          outgoing: outgoingDocs || []
        });
        
        // Get recent tax calculations if available
        try {
          const taxCalculations = await window.electronAPI.getTaxCalculations();
          setCalculations(taxCalculations || []);
        } catch (error) {
          console.error('Error loading tax calculations:', error);
          setCalculations([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading dashboard data...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="subtitle">Welcome to your Financial Pre-Accounting Dashboard</p>
      
      <div className="grid">
        <div className="card stats-card">
          <div className="stats-value">{documents.incoming.length}</div>
          <div className="stats-label">Incoming Documents</div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-value">{documents.outgoing.length}</div>
          <div className="stats-label">Outgoing Documents</div>
        </div>
        
        <div className="card stats-card">
          <div className="stats-value">{calculations.length}</div>
          <div className="stats-label">Tax Calculations</div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Finance Law 2025 Overview</h2>
        <p>The Financial Pre-Accounting Agent applies Morocco's Finance Law 2025 (Law No. 60-24) for tax calculations.</p>
        
        <h3>Key Tax Rates:</h3>
        <ul>
          <li>Corporate Income Tax (CIT): Progressive rates from 17.5% to 34%</li>
          <li>Value Added Tax (VAT): Standard rate 20%</li>
          <li>Minimum Contribution: 0.25% of turnover</li>
        </ul>
        
        <div className="cta-container">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.hash = '#/tax-calculator'}
          >
            Calculate Taxes
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => window.location.hash = '#/documents'}
          >
            Manage Documents
          </button>
        </div>
      </div>
      
      {calculations.length > 0 && (
        <div className="card">
          <h2 className="card-title">Recent Tax Calculations</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Period</th>
                  <th>Taxable Income</th>
                  <th>Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {calculations.slice(0, 5).map((calc, index) => (
                  <tr key={index}>
                    <td>{new Date(calc.calculationDate).toLocaleDateString()}</td>
                    <td>{calc.periodType}</td>
                    <td>{calc.taxableIncome.toLocaleString()} MAD</td>
                    <td>{calc.totalTaxLiability.toLocaleString()} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="card">
        <h2 className="card-title">Getting Started</h2>
        <p>Follow these steps to get started with the Financial Pre-Accounting Agent:</p>
        
        <ol>
          <li>Add your company information in the Settings page</li>
          <li>Import your financial documents using the Document Manager</li>
          <li>Use the Tax Calculator to estimate your tax obligations</li>
          <li>Generate reports for your accountant or financial advisor</li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
