import React, { useState, useEffect } from 'react';

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

  // Handle document import
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
          <div key={index} className="document-card">
            <div className="document-icon">
              {getDocumentIcon(doc.name)}
            </div>
            <div className="document-name">{doc.name}</div>
            <div className="document-meta">
              {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
            </div>
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

  return (
    <div className="document-manager-container">
      <div className="page-header">
        <h1>Document Manager</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleImportDocument}
          disabled={importingDocument}
        >
          {importingDocument ? 'Importing...' : 'Import Document'}
        </button>
      </div>
      
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
      
      <div className="help-text">
        <p>
          <strong>Note:</strong> Document organization is important for accurate tax calculations and reporting.
          Place incoming invoices (expenses) and outgoing invoices (revenue) in their respective categories.
        </p>
      </div>
    </div>
  );
}

export default DocumentManager;
