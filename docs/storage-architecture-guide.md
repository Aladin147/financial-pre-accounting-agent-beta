# Storage Architecture Guide

## Overview

The Financial Pre-Accounting Agent uses a robust, future-proof storage architecture designed to support local data storage with a path to remote and cloud-based synchronization. This document describes the core design, implementation details, and integration patterns for the storage system.

## Key Design Principles

- **Repository Pattern**: Abstract storage details from business logic
- **Interface-Based Design**: Enable multiple storage implementations
- **Service-Oriented Architecture**: Integrate with existing service framework
- **Progressive Enhancement**: Support local storage first, with expansion paths
- **Data Integrity**: Ensure consistency and reliability of stored data
- **Performance Optimization**: Efficient data access and retrieval

## Core Components

### 1. Storage Interface

The `IStorageRepository` interface defines a standard contract for all storage implementations:

```javascript
/**
 * Base interface for all storage repositories
 * @interface
 */
class IStorageRepository {
  async save(entityType, entity, options = {}) { /* ... */ }
  async getById(entityType, id, options = {}) { /* ... */ }
  async query(entityType, criteria = {}, options = {}) { /* ... */ }
  async delete(entityType, id, options = {}) { /* ... */ }
  async count(entityType, criteria = {}) { /* ... */ }
  async bulkSave(entityType, entities, options = {}) { /* ... */ }
}
```

### 2. FileSystemRepository Implementation

A local file system implementation that stores entities as JSON files in a structured directory hierarchy:

```javascript
/**
 * Implementation of storage repository using the local file system
 */
class FileSystemRepository extends IStorageRepository {
  constructor(options = {}) {
    super();
    this.basePath = options.basePath || path.join(process.cwd(), 'data');
    this.logger = options.logger || console;
    this.indexCache = new Map(); // In-memory cache of indexes
  }
  
  // Implementation of interface methods
}
```

### 3. StorageService

The `StorageService` integrates with our service architecture and exposes a clean API to other services:

```javascript
/**
 * Service for data storage and retrieval
 */
class StorageService extends IService {
  constructor(dependencies = {}) {
    super();
    this.logger = dependencies.logger;
    this.settingsService = dependencies.settingsService;
    this.repository = null;
  }
  
  // Service lifecycle methods
  
  // Public API methods
  async saveEntity(entityType, entity, options = {}) { /* ... */ }
  async getEntityById(entityType, id, options = {}) { /* ... */ }
  async queryEntities(entityType, criteria, options = {}) { /* ... */ }
  // ...
}
```

## Directory Structure

The storage system organizes data in the following directory structure:

```
/data
  /documents       # Original documents
    /{yyyy-mm-dd}  # Organized by date
  /processed       # Extracted data
    /invoices
    /receipts
    /statements
  /reports         # Generated reports
    /{report-type}
  /exports         # Export packages
  /config          # Application configuration
  /cache           # Temporary processing data
  metadata.json    # Database version, stats, etc.
```

## Entity Structure

All stored entities follow a common structure with system fields:

```javascript
{
  "id": "unique-identifier",       // Unique identifier
  "createdAt": "2025-04-03T...",   // Creation timestamp
  "updatedAt": "2025-04-04T...",   // Last update timestamp
  "version": 3,                    // Entity version (incremented on update)
  "type": "invoice",               // Optional entity type
  "status": "processed",           // Optional status field
  
  // Entity-specific fields
  "number": "INV-2025-0042",
  "amount": 1250.00,
  "currency": "USD",
  // ...
}
```

## Querying Capabilities

The repository pattern supports flexible querying:

```javascript
// Basic equality query
const invoices = await storageService.queryEntities('invoices', {
  status: 'processed',
  currency: 'USD'
});

// Query with advanced options
const recentInvoices = await storageService.queryEntities('invoices', {
  status: 'processed'
}, {
  sort: { createdAt: -1 },
  limit: 10,
  skip: 20
});
```

## In-Memory Indexing

For performance optimization, the `FileSystemRepository` implements in-memory indexing:

1. **Initial Loading**: Indexes are built from files during initialization
2. **Index Maintenance**: Indexes are updated on save/delete operations
3. **Query Optimization**: Queries use indexes for faster filtering
4. **Memory Management**: Indexes can be selectively cleared if memory pressure increases

## Error Handling

The storage system uses a comprehensive error handling strategy:

1. **Typed Errors**: Specific error types for different failure scenarios
2. **Logging**: Detailed error logging with context information
3. **Recovery**: Automatic recovery for certain error conditions
4. **Fallbacks**: Graceful degradation when primary operations fail

## Integration with Other Services

### Document Service Integration

```javascript
class EnhancedDocumentService extends IService {
  async saveProcessedDocument(document) {
    return this.storageService.saveEntity('documents', {
      ...document,
      processingStatus: 'complete',
      processedAt: new Date().toISOString()
    });
  }
}
```

### Report Service Integration

```javascript
class EnhancedReportService extends IService {
  async generateReport(options = {}) {
    const report = await this.reportGenerator.generate(options);
    return this.storageService.saveEntity('reports', {
      ...report,
      status: 'completed',
      generatedAt: new Date().toISOString()
    });
  }
}
```

### Tax Service Integration

```javascript
class EnhancedTaxService extends IService {
  async saveCalculation(calculation) {
    return this.storageService.saveEntity('taxCalculations', calculation);
  }
}
```

## Future Extension Points

### Export/Import

The storage architecture is designed to support future export/import capabilities:

```javascript
class DataTransferService {
  async exportData(entities, options = {}) {
    // Package entities for export
  }
  
  async importData(source, options = {}) {
    // Import entities from package
  }
}
```

### Local Network Sharing

The architecture supports future LAN-based sharing:

```javascript
class NetworkShareRepository extends IStorageRepository {
  constructor(options = {}) {
    super();
    this.networkPath = options.networkPath;
    // Initialize network repository
  }
  
  // Implementation of interface methods
}
```

### Cloud Synchronization

While not implemented in the current version, the architecture prepares for future cloud integration:

```javascript
class SyncManager {
  constructor() {
    this.syncProviders = new Map();
    this.entityTracking = new Map();
  }
  
  // Methods for tracking and syncing changes
}
```

## Performance Considerations

- **Caching**: Entity and query results are cached for performance
- **Batch Operations**: Bulk operations reduce I/O overhead
- **Lazy Loading**: Data is loaded only when needed
- **Index Optimization**: Indexes are optimized for common query patterns
- **Asynchronous Operations**: Non-blocking operations for responsive UI

## Implementation Phases

1. **Phase 1 (Current)**: Local `FileSystemRepository` with basic CRUD
2. **Phase 2**: Enhanced querying and indexing
3. **Phase 3**: Export/Import functionality
4. **Phase 4**: Local network sharing
5. **Future**: Cloud synchronization

## Conclusion

This storage architecture provides a solid foundation for the Financial Pre-Accounting Agent, with a clear path for future enhancements while maintaining backward compatibility and performance. By abstracting storage details behind clean interfaces, we enable flexibility in implementation while providing a consistent API to the rest of the application.
