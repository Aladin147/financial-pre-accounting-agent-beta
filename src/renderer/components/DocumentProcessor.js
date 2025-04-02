import React, { useState, useEffect } from 'react';

/**
 * Document processor component
 * 
 * Provides UI to process documents for data extraction
 */
const DocumentProcessor = ({ documents, activeTab, onProcessComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    failedCount: 0
  });
  const [results, setResults] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Reset selected documents when active tab changes
  useEffect(() => {
    setSelectedDocuments([]);
  }, [activeTab]);

  // Handle document selection
  const toggleDocumentSelection = (doc) => {
    if (selectedDocuments.find(d => d.path === doc.path)) {
      setSelectedDocuments(prev => prev.filter(d => d.path !== doc.path));
    } else {
      setSelectedDocuments(prev => [...prev, doc]);
    }
  };

  // Select all documents in the current tab
  const selectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments([...documents]);
    }
  };

  // Start processing the selected documents
  const startProcessing = async () => {
    // Check if any documents are selected
    if (selectedDocuments.length === 0) {
      return;
    }

    setProcessing(true);
    setProgress({
      completed: 0,
      total: selectedDocuments.length,
      percentage: 0,
      failedCount: 0
    });
    setResults(null);

    try {
      // Get document paths
      const filePaths = selectedDocuments.map(doc => doc.path);

      // Process the documents in batch
      const processingResults = await window.electronAPI.processBatchDocuments(
        filePaths,
        (progressUpdate) => {
          setProgress({
            completed: progressUpdate.completed || 0,
            total: progressUpdate.total || selectedDocuments.length,
            percentage: progressUpdate.percentage || 0,
            failedCount: progressUpdate.failed || 0
          });
        }
      );

      // Set results
      setResults(processingResults);

      // Call the completion handler if provided
      if (onProcessComplete && typeof onProcessComplete === 'function') {
        onProcessComplete(processingResults);
      }
    } catch (error) {
      console.error('Error processing documents:', error);
      setResults({
        success: false,
        error: error.message,
        processed: 0,
        failed: selectedDocuments.length,
        errors: [{ message: error.message }]
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="document-processor">
      <div className="processor-header">
        <h3>Document Processing</h3>
        <button
          className="help-button"
          onClick={() => setShowHelp(!showHelp)}
          title="Show information about document processing"
        >
          <i className="fa-solid fa-circle-info"></i>
        </button>
      </div>

      {showHelp && (
        <div className="help-panel">
          <div className="help-content">
            <h4>About Document Processing</h4>
            <p>
              Document processing extracts financial data from your invoices and receipts
              using OCR technology. This helps organize your financial records and simplifies
              tax calculations.
            </p>
            <h4>Processing Steps:</h4>
            <ol>
              <li>OCR text extraction from documents</li>
              <li>Financial data recognition (amounts, dates, vendors)</li>
              <li>Document classification (incoming/outgoing)</li>
              <li>Currency detection and conversion</li>
            </ol>
            <p className="help-note">
              <strong>Note:</strong> Processing may take several seconds per document
              depending on size and complexity.
            </p>
          </div>
          <button 
            className="help-close-button"
            onClick={() => setShowHelp(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="selection-controls">
        <button
          className="btn btn-sm btn-outline"
          onClick={selectAll}
        >
          {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
        </button>
        <div className="selection-info">
          <span className="selection-count">
            {selectedDocuments.length} of {documents.length} selected
          </span>
        </div>
      </div>

      <div className="document-grid">
        {documents.map((doc, index) => {
          const isSelected = selectedDocuments.some(d => d.path === doc.path);
          const isProcessed = doc.hasOwnProperty('extractedData') || doc.confidence;
          
          return (
            <div
              key={index}
              className={`document-item ${isSelected ? 'selected' : ''} ${isProcessed ? 'processed' : ''}`}
              onClick={() => toggleDocumentSelection(doc)}
            >
              <div className="document-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="document-info">
                <div className="document-name">{doc.name}</div>
                <div className="document-status">
                  {isProcessed ? (
                    <span className="status-processed">
                      <i className="fa-solid fa-check-circle"></i>
                      {doc.confidence ? ` ${Math.round(doc.confidence * 100)}% confidence` : ' Processed'}
                    </span>
                  ) : (
                    <span className="status-unprocessed">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      Not processed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {processing && (
        <div className="processing-status">
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <div className="progress-info">
            Processing document {progress.completed} of {progress.total} ({progress.percentage}%)
            {progress.failedCount > 0 && ` • ${progress.failedCount} failed`}
          </div>
        </div>
      )}

      {results && (
        <div className={`processing-results ${results.success ? 'success' : 'error'}`}>
          <div className="results-header">
            <i className={`fa-solid ${results.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {results.success 
              ? `Successfully processed ${results.processed} documents`
              : `Processing completed with issues`
            }
          </div>
          
          {results.failed > 0 && (
            <div className="error-summary">
              <span className="error-count">{results.failed} documents failed</span>
              {results.errors && results.errors.length > 0 && (
                <ul className="error-list">
                  {results.errors.slice(0, 3).map((error, i) => (
                    <li key={i}>
                      {error.filePath ? (
                        <strong>{error.filePath.split('/').pop().split('\\').pop()}:</strong>
                      ) : null} {error.error || error.message}
                    </li>
                  ))}
                  {results.errors.length > 3 && (
                    <li>... and {results.errors.length - 3} more errors</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="processor-actions">
        <button
          className="btn btn-primary"
          onClick={startProcessing}
          disabled={processing || selectedDocuments.length === 0}
        >
          {processing ? 'Processing...' : 'Process Selected Documents'}
        </button>
      </div>

      <style jsx>{`
        .document-processor {
          margin-top: 24px;
          padding: 20px;
          background-color: var(--bg-card);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }
        
        .processor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .processor-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .help-button {
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 16px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .help-button:hover {
          color: var(--primary);
        }
        
        .help-panel {
          background-color: var(--bg-card-hover);
          border-radius: var(--border-radius-md);
          padding: 16px;
          margin-bottom: 20px;
          position: relative;
          border-left: 3px solid var(--primary);
        }
        
        .help-content {
          margin-bottom: 10px;
        }
        
        .help-content h4 {
          font-size: 15px;
          margin-top: 0;
          margin-bottom: 8px;
          color: var(--primary);
        }
        
        .help-content p {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.4;
          color: var(--text-secondary);
        }
        
        .help-content ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        
        .help-content li {
          margin-bottom: 4px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .help-note {
          background-color: rgba(212, 180, 131, 0.1);
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 13px;
        }
        
        .help-close-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 5px 10px;
          font-size: 13px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-fast);
        }
        
        .help-close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .selection-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .selection-info {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .selection-count {
          font-weight: 500;
        }
        
        .document-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 8px;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: var(--border-radius-sm);
          background-color: var(--bg-card-hover);
          cursor: pointer;
          transition: var(--transition-fast);
          border: 1px solid transparent;
        }
        
        .document-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        
        .document-item.selected {
          border-color: var(--primary);
          background-color: rgba(212, 180, 131, 0.1);
        }
        
        .document-item.processed {
          border-left: 3px solid var(--success);
        }
        
        .document-checkbox {
          margin-right: 10px;
        }
        
        .document-checkbox input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }
        
        .document-info {
          flex: 1;
          overflow: hidden;
        }
        
        .document-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .document-status {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        
        .status-processed {
          color: var(--success);
        }
        
        .status-unprocessed {
          color: var(--warning);
        }
        
        .processing-status {
          margin-bottom: 20px;
        }
        
        .progress-bar-container {
          height: 6px;
          background-color: var(--bg-dark);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-bar {
          height: 100%;
          background-color: var(--primary);
          transition: width 0.3s ease;
        }
        
        .progress-info {
          font-size: 14px;
          color: var(--text-secondary);
          text-align: center;
        }
        
        .processing-results {
          padding: 16px;
          border-radius: var(--border-radius-md);
          margin-bottom: 20px;
        }
        
        .processing-results.success {
          background-color: rgba(76, 217, 123, 0.1);
          border-left: 3px solid var(--success);
        }
        
        .processing-results.error {
          background-color: rgba(255, 97, 102, 0.1);
          border-left: 3px solid var(--error);
        }
        
        .results-header {
          display: flex;
          align-items: center;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .results-header i {
          margin-right: 8px;
        }
        
        .processing-results.success .results-header {
          color: var(--success);
        }
        
        .processing-results.error .results-header {
          color: var(--error);
        }
        
        .error-summary {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .error-count {
          font-weight: 500;
          color: var(--error);
        }
        
        .error-list {
          margin-top: 8px;
          padding-left: 20px;
          font-size: 13px;
        }
        
        .error-list li {
          margin-bottom: 6px;
        }
        
        .processor-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default DocumentProcessor;
