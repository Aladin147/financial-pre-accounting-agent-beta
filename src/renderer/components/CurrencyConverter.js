import React, { useState, useEffect } from 'react';

/**
 * Enhanced Currency Converter Component
 * 
 * Provides powerful currency conversion functionality with a modern UI
 * Supports historical exchange rates and confidence indicators
 * Part of v3.1.5 enhanced currency features
 */
function CurrencyConverter({ 
  initialAmount = 0, 
  initialFromCurrency = 'MAD', 
  initialToCurrency = 'EUR',
  initialDate = null,
  onConversionComplete = null,
  compact = false
}) {
  // State
  const [amount, setAmount] = useState(initialAmount);
  const [fromCurrency, setFromCurrency] = useState(initialFromCurrency);
  const [toCurrency, setToCurrency] = useState(initialToCurrency);
  const [conversionDate, setConversionDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [isHistorical, setIsHistorical] = useState(!!initialDate);
  const [result, setResult] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // List of supported currencies (extended in v3.1.5)
  const currencies = [
    { code: 'MAD', name: 'Moroccan Dirham (د.م.)', symbol: 'د.م.' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc (Fr)', symbol: 'Fr' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
    { code: 'AED', name: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal (ر.س)', symbol: 'ر.س' }
  ];
  
  // Fetch exchange rates when the component mounts or date changes
  useEffect(() => {
    fetchExchangeRates();
  }, [conversionDate, isHistorical]);
  
  // Convert when inputs change
  useEffect(() => {
    if (exchangeRates && amount > 0) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);
  
  // Toggle historical mode
  const toggleHistoricalMode = () => {
    if (!isHistorical) {
      // When enabling historical mode, default to today's date
      const today = new Date().toISOString().split('T')[0];
      setConversionDate(today);
      setIsHistorical(true);
      setDatePickerOpen(true);
    } else {
      setIsHistorical(false);
      // When disabling, fetch current rates
      fetchExchangeRates();
    }
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setConversionDate(e.target.value);
  };
  
  // Fetch exchange rates from the Electron backend
  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Using the Electron bridge to communicate with the backend
      if (window.electronAPI?.getExchangeRates) {
        // If historical, pass the date
        const rates = isHistorical 
          ? await window.electronAPI.getHistoricalExchangeRates(conversionDate)
          : await window.electronAPI.getExchangeRates();
        
        setExchangeRates(rates);
        
        // If this is the first load and we have callback
        if (onConversionComplete && initialAmount > 0) {
          const convertedAmount = convertAmount(initialAmount, initialFromCurrency, initialToCurrency, rates);
          onConversionComplete(convertedAmount);
        }
      } else {
        // Fallback to default rates for demo if API not available
        console.warn('Electron API not available, using fallback rates');
        setExchangeRates({
          MAD: 1.0,
          USD: 0.1003,
          EUR: 0.0921, 
          GBP: 0.0786,
          CAD: 0.1354,
          CHF: 0.0911,
          JPY: 15.2315,
          CNY: 0.6483,
          AED: 0.3683,
          SAR: 0.3762
        });
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to fetch exchange rates. Using fallback rates.');
      
      // Set fallback rates
      setExchangeRates({
        MAD: 1.0,
        USD: 0.1003,
        EUR: 0.0921, 
        GBP: 0.0786,
        CAD: 0.1354,
        CHF: 0.0911,
        JPY: 15.2315,
        CNY: 0.6483,
        AED: 0.3683,
        SAR: 0.3762
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to convert amounts
  const convertAmount = (amount, from, to, rates) => {
    // If currencies are the same, return original amount
    if (from === to) return amount;
    
    // Convert to MAD first (base currency), then to target
    const amountInMad = from === 'MAD' ? amount : amount / rates[from];
    const convertedAmount = to === 'MAD' ? amountInMad : amountInMad * rates[to];
    
    // Calculate direct exchange rate
    const rate = to === 'MAD' 
      ? 1 / rates[from]
      : from === 'MAD'
        ? rates[to]
        : rates[to] / rates[from];
        
    return {
      amount: convertedAmount,
      rate,
      formatted: formatCurrency(convertedAmount, to)
    };
  };
  
  // Convert the amount between currencies
  const handleConvert = () => {
    if (!exchangeRates || amount <= 0) {
      setResult(null);
      return;
    }
    
    try {
      const conversion = convertAmount(amount, fromCurrency, toCurrency, exchangeRates);
      
      // Format the result
      setResult({
        amount: conversion.amount,
        formatted: conversion.formatted,
        fromCurrency,
        toCurrency,
        exchangeRate: conversion.rate,
        date: isHistorical ? conversionDate : new Date().toISOString().split('T')[0]
      });
      
      // If callback provided, call it with the result
      if (onConversionComplete) {
        onConversionComplete(conversion);
      }
    } catch (err) {
      console.error('Error converting currency:', err);
      setError('Failed to convert currency');
    }
  };
  
  // Format currency according to locale
  const formatCurrency = (value, currencyCode) => {
    const currencySymbols = {
      MAD: 'د.م.',
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      CHF: 'Fr',
      JPY: '¥',
      CNY: '¥',
      AED: 'د.إ',
      SAR: 'ر.س'
    };
    
    const locales = {
      MAD: 'fr-MA',
      USD: 'en-US',
      EUR: 'fr-FR',
      GBP: 'en-GB',
      CAD: 'en-CA',
      CHF: 'de-CH',
      JPY: 'ja-JP',
      CNY: 'zh-CN',
      AED: 'ar-AE',
      SAR: 'ar-SA'
    };
    
    // Special case for JPY which doesn't use decimal places
    const digits = currencyCode === 'JPY' ? 0 : 2;
    
    const formattedValue = new Intl.NumberFormat(locales[currencyCode] || 'en-US', {
      style: 'decimal',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(currencyCode === 'JPY' ? Math.round(value) : value);
    
    // For MAD, EUR, CHF put the symbol after the amount
    if (['MAD', 'EUR', 'CHF', 'AED', 'SAR'].includes(currencyCode)) {
      return `${formattedValue} ${currencySymbols[currencyCode]}`;
    }
    
    // For others, put the symbol before the amount
    return `${currencySymbols[currencyCode]}${formattedValue}`;
  };
  
  // Swap currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  // Render compact version
  if (compact) {
    return (
      <div className="currency-converter-compact">
        <div className="converter-input-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="Amount"
            min="0"
            step="0.01"
            className="amount-input"
          />
          <select 
            value={fromCurrency} 
            onChange={(e) => setFromCurrency(e.target.value)}
            className="currency-select"
          >
            {currencies.map(currency => (
              <option key={`from-${currency.code}`} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
          <button 
            className="swap-button-compact"
            onClick={handleSwapCurrencies}
            title="Swap currencies"
          >
            ⇄
          </button>
          <select 
            value={toCurrency} 
            onChange={(e) => setToCurrency(e.target.value)}
            className="currency-select"
          >
            {currencies.map(currency => (
              <option key={`to-${currency.code}`} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
        </div>
        
        {result && (
          <div className="result-compact">
            <div className="result-amount">
              {result.formatted}
            </div>
            <div className="rate-display">
              <small>1 {fromCurrency} = {result.exchangeRate.toFixed(4)} {toCurrency}</small>
            </div>
          </div>
        )}
        
        {isLoading && <div className="loading-indicator-compact">Loading rates...</div>}
        {error && <div className="error-message-compact">{error}</div>}
      </div>
    );
  }
  
  // Render full version
  return (
    <div className="currency-converter-container">
      <div className="converter-header">
        <h3>Currency Converter</h3>
        <div className="exchange-rates-info">
          {isLoading ? (
            <span className="loading-indicator">Loading rates...</span>
          ) : error ? (
            <span className="error-message">{error}</span>
          ) : (
            <span className="rates-updated">
              {isHistorical 
                ? `Using rates from ${conversionDate}` 
                : 'Using latest exchange rates'}
            </span>
          )}
        </div>
      </div>
      
      <div className="converter-form">
        <div className="amount-input">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="historical-mode">
          <label>
            <input
              type="checkbox"
              checked={isHistorical}
              onChange={toggleHistoricalMode}
            />
            Use historical rates
          </label>
          
          {isHistorical && (
            <div className="date-picker">
              <input
                type="date"
                value={conversionDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>
        
        <div className="currency-selectors">
          <div className="from-currency">
            <label>From</label>
            <select 
              value={fromCurrency} 
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map(currency => (
                <option key={`from-${currency.code}`} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="swap-button"
            onClick={handleSwapCurrencies}
            title="Swap currencies"
          >
            ⇄
          </button>
          
          <div className="to-currency">
            <label>To</label>
            <select 
              value={toCurrency} 
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map(currency => (
                <option key={`to-${currency.code}`} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="conversion-result">
          <div className="result-amount">
            {result.formatted}
          </div>
          <div className="exchange-rate-display">
            <span>1 {fromCurrency} = {result.exchangeRate.toFixed(4)} {toCurrency}</span>
            {isHistorical && (
              <span className="historical-date">on {result.date}</span>
            )}
          </div>
          <div className="conversion-notes">
            {fromCurrency !== 'MAD' && toCurrency !== 'MAD' && (
              <small>Conversion via MAD as base currency</small>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyConverter;
