# Storage UI Integration Guide

## Overview

This guide describes patterns and practices for integrating UI components with the storage architecture. Following these guidelines will ensure a modular, maintainable UI codebase that can easily evolve as technologies change.

## Core Integration Principles

- **Separation of Concerns**: UI components should not access storage directly
- **Data Flow Management**: Clearly defined data flow paths prevent tangled dependencies
- **Framework Agnosticism**: Core patterns should not depend on specific UI frameworks
- **Progressive Enhancement**: Build core functionality first, then enhance with modern features
- **Error Handling**: Consistent error handling patterns across the UI layer

## Service Proxy Pattern

The recommended approach for UI integration is the Service Proxy pattern, which provides a clean abstraction between UI components and storage services.

### Service Proxy Implementation

```javascript
// src/renderer/services/StorageServiceProxy.js
class StorageServiceProxy {
  constructor(ipcRenderer) {
    this.ipcRenderer = ipcRenderer;
  }

  /**
   * Save an entity to storage
   * @param {string} entityType - Type of entity to save
   * @param {Object} entity - Entity data to save
   * @returns {Promise<Object>} Saved entity with generated fields
   */
  async saveEntity(entityType, entity) {
    return this.ipcRenderer.invoke('storage:saveEntity', entityType, entity);
  }

  /**
   * Get entity by ID
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async getEntityById(entityType, id) {
    return this.ipcRenderer.invoke('storage:getEntityById', entityType, id);
  }

  /**
   * Query for entities matching criteria
   * @param {string} entityType - Type of entity
   * @param {Object} criteria - Query criteria
   * @param {Object} options - Query options (sort, limit, etc.)
   * @returns {Promise<Array<Object>>} Matching entities
   */
  async queryEntities(entityType, criteria, options) {
    return this.ipcRenderer.invoke('storage:queryEntities', entityType, criteria, options);
  }
  
  // Additional methods matching the StorageService API
}
```

### IPC Handler Registration (Main Process)

```javascript
// in main.js or preload.js
ipcMain.handle('storage:saveEntity', async (event, entityType, entity) => {
  const storageService = serviceRegistry.getService('StorageService');
  return storageService.saveEntity(entityType, entity);
});

ipcMain.handle('storage:getEntityById', async (event, entityType, id) => {
  const storageService = serviceRegistry.getService('StorageService');
  return storageService.getEntityById(entityType, id);
});

ipcMain.handle('storage:queryEntities', async (event, entityType, criteria, options) => {
  const storageService = serviceRegistry.getService('StorageService');
  return storageService.queryEntities(entityType, criteria, options);
});

// Register handlers for all StorageService methods
```

## Component Architecture Patterns

### 1. Presentational/Container Pattern

This pattern separates data management from UI rendering.

```javascript
// Container component
const ReportListContainer = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storageService = useStorageService();
  
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const reports = await storageService.queryEntities('reports', { status: 'completed' });
        setReports(reports);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, []);
  
  return (
    <ReportList 
      reports={reports} 
      loading={loading}
      error={error}
    />
  );
};

// Presentational component
const ReportList = ({ reports, loading, error }) => {
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="report-list">
      {reports.map(report => (
        <ReportItem key={report.id} report={report} />
      ))}
    </div>
  );
};
```

### 2. Custom Hooks for Data Operations

Encapsulate storage operations in custom hooks for reusability.

```javascript
// src/renderer/hooks/useEntityQuery.js
function useEntityQuery(entityType, criteria, options = {}) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storageService = useStorageService();
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const result = await storageService.queryEntities(entityType, criteria, options);
        if (isMounted) {
          setEntities(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchEntities();
    
    return () => {
      isMounted = false;
    };
  }, [entityType, JSON.stringify(criteria), JSON.stringify(options)]);
  
  return { entities, loading, error };
}

// Usage
function InvoiceListComponent() {
  const { entities: invoices, loading, error } = useEntityQuery('invoices', { status: 'pending' });
  
  // Render component with invoices
}
```

### 3. Context Provider for Storage Access

Make storage services available throughout the component tree.

```javascript
// src/renderer/contexts/StorageContext.js
const StorageContext = React.createContext(null);

export function StorageProvider({ children }) {
  const [storageServiceProxy, setStorageServiceProxy] = useState(null);
  
  useEffect(() => {
    // Initialize proxy
    const proxy = new StorageServiceProxy(window.electron.ipcRenderer);
    setStorageServiceProxy(proxy);
  }, []);
  
  return (
    <StorageContext.Provider value={storageServiceProxy}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorageService() {
  const storageService = useContext(StorageContext);
  if (!storageService) {
    throw new Error('useStorageService must be used within a StorageProvider');
  }
  return storageService;
}
```

## Data Flow Patterns

### 1. Unidirectional Data Flow

Follow a clear data flow path for consistency and predictability.

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    Action   │─────▶│  Data Store │─────▶│    Render   │
└─────────────┘      └─────────────┘      └─────────────┘
       ▲                                         │
       └─────────────────────────────────────────┘
```

### 2. State Management Integration

```javascript
// Example with a state management library (Redux-like)
const initialState = {
  invoices: [],
  loading: false,
  error: null
};

function storageReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_INVOICES_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_INVOICES_SUCCESS':
      return { 
        ...state, 
        invoices: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_INVOICES_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
}

// Action creators
const fetchInvoices = (criteria = {}) => async (dispatch, getState, { storageService }) => {
  dispatch({ type: 'FETCH_INVOICES_REQUEST' });
  
  try {
    const invoices = await storageService.queryEntities('invoices', criteria);
    dispatch({ 
      type: 'FETCH_INVOICES_SUCCESS',
      payload: invoices
    });
  } catch (error) {
    dispatch({
      type: 'FETCH_INVOICES_FAILURE',
      payload: error
    });
  }
};
```

## Form Integration

### 1. Form to Entity Binding

```javascript
function InvoiceForm({ initialInvoice, onSave }) {
  const [invoice, setInvoice] = useState(initialInvoice || {
    number: '',
    client: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(invoice);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="number">Invoice Number</label>
        <input 
          type="text" 
          id="number" 
          name="number" 
          value={invoice.number} 
          onChange={handleChange}
        />
      </div>
      
      {/* Other form fields */}
      
      <button type="submit">Save Invoice</button>
    </form>
  );
}

// Usage with storage
function CreateInvoicePage() {
  const storageService = useStorageService();
  const navigate = useNavigate();
  
  const handleSave = async (invoice) => {
    try {
      const savedInvoice = await storageService.saveEntity('invoices', invoice);
      navigate(`/invoices/${savedInvoice.id}`);
    } catch (error) {
      // Handle error
    }
  };
  
  return <InvoiceForm onSave={handleSave} />;
}
```

### 2. Change Tracking

```javascript
function useEntityForm(entityType, entityId) {
  const [entity, setEntity] = useState(null);
  const [originalEntity, setOriginalEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const storageService = useStorageService();
  
  // Load entity
  useEffect(() => {
    const loadEntity = async () => {
      try {
        setLoading(true);
        const loadedEntity = await storageService.getEntityById(entityType, entityId);
        setEntity(loadedEntity);
        setOriginalEntity(JSON.parse(JSON.stringify(loadedEntity))); // Deep copy
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (entityId) {
      loadEntity();
    } else {
      setLoading(false);
    }
  }, [entityType, entityId]);
  
  // Update form and track changes
  const updateField = (field, value) => {
    setEntity(prev => {
      const updated = { ...prev, [field]: value };
      // Check if any fields changed from original
      setIsDirty(!isEqual(updated, originalEntity));
      return updated;
    });
  };
  
  // Save entity
  const saveEntity = async () => {
    try {
      const savedEntity = await storageService.saveEntity(entityType, entity);
      setEntity(savedEntity);
      setOriginalEntity(JSON.parse(JSON.stringify(savedEntity)));
      setIsDirty(false);
      return savedEntity;
    } catch (err) {
      setError(err);
      throw err;
    }
  };
  
  // Reset to original values
  const resetForm = () => {
    setEntity(JSON.parse(JSON.stringify(originalEntity)));
    setIsDirty(false);
  };
  
  return {
    entity,
    loading,
    error,
    isDirty,
    updateField,
    saveEntity,
    resetForm
  };
}
```

## Error Handling Patterns

### 1. Consistent Error Displays

Create reusable components for different error scenarios:

```javascript
// src/renderer/components/ui/ErrorDisplay.js
function ErrorDisplay({ error, onRetry }) {
  // Determine error type and display appropriate message
  const getErrorMessage = () => {
    if (error.code === 'STORAGE_ENTITY_NOT_FOUND') {
      return 'The requested item could not be found.';
    }
    if (error.code === 'STORAGE_ACCESS_DENIED') {
      return 'You do not have permission to access this item.';
    }
    return error.message || 'An unexpected error occurred.';
  };
  
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>{getErrorMessage()}</p>
      {onRetry && (
        <button onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}
```

### 2. Error Boundary Integration

Use error boundaries to prevent UI crashes:

```javascript
// src/renderer/components/ErrorBoundary.js
class StorageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Storage UI error:', error, errorInfo);
    // Log error to service
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a storage error
      if (this.state.error && this.state.error.code?.startsWith('STORAGE_')) {
        return <ErrorDisplay error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
      }
      
      // Generic error fallback
      return <h2>Something went wrong. Please try again.</h2>;
    }

    return this.props.children;
  }
}
```

## UI Modularity Strategies

### 1. Component Decomposition

Break complex views into smaller, reusable components:

```javascript
// Instead of one large component:
function DocumentManager() {
  // 200+ lines of code
}

// Break it down into smaller components:
function DocumentManager() {
  return (
    <div className="document-manager">
      <DocumentFilters />
      <DocumentList />
      <DocumentPreview />
      <DocumentActions />
    </div>
  );
}
```

### 2. Component Composition

Build larger components by composing smaller ones:

```javascript
function DocumentList({ documents, onSelect }) {
  return (
    <div className="document-list">
      {documents.map(doc => (
        <DocumentListItem 
          key={doc.id} 
          document={doc} 
          onSelect={() => onSelect(doc)}
        />
      ))}
    </div>
  );
}

function DocumentListItem({ document, onSelect }) {
  return (
    <div className="document-item" onClick={onSelect}>
      <DocumentIcon type={document.type} />
      <DocumentSummary document={document} />
      <DocumentStatus status={document.status} />
    </div>
  );
}
```

### 3. Higher-Order Components for Storage Integration

Create HOCs for common storage patterns:

```javascript
// withStorageData.js
function withStorageData(WrappedComponent, entityType, criteriaFn, optionsFn) {
  return function WithStorageData(props) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const storageService = useStorageService();
    
    useEffect(() => {
      const criteria = criteriaFn ? criteriaFn(props) : {};
      const options = optionsFn ? optionsFn(props) : {};
      
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await storageService.queryEntities(entityType, criteria, options);
          setData(result);
          setError(null);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, [props, JSON.stringify(criteriaFn(props))]);
    
    return (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading}
        error={error}
      />
    );
  };
}

// Usage
const InvoiceListWithData = withStorageData(
  InvoiceList,
  'invoices',
  (props) => ({ status: props.status || 'pending' }),
  (props) => ({ sort: { createdAt: -1 }, limit: props.limit || 10 })
);
```

## Supporting Future UI Frameworks

To ensure modularity for future UI framework changes:

### 1. Framework Adapters

```javascript
// src/renderer/adapters/StorageAdapter.js
class StorageAdapter {
  constructor(storageService) {
    this.storageService = storageService;
  }
  
  // React adapter
  createReactAdapter() {
    return {
      useQuery: (entityType, criteria, options) => {
        // React hooks implementation
      },
      useEntity: (entityType, id) => {
        // React hooks implementation
      }
    };
  }
  
  // Vue adapter
  createVueAdapter() {
    return {
      // Vue composition API implementation
    };
  }
  
  // Framework-agnostic core functions
  async queryEntities(entityType, criteria, options) {
    return this.storageService.queryEntities(entityType, criteria, options);
  }
  
  async getEntityById(entityType, id) {
    return this.storageService.getEntityById(entityType, id);
  }
}
```

### 2. UI Component Documentation

Maintain clear documentation for all UI components that integrate with storage:

- Purpose and responsibility
- Required props and data structures
- Storage dependencies
- Performance considerations
- Reusability guidelines

### 3. Data-First Design Approach

Design components based on data needs first, then view implementation:

1. Identify the data structure needed by the component
2. Define the storage operations required
3. Create the data service/provider/hook
4. Implement the UI component using the data service

## Performance Considerations

### 1. Data Pagination and Virtualization

For large data sets, implement pagination:

```javascript
function PaginatedDocumentList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { entities, loading, error, total } = usePaginatedQuery(
    'documents',
    { status: 'active' },
    { page, limit }
  );
  
  return (
    <div>
      <DocumentList documents={entities} loading={loading} error={error} />
      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### 2. Data Caching

Implement client-side caching to improve performance:

```javascript
function createCachedStorageProxy(storageProxy) {
  const cache = new Map();
  
  return {
    async getEntityById(entityType, id, options = {}) {
      const cacheKey = `${entityType}:${id}`;
      
      if (!options.bypassCache && cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      
      const entity = await storageProxy.getEntityById(entityType, id);
      if (entity) {
        cache.set(cacheKey, entity);
      }
      
      return entity;
    },
    
    // Implement other methods with caching
  };
}
```

### 3. Optimistic Updates

Improve perceived performance with optimistic updates:

```javascript
function useOptimisticMutation(entityType) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const storageService = useStorageService();
  
  const saveEntity = async (entity) => {
    // Get optimistic ID if new entity
    const optimisticId = entity.id || `temp-${Date.now()}`;
    const optimisticEntity = { ...entity, id: optimisticId };
    
    // Optimistically update UI
    dispatch({ 
      type: 'SAVE_ENTITY_OPTIMISTIC',
      payload: optimisticEntity
    });
    
    try {
      // Perform actual save
      const savedEntity = await storageService.saveEntity(entityType, entity);
      
      // Update with real data
      dispatch({
        type: 'SAVE_ENTITY_SUCCESS',
        payload: savedEntity,
        meta: { optimisticId }
      });
      
      return savedEntity;
    } catch (error) {
      // Revert optimistic update
      dispatch({
        type: 'SAVE_ENTITY_FAILURE',
        error: error,
        meta: { optimisticId }
      });
      
      throw error;
    }
  };
  
  return {
    entities: state.entities,
    loading: state.loading,
    error: state.error,
    saveEntity
  };
}
```

## Conclusion

By following these UI integration patterns, you'll maintain a modular, maintainable UI codebase that can easily adapt to changing requirements and technologies. The clear separation between UI components and storage implementation enables independent evolution of both layers while maintaining a consistent user experience.

Remember these key principles:
- Keep UI components focused on presentation
- Use container components or hooks for data access
- Implement proper error handling and loading states
- Design for performance with pagination and caching
- Maintain clear documentation of component responsibilities
