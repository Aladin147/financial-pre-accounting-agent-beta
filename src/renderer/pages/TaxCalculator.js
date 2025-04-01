import React, { useState } from 'react';

/**
 * Tax Calculator page component
 * 
 * Implements tax calculation based on Finance Law 2025
 * Allows users to estimate tax liability based on their financial data
 */
function TaxCalculator() {
  // Form state
  const [formData, setFormData] = useState({
    revenue: '',
    expenses: '',
    otherDeductions: '',
    periodType: 'annual',
    periodStart: '',
    periodEnd: '',
    notes: ''
  });
  
  // Calculation results
  const [calculationResult, setCalculationResult] = useState(null);
  
  // Loading states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Perform tax calculation
  const calculateTax = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.revenue) {
      alert('Please enter your revenue.');
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Convert string inputs to numbers
      const calculationData = {
        revenue: parseFloat(formData.revenue),
        expenses: parseFloat(formData.expenses) || 0,
        otherDeductions: parseFloat(formData.otherDeductions) || 0,
        periodType: formData.periodType
      };
      
      // Call the tax calculation IPC method
      const result = await window.electronAPI.calculateTax(calculationData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setCalculationResult(result);
    } catch (error) {
      console.error('Error calculating tax:', error);
      alert(`Error calculating tax: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Save calculation to database
  const saveCalculation = async () => {
    if (!calculationResult) return;
    
    setIsSaving(true);
    
    try {
      // Prepare data to save
      const calculationToSave = {
        ...calculationResult,
        periodType: formData.periodType,
        periodStart: formData.periodStart || new Date().toISOString().split('T')[0],
        periodEnd: formData.periodEnd || new Date().toISOString().split('T')[0],
        notes: formData.notes || ''
      };
      
      // Save calculation via IPC
      const savedCalculation = await window.electronAPI.saveTaxCalculation(calculationToSave);
      
      if (savedCalculation.error) {
        throw new Error(savedCalculation.error);
      }
      
      alert('Calculation saved successfully!');
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert(`Error saving calculation: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form and results
  const resetForm = () => {
    setFormData({
      revenue: '',
      expenses: '',
      otherDeductions: '',
      periodType: 'annual',
      periodStart: '',
      periodEnd: '',
      notes: ''
    });
    setCalculationResult(null);
  };

  // Format currency (MAD)
  const formatCurrency = (amount) => {
    return typeof amount === 'number'
      ? amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })
      : 'N/A';
  };

  // Format percentage
  const formatPercentage = (value) => {
    return typeof value === 'number'
      ? `${value.toFixed(2)}%`
      : 'N/A';
  };

  return (
    <div className="tax-calculator-container">
      <h1>Tax Calculator</h1>
      <p className="subtitle">Calculate Corporate Income Tax based on Finance Law 2025</p>
      
      <div className="card">
        <h2 className="card-title">Financial Data</h2>
        <form onSubmit={calculateTax}>
          <div className="form-group">
            <label htmlFor="revenue" className="form-label">Total Revenue (MAD)</label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              className="form-control"
              value={formData.revenue}
              onChange={handleInputChange}
              min="0"
              step="1000"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="expenses" className="form-label">Total Expenses (MAD)</label>
            <input
              type="number"
              id="expenses"
              name="expenses"
              className="form-control"
              value={formData.expenses}
              onChange={handleInputChange}
              min="0"
              step="1000"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="otherDeductions" className="form-label">Other Deductions (MAD)</label>
            <input
              type="number"
              id="otherDeductions"
              name="otherDeductions"
              className="form-control"
              value={formData.otherDeductions}
              onChange={handleInputChange}
              min="0"
              step="1000"
            />
            <small className="form-help">Enter additional deductions allowed under Moroccan tax law.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="periodType" className="form-label">Period Type</label>
            <select
              id="periodType"
              name="periodType"
              className="form-control"
              value={formData.periodType}
              onChange={handleInputChange}
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {(formData.periodType === 'custom' || formData.periodType === 'quarterly') && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="periodStart" className="form-label">Start Date</label>
                <input
                  type="date"
                  id="periodStart"
                  name="periodStart"
                  className="form-control"
                  value={formData.periodStart}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="periodEnd" className="form-label">End Date</label>
                <input
                  type="date"
                  id="periodEnd"
                  name="periodEnd"
                  className="form-control"
                  value={formData.periodEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Tax'}
            </button>
            
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {calculationResult && (
        <div className="card calculation-result">
          <h2 className="card-title">Tax Calculation Results</h2>
          
          <div className="result-summary">
            <div className="result-item">
              <div className="result-label">Taxable Income</div>
              <div className="result-value">{formatCurrency(calculationResult.taxableIncome)}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Total Tax</div>
              <div className="result-value">{formatCurrency(calculationResult.finalTax)}</div>
            </div>
            
            <div className="result-item">
              <div className="result-label">Effective Tax Rate</div>
              <div className="result-value">{formatPercentage(calculationResult.effectiveTaxRate)}</div>
            </div>
          </div>
          
          <h3>Tax Breakdown</h3>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Income Bracket</th>
                  <th>Rate</th>
                  <th>Amount in Bracket</th>
                  <th>Tax for Bracket</th>
                </tr>
              </thead>
              <tbody>
                {calculationResult.bracketDetails?.map((bracket, index) => (
                  <tr key={index}>
                    <td>
                      {formatCurrency(bracket.from)} - {bracket.to ? formatCurrency(bracket.to) : 'Above'}
                    </td>
                    <td>{formatPercentage(bracket.rate)}</td>
                    <td>{formatCurrency(bracket.amount)}</td>
                    <td>{formatCurrency(bracket.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {calculationResult.isMinimumApplied && (
            <div className="alert">
              <p>
                <strong>Note:</strong> The minimum contribution of {formatPercentage(calculationResult.minimumContribution / calculationResult.revenue * 100)} of turnover 
                ({formatCurrency(calculationResult.minimumContribution)}) applies as it exceeds the calculated tax amount.
              </p>
            </div>
          )}
          
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={saveCalculation}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Calculation'}
            </button>
            
            <button
              className="btn btn-outline"
              onClick={() => window.location.hash = '#/reports'}
            >
              View All Calculations
            </button>
          </div>
        </div>
      )}
      
      <div className="card info-card">
        <h2 className="card-title">Finance Law 2025 Tax Information</h2>
        <p>This calculator implements the Corporate Income Tax rules based on the Moroccan Finance Law 2025 (Law No. 60-24).</p>
        
        <h3>Key Features:</h3>
        <ul>
          <li>Progressive tax rates from 17.5% to 34%</li>
          <li>Minimum contribution calculation (0.25% of turnover)</li>
          <li>Support for various deductions and allowances</li>
        </ul>
        
        <div className="disclaimer">
          <p>
            <strong>Disclaimer:</strong> This calculator provides an estimate based on the information provided. 
            Actual tax liability may vary. Always consult with a professional accountant for official tax advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TaxCalculator;
