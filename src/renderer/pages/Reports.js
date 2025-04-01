import React, { useState, useEffect } from 'react';

/**
 * Reports page component
 * 
 * Displays reports history and allows generating new reports
 */
function Reports() {
  const [reports, setReports] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state for report generation
  const [formData, setFormData] = useState({
    reportType: 'financial-summary',
    startDate: '',
    endDate: '',
    name: '',
    description: ''
  });

  // Load reports data on component mount
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        // Get reports and tax calculations
        const reportsList = await window.electronAPI.getReports();
        const calculationsList = await window.electronAPI.getTaxCalculations();
        
        setReports(reportsList || []);
        setCalculations(calculationsList || []);
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportsData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Generate a new report
  const generateReport = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.reportType || !formData.name) {
      alert('Please fill in the required fields.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Prepare report options
      const reportOptions = {
        reportType: formData.reportType,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description
      };
      
      // Call IPC method to generate report
      const result = await window.electronAPI.generateReport(reportOptions);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error generating report');
      }
      
      // Add the new report to the list
      setReports(prevReports => [result.report, ...prevReports]);
      
      // Reset form
      setFormData({
        reportType: 'financial-summary',
        startDate: '',
        endDate: '',
        name: '',
        description: ''
      });
      
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading reports data...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <h1>Reports</h1>
      <p className="subtitle">Generate and manage financial reports</p>
      
      <div className="grid reports-grid">
        <div className="card">
          <h2 className="card-title">Generate New Report</h2>
          <form onSubmit={generateReport}>
            <div className="form-group">
              <label htmlFor="reportType" className="form-label">Report Type</label>
              <select
                id="reportType"
                name="reportType"
                className="form-control"
                value={formData.reportType}
                onChange={handleInputChange}
                required
              >
                <option value="financial-summary">Financial Summary</option>
                <option value="tax-report">Tax Report</option>
                <option value="documents-inventory">Documents Inventory</option>
                <option value="accounting-handover">Accountant Handover Package</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">Report Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </form>
        </div>
        
        <div className="card">
          <h2 className="card-title">Recent Tax Calculations</h2>
          
          {calculations.length === 0 ? (
            <div className="empty-state">
              <p>No tax calculations found.</p>
              <button
                className="btn btn-outline"
                onClick={() => window.location.hash = '#/tax-calculator'}
              >
                Go to Tax Calculator
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Taxable Income</th>
                    <th>Tax Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.slice(0, 5).map((calc, index) => (
                    <tr key={index}>
                      <td>{formatDate(calc.calculationDate)}</td>
                      <td>{calc.periodType}</td>
                      <td>{calc.taxableIncome?.toLocaleString()} MAD</td>
                      <td>{calc.totalTaxLiability?.toLocaleString()} MAD</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            setFormData({
                              reportType: 'tax-report',
                              name: `Tax Report - ${formatDate(calc.calculationDate)}`,
                              startDate: calc.periodStart || '',
                              endDate: calc.periodEnd || '',
                              description: `Based on calculation from ${formatDate(calc.calculationDate)}`
                            });
                          }}
                        >
                          Create Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Generated Reports</h2>
        
        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports generated yet. Use the form above to create your first report.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Generated Date</th>
                  <th>Period</th>
                  <th>Format</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.name}</td>
                    <td>{report.reportType}</td>
                    <td>{formatDate(report.generationDate)}</td>
                    <td>
                      {report.periodStart && report.periodEnd 
                        ? `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`
                        : 'N/A'}
                    </td>
                    <td>{report.format.toUpperCase()}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          // Open file in operating system's default program
                          // This will be handled by the main process
                          // Here we're just using an alert as a placeholder
                          alert(`Opening report: ${report.filePath}`);
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="card info-card">
        <h2 className="card-title">About Reports</h2>
        <p>
          Reports provide comprehensive summaries of your financial data and tax calculations.
          They can be used to verify your accounting figures, prepare for tax filing, or 
          share with your professional accountant.
        </p>
        
        <h3>Available Report Types:</h3>
        <ul>
          <li><strong>Financial Summary:</strong> Overview of income, expenses, and profit margins</li>
          <li><strong>Tax Report:</strong> Detailed breakdown of tax calculations and liability</li>
          <li><strong>Documents Inventory:</strong> List of all financial documents in the system</li>
          <li><strong>Accountant Handover Package:</strong> Comprehensive package for your professional accountant</li>
        </ul>
        
        <div className="note">
          <p>
            <strong>Note:</strong> In this MVP version, reports are generated as simple text files.
            Future versions will support PDF and Excel formats with advanced formatting and visualizations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
