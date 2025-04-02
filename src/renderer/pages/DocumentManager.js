import React, { useState, useEffect } from 'react';
import CurrencyConverter from '../components/CurrencyConverter';
import DocumentUploader from '../components/DocumentUploader';
import DocumentProcessor from '../components/DocumentProcessor';

/**
 * Document Manager page component
 * 
 * Handles document import, organization, and management
 */
function DocumentManager() {
  const [documents, setDocuments] = useState({
    incoming: [],
    outgoing: [],
  });
  const [activeTab, setActiveTab] = useState('incoming');
  const [isLoading, setIsLoading] = useState(true);
  const [importingDocument, setImportingDocument] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    inProgress: false,
    completed: 0,
    total: 0,
    results: null
  });

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Function to load documents
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Get document paths
      const docPaths = await window.electronAPI.getDocumentPaths();
      console.log('Document paths:', docPaths);
      
      // Load documents for each category
      const incomingDocs = await window.electronAPI.listDocuments('incoming');
      const outgoingDocs = await window.electronAPI.listDocuments('outgoing');
      
      setDocuments({
        incoming: incomingDocs || [],
        outgoing: outgoingDocs || [],
      });
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document import using file dialog
  const handleImportDocument = async () => {
    setImportingDocument(true);
    try {
      const result = await window.electronAPI.importDocument(activeTab);
      
      if (result.success) {
        console.log('Document imported successfully:', result.path);
        // Reload documents to show the newly imported one
        await loadDocuments();
      } else {
        console.error('Failed to import document:', result.message);
        alert(`Failed to import document: ${result.message}`);
      }
    } catch (error) {
      console.error('Error importing document:', error);
      alert('An error occurred while importing the document.');
    } finally {
      setImportingDocument(false);
    }
  };
  
  // Open the upload modal
  const openUploadModal = () => {
    setShowUploadModal(true);
  };
  
  // Close the upload modal
  const closeUploadModal = () => {
    // Only close if not actively uploading
    if (!uploadStatus.inProgress) {
      setShowUploadModal(false);
      setUploadStatus({
        inProgress: false,
        completed: 0,
        total: 0,
        results: null
      });
    }
  };
  
  // Handle file uploads from the document uploader component
  const handleFileUpload = async (files, targetDir, progressCallback) => {
    setUploadStatus({
      inProgress: true,
      completed: 0,
      total: files.length,
      results: null
    });
    
    try {
      // Use the uploadFiles API function to upload the files
      const result = await window.electronAPI.uploadFiles(files, activeTab, (progress) => {
        // Update progress state
        setUploadStatus(prev => ({
          ...prev,
          completed: progress.current || prev.completed
        }));
        
        // Pass progress to the callback if provided
        if (progressCallback) {
          progressCallback(progress);
        }
      });
      
      // Update status with results
      setUploadStatus(prev => ({
        ...prev,
        inProgress: false,
        results: result
      }));
      
      // Reload documents to show the newly imported ones
      await loadDocuments();
      
      // Show summary after completion
      if (result.success) {
        console.log(`Successfully uploaded ${result.successfulFiles} files`);
        
        // Auto-close the modal after 2 seconds if all files were successful
        if (result.successfulFiles === result.totalFiles) {
          setTimeout(() => {
            closeUploadModal();
          }, 2000);
        }
      } else {
        console.error('Failed to upload files:', result.message);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus(prev => ({
        ...prev,
        inProgress: false,
        results: { success: false, message: error.message }
      }));
    }
  };

  // Render document list based on active tab
  const renderDocuments = () => {
    const activeDocuments = documents[activeTab] || [];
    
    if (activeDocuments.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No documents yet</h3>
          <p>Import documents to start organizing your financial records.</p>
          <button 
            className="btn btn-primary" 
            onClick={handleImportDocument}
            disabled={importingDocument}
          >
            {importingDocument ? 'Importing...' : 'Import Document'}
          </button>
        </div>
      );
    }
    
    return (
      <div className="document-grid">
        {activeDocuments.map((doc, index) => (
          <div key={index} className="document-card" onClick={() => handleDocumentClick(doc)}>
            <div className="document-icon">
              {getDocumentIcon(doc.name)}
            </div>
            <div className="document-name">{doc.name}</div>
            <div className="document-meta">
              {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
            </div>
            {doc.currencies && doc.currencies.length > 0 && (
              <div className="currency-info-section">
                <div className="currency-info-title">
                  Detected Currencies:
                </div>
                <div className="currency-list">
                  {doc.currencies.map((currency, i) => (
                    <span 
                      key={i} 
                      className={`document-currency-tag ${currency.code !== 'MAD' ? 'document-foreign-currency' : ''}`}
                    >
                      {currency.code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get icon based on file extension
  const getDocumentIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return '📕';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return '📊';
      case 'doc':
      case 'docx':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📋';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading documents...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Handle document click
  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setShowConverter(doc.hasForeignCurrency || false);
  };

  return (
    <div className="document-manager-container">
      <div className="page-header">
        <h1>Document Manager</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={openUploadModal}
            disabled={importingDocument}
          >
            <i className="fa-solid fa-upload"></i>
            Upload Files
          </button>
          <button 
            className="btn btn-outline" 
            onClick={handleImportDocument}
            disabled={importingDocument}
          >
            <i className="fa-solid fa-folder-open"></i>
            Select Files
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowConverter(!showConverter)}
          >
            <i className="fa-solid fa-money-bill-transfer"></i>
            Currency Converter
          </button>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Upload Documents</h2>
              <button 
                className="close-button"
                onClick={closeUploadModal}
                disabled={uploadStatus.inProgress}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {uploadStatus.results ? (
                <div className="upload-results">
                  <div className={`results-icon ${uploadStatus.results.success ? 'success' : 'error'}`}>
                    <i className={`fa-solid ${uploadStatus.results.success ? 'fa-check' : 'fa-exclamation-triangle'}`}></i>
                  </div>
                  
                  <h3>Upload Summary</h3>
                  
                  <div className="results-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Files:</span>
                      <span className="stat-value">{uploadStatus.results.totalFiles || 0}</span>
                    </div>
                    <div className="stat-item success">
                      <span className="stat-label">Successful:</span>
                      <span className="stat-value">{uploadStatus.results.successfulFiles || 0}</span>
                    </div>
                    <div className="stat-item error">
                      <span className="stat-label">Failed:</span>
                      <span className="stat-value">{uploadStatus.results.failedFiles || 0}</span>
                    </div>
                  </div>
                  
                  {uploadStatus.results.errors && uploadStatus.results.errors.length > 0 && (
                    <div className="error-list">
                      <h4>Errors:</h4>
                      <ul>
                        {uploadStatus.results.errors.map((error, index) => (
                          <li key={index}>
                            <strong>{error.filename}:</strong> {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="results-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={closeUploadModal}
                    >
                      Close
                    </button>
                    {uploadStatus.results.errors && uploadStatus.results.errors.length > 0 && (
                      <button 
                        className="btn btn-outline"
                        onClick={() => setUploadStatus({
                          inProgress: false,
                          completed: 0,
                          total: 0,
                          results: null
                        })}
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <DocumentUploader
                  onUpload={handleFileUpload}
                  onCancel={closeUploadModal}
                  targetDirectory={activeTab}
                  isUploading={uploadStatus.inProgress}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showConverter && (
        <div className="converter-section">
          <CurrencyConverter 
            initialAmount={selectedDocument?.amount || 0}
            initialFromCurrency={selectedDocument?.primaryCurrency || 'MAD'}
            initialToCurrency={selectedDocument?.primaryCurrency === 'MAD' ? 'EUR' : 'MAD'}
          />
        </div>
      )}
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Invoices ({documents.incoming.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing Invoices ({documents.outgoing.length})
        </button>
      </div>
      
      <div className="documents-container">
        {renderDocuments()}
      </div>
      
      {documents[activeTab] && documents[activeTab].length > 0 && (
        <DocumentProcessor 
          documents={documents[activeTab]}
          activeTab={activeTab}
          onProcessComplete={async (results) => {
            // Reload documents to update with processing results
            await loadDocuments();
          }}
        />
      )}
      
      <div className="help-text">
        <p>
          <strong>Note:</strong> Document organization is important for accurate tax calculations and reporting.
          Place incoming invoices (expenses) and outgoing invoices (revenue) in their respective categories.
        </p>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: var(--bg-card);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: modal-appear 0.3s ease forwards;
        }
        
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 16px;
          color: var(--text-tertiary);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }
        
        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .upload-results {
          text-align: center;
          padding: 24px 0;
        }
        
        .results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .results-icon.success {
          background-color: rgba(76, 217, 123, 0.15);
          color: var(--success);
        }
        
        .results-icon.error {
          background-color: rgba(255, 97, 102, 0.15);
          color: var(--error);
        }
        
        .results-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin: 24px 0;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
        }
        
        .stat-item.success .stat-value {
          color: var(--success);
        }
        
        .stat-item.error .stat-value {
          color: var(--error);
        }
        
        .error-list {
          background-color: var(--bg-card-hover);
          border-radius: var(--border-radius-md);
          padding: 16px;
          margin: 20px auto;
          max-width: 600px;
          text-align: left;
        }
        
        .error-list h4 {
          color: var(--error);
          margin-top: 0;
          margin-bottom: 8px;
        }
        
        .error-list ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .error-list li {
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .results-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}

export default DocumentManager;
