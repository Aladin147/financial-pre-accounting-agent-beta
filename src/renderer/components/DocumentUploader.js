import React, { useState, useRef, useCallback } from 'react';

/**
 * Enhanced document uploader component with drag-and-drop support
 * and multiple file upload capabilities
 */
const DocumentUploader = ({ onUpload, onCancel, targetDirectory, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  /**
   * Handle drag events 
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  /**
   * Process the selected files
   */
  const handleFiles = (files) => {
    const fileList = Array.from(files);
    
    // Filter for allowed file types
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 'image/jpg', 'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    const validFiles = fileList.filter(file => 
      allowedTypes.includes(file.type) || 
      file.name.match(/\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx|csv)$/i)
    );
    
    if (validFiles.length !== fileList.length) {
      alert(`${fileList.length - validFiles.length} files were not added because they are not supported. Supported formats: PDF, Images, Word, Excel, CSV`);
    }
    
    setSelectedFiles(validFiles);
  };

  /**
   * Handle button click to open file selector
   */
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  /**
   * Handle upload button click
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Initialize progress tracking
    const initialProgress = {};
    selectedFiles.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);
    
    // Call the onUpload callback with the files
    onUpload(selectedFiles, targetDirectory, (progress) => {
      setUploadProgress(prev => ({
        ...prev,
        [progress.filename]: progress.percent
      }));
    });
  };

  /**
   * Remove a file from the selection
   */
  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  /**
   * Render a preview for each selected file
   */
  const renderFilePreview = (file, index) => {
    const progress = uploadProgress[file.name] || 0;
    
    return (
      <div key={index} className="selected-file">
        <div className="file-preview">
          <div className="file-icon">{getFileIcon(file.name)}</div>
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatSize(file.size)}</div>
          </div>
        </div>
        
        {progress > 0 && progress < 100 && (
          <div className="file-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        <button 
          className="btn-icon remove-file" 
          onClick={() => removeFile(index)}
          disabled={isUploading}
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
    );
  };

  /**
   * Get an icon for a file based on its extension
   */
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <i className="fa-solid fa-file-pdf"></i>;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <i className="fa-solid fa-file-image"></i>;
      case 'doc':
      case 'docx':
        return <i className="fa-solid fa-file-word"></i>;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <i className="fa-solid fa-file-excel"></i>;
      default:
        return <i className="fa-solid fa-file"></i>;
    }
  };

  /**
   * Format file size in a human-readable format
   */
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="document-uploader">
      <div 
        className={`dropzone ${dragActive ? 'active' : ''} ${selectedFiles.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFiles.length === 0 ? (
          <div className="dropzone-content">
            <div className="dropzone-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h3>Drag & Drop Files</h3>
            <p>or click to select files from your computer</p>
            <button 
              className="btn btn-outline" 
              onClick={openFileSelector}
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="selected-files">
            <h3 className="files-heading">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="file-list">
              {selectedFiles.map((file, index) => renderFilePreview(file, index))}
            </div>
            
            <div className="file-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setSelectedFiles([])}
                disabled={isUploading}
              >
                <i className="fa-solid fa-xmark"></i>
                Clear All
              </button>
              <button 
                className="btn btn-outline" 
                onClick={openFileSelector}
                disabled={isUploading}
              >
                <i className="fa-solid fa-plus"></i>
                Add More Files
              </button>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="file-input"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv"
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="upload-actions">
        <button 
          className="btn btn-outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} Files` : ''}`}
        </button>
      </div>
      
      <style jsx>{`
        .document-uploader {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .dropzone {
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 2rem;
          text-align: center;
          transition: all var(--transition-normal);
          background-color: var(--bg-card);
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        
        .dropzone.active {
          border-color: var(--primary);
          background-color: rgba(212, 180, 131, 0.05);
          transform: scale(1.01);
        }
        
        .dropzone.has-files {
          cursor: default;
          padding: 1.5rem;
        }
        
        .dropzone-icon {
          font-size: 3rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }
        
        .dropzone h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .dropzone p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }
        
        .selected-files {
          width: 100%;
        }
        
        .files-heading {
          text-align: left;
          margin-bottom: 1rem;
        }
        
        .file-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }
        
        .selected-file {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
          background-color: var(--bg-card-hover);
          margin-bottom: 0.5rem;
          position: relative;
        }
        
        .file-preview {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .file-icon {
          font-size: 1.5rem;
          color: var(--primary);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }
        
        .file-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex: 1;
        }
        
        .file-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.875rem;
        }
        
        .file-size {
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }
        
        .file-progress {
          height: 4px;
          width: 100%;
          background-color: var(--bg-dark);
          border-radius: 2px;
          overflow: hidden;
          position: absolute;
          bottom: 0;
          left: 0;
        }
        
        .progress-bar {
          height: 100%;
          background-color: var(--primary);
          transition: width 0.2s ease;
        }
        
        .progress-text {
          position: absolute;
          right: 8px;
          top: -16px;
          font-size: 0.75rem;
          color: var(--primary);
        }
        
        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .btn-icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--error);
        }
        
        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .file-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .upload-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default DocumentUploader;
