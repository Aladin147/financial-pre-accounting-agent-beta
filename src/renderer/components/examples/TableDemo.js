import React, { useState, useMemo } from 'react';
import Table from '../ui/Table';
import { ThemeProvider } from '../../styles/ThemeProvider';

/**
 * TableDemo Component
 * 
 * Demonstrates the usage of the Table component with various configurations.
 */
const TableDemo = () => {
  // Demo data - simulating financial documents
  const demoData = useMemo(() => [
    { id: 1, docType: 'Invoice', docNumber: 'INV-2025-001', date: '2025-04-01', amount: 1250.50, status: 'Processed', confidence: 92 },
    { id: 2, docType: 'Receipt', docNumber: 'RCP-2025-042', date: '2025-03-28', amount: 476.25, status: 'Verified', confidence: 88 },
    { id: 3, docType: 'Invoice', docNumber: 'INV-2025-002', date: '2025-03-15', amount: 2345.75, status: 'Pending', confidence: 76 },
    { id: 4, docType: 'Statement', docNumber: 'STM-2025-007', date: '2025-03-31', amount: 0.00, status: 'Processed', confidence: 95 },
    { id: 5, docType: 'Receipt', docNumber: 'RCP-2025-043', date: '2025-03-22', amount: 125.00, status: 'Verified', confidence: 91 },
    { id: 6, docType: 'Invoice', docNumber: 'INV-2025-003', date: '2025-04-02', amount: 890.00, status: 'Pending', confidence: 82 },
    { id: 7, docType: 'Invoice', docNumber: 'INV-2025-004', date: '2025-03-12', amount: 1675.30, status: 'Processed', confidence: 89 },
    { id: 8, docType: 'Receipt', docNumber: 'RCP-2025-044', date: '2025-03-18', amount: 220.50, status: 'Verified', confidence: 93 },
    { id: 9, docType: 'Statement', docNumber: 'STM-2025-008', date: '2025-03-31', amount: 0.00, status: 'Processed', confidence: 97 },
    { id: 10, docType: 'Invoice', docNumber: 'INV-2025-005', date: '2025-03-25', amount: 3450.00, status: 'Pending', confidence: 79 },
    { id: 11, docType: 'Receipt', docNumber: 'RCP-2025-045', date: '2025-03-20', amount: 178.25, status: 'Verified', confidence: 87 },
    { id: 12, docType: 'Invoice', docNumber: 'INV-2025-006', date: '2025-04-03', amount: 945.75, status: 'Pending', confidence: 83 },
    { id: 13, docType: 'Statement', docNumber: 'STM-2025-009', date: '2025-03-31', amount: 0.00, status: 'Processed', confidence: 96 },
    { id: 14, docType: 'Receipt', docNumber: 'RCP-2025-046', date: '2025-03-29', amount: 312.40, status: 'Verified', confidence: 90 },
    { id: 15, docType: 'Invoice', docNumber: 'INV-2025-007', date: '2025-03-17', amount: 2178.65, status: 'Pending', confidence: 81 },
  ], []);
  
  // Column definitions
  const columns = useMemo(() => [
    { 
      id: 'id', 
      label: 'ID', 
      sortable: true,
      width: '60px'
    },
    { 
      id: 'docType', 
      label: 'Document Type', 
      sortable: true,
      filterable: true
    },
    { 
      id: 'docNumber', 
      label: 'Document Number', 
      sortable: true,
      filterable: true
    },
    { 
      id: 'date', 
      label: 'Date', 
      sortable: true,
      filterable: true
    },
    { 
      id: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      filterable: true,
      render: (value) => {
        let color;
        switch (value) {
          case 'Processed':
            color = '#4CAF50'; // green
            break;
          case 'Verified':
            color = '#2196F3'; // blue
            break;
          case 'Pending':
            color = '#FF9800'; // orange
            break;
          default:
            color = 'inherit';
        }
        return <span style={{ color, fontWeight: 500 }}>{value}</span>;
      }
    },
    { 
      id: 'confidence', 
      label: 'Confidence', 
      sortable: true,
      render: (value) => {
        let color;
        if (value >= 90) {
          color = '#4CAF50'; // green
        } else if (value >= 80) {
          color = '#2196F3'; // blue
        } else {
          color = '#FF9800'; // orange
        }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '8px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${value}%`, 
                height: '100%', 
                backgroundColor: color 
              }} />
            </div>
            <span style={{ marginLeft: '8px' }}>{value}%</span>
          </div>
        );
      }
    }
  ], []);
  
  // State for the selected rows example
  const [selectedRows, setSelectedRows] = useState([]);
  
  // State for the controlled table example
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for the loading example
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  // Display selected rows as JSON
  const selectedRowsJson = useMemo(() => {
    if (selectedRows.length === 0) return 'No rows selected';
    
    // Filter full data to get only selected rows
    const selectedData = demoData.filter(row => selectedRows.includes(row.id));
    
    return JSON.stringify(selectedData, null, 2);
  }, [selectedRows, demoData]);
  
  return (
    <ThemeProvider>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Table Component Demo</h1>
        <p>A feature-rich table component with sorting, filtering, pagination and more.</p>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Basic Table</h2>
          <Table 
            data={demoData.slice(0, 5)} 
            columns={columns}
          />
          <p><em>A simple table with the first 5 rows of data.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Sorting</h2>
          <Table 
            data={demoData} 
            columns={columns}
            sortable={true}
            defaultSortColumn="id"
            defaultSortDirection="asc"
          />
          <p><em>Click on column headers to sort. Click again to toggle between ascending and descending order.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Filtering</h2>
          <Table 
            data={demoData} 
            columns={columns}
            sortable={true}
            filterable={true}
          />
          <p><em>Type in the input fields below column headers to filter the data.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Pagination</h2>
          <Table 
            data={demoData} 
            columns={columns}
            sortable={true}
            pagination={true}
            pageSize={5}
          />
          <p><em>Displaying 5 rows per page with pagination controls.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Row Selection</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1' }}>
              <Table 
                data={demoData} 
                columns={columns}
                selectable={true}
                selectedRows={selectedRows.map(id => ({ id }))}
                onRowSelect={(selected) => setSelectedRows(selected)}
                pagination={true}
                pageSize={5}
              />
            </div>
            
            <div style={{ flex: '1' }}>
              <h3>Selected Rows</h3>
              <pre style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                padding: '10px', 
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {selectedRowsJson}
              </pre>
            </div>
          </div>
          <p><em>Click on a row to select it, or use the checkboxes. The selected data appears on the right.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Style Variations</h2>
          
          <h3>Compact Table</h3>
          <Table 
            data={demoData.slice(0, 5)} 
            columns={columns}
            compact={true}
          />
          <p><em>Reduced padding for denser data display.</em></p>
          
          <h3>No Striping</h3>
          <Table 
            data={demoData.slice(0, 5)} 
            columns={columns}
            striped={false}
          />
          <p><em>Without alternating row colors.</em></p>
          
          <h3>No Border</h3>
          <Table 
            data={demoData.slice(0, 5)} 
            columns={columns}
            bordered={false}
          />
          <p><em>Without cell borders.</em></p>
          
          <h3>No Hover Effect</h3>
          <Table 
            data={demoData.slice(0, 5)} 
            columns={columns}
            hoverHighlight={false}
          />
          <p><em>Without row highlighting on hover.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Loading State</h2>
          <div style={{ marginBottom: '10px' }}>
            <button 
              onClick={handleLoadingDemo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9747FF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simulate Loading
            </button>
          </div>
          <Table 
            data={demoData} 
            columns={columns}
            loading={isLoading}
            pagination={true}
            pageSize={5}
          />
          <p><em>Shows a loading overlay when data is being fetched.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Error State</h2>
          <Table 
            data={demoData} 
            columns={columns}
            error="An error occurred while fetching data. Please try again later."
          />
          <p><em>Displays an error message when something goes wrong.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Empty State</h2>
          <Table 
            data={[]} 
            columns={columns}
            emptyMessage="No documents found. Try adjusting your filters or uploading new documents."
          />
          <p><em>Custom message when there's no data to display.</em></p>
        </section>
        
        <section style={{ marginBottom: '40px' }}>
          <h2>Fully Controlled Table</h2>
          <p>Current state: Sort by <strong>{sortColumn}</strong> in <strong>{sortDirection}</strong> order, page <strong>{currentPage}</strong></p>
          
          <Table 
            data={demoData} 
            columns={columns}
            sortable={true}
            filterable={true}
            pagination={true}
            pageSize={5}
            defaultSortColumn={sortColumn}
            defaultSortDirection={sortDirection}
            onSort={(column, direction) => {
              console.log(`Sorting by ${column} in ${direction} order`);
              setSortColumn(column);
              setSortDirection(direction);
            }}
            onFilter={(filters) => {
              console.log('Filters changed:', filters);
              setCurrentFilters(filters);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            onPageChange={(page) => {
              console.log(`Page changed to ${page}`);
              setCurrentPage(page);
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <h3>Current Filters</h3>
            <pre style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.05)', 
              padding: '10px', 
              borderRadius: '4px' 
            }}>
              {JSON.stringify(currentFilters, null, 2) || 'No active filters'}
            </pre>
          </div>
          <p><em>A fully controlled table where all state changes are tracked externally.</em></p>
        </section>
      </div>
    </ThemeProvider>
  );
};

export default TableDemo;
