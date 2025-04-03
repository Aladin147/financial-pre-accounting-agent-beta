import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Table Component
 * 
 * A customizable table component with sorting, filtering, and pagination capabilities.
 * Integrated with the application's theme system.
 *
 * @example
 * // Basic usage
 * <Table 
 *   data={[
 *     { id: 1, name: 'Document 1', date: '2025-04-01', amount: 1250.50 },
 *     { id: 2, name: 'Document 2', date: '2025-04-02', amount: 850.75 }
 *   ]}
 *   columns={[
 *     { id: 'id', label: 'ID', sortable: true },
 *     { id: 'name', label: 'Document Name', sortable: true },
 *     { id: 'date', label: 'Date', sortable: true },
 *     { id: 'amount', label: 'Amount', sortable: true, render: (value) => `$${value.toFixed(2)}` }
 *   ]}
 * />
 * 
 * // With pagination
 * <Table 
 *   data={documents}
 *   columns={columns}
 *   pagination={true}
 *   pageSize={10}
 * />
 */
const Table = ({
  // Data
  data = [],
  columns = [],
  keyField = 'id',
  
  // Features
  sortable = true,
  defaultSortColumn = null,
  defaultSortDirection = 'asc',
  filterable = false,
  pagination = false,
  pageSize = 10,
  
  // Selection
  selectable = false,
  selectedRows = [],
  onRowSelect = () => {},
  
  // Appearance
  striped = true,
  bordered = true,
  compact = false,
  hoverHighlight = true,
  stickyHeader = false,
  fullWidth = true,
  
  // Custom rendering
  emptyMessage = 'No data to display',
  loadingMessage = 'Loading data...',
  
  // State
  loading = false,
  error = null,
  
  // Events
  onRowClick = () => {},
  onSort = () => {},
  onFilter = () => {},
  onPageChange = () => {},
  
  // Additional props
  className = '',
  style = {},
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  id,
  ...rest
}) => {
  const { theme, isDarkMode } = useTheme();
  
  // Table state
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(new Set(selectedRows.map(row => row[keyField])));
  
  // Sync selected state with props
  useEffect(() => {
    setSelected(new Set(selectedRows.map(row => row[keyField])));
  }, [selectedRows, keyField]);
  
  // Handle sorting
  const handleSort = (columnId) => {
    if (!sortable) return;
    
    const newDirection = columnId === sortColumn
      ? sortDirection === 'asc' ? 'desc' : 'asc'
      : 'asc';
    
    setSortColumn(columnId);
    setSortDirection(newDirection);
    onSort(columnId, newDirection);
  };
  
  // Handle filtering
  const handleFilter = (columnId, value) => {
    const newFilters = { ...filters };
    
    if (value) {
      newFilters[columnId] = value;
    } else {
      delete newFilters[columnId];
    }
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
    onFilter(newFilters);
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange(page);
  };
  
  // Handle row selection
  const handleRowSelect = (row) => {
    if (!selectable) return;
    
    const rowKey = row[keyField];
    const newSelected = new Set(selected);
    
    if (newSelected.has(rowKey)) {
      newSelected.delete(rowKey);
    } else {
      newSelected.add(rowKey);
    }
    
    setSelected(newSelected);
    onRowSelect(Array.from(newSelected));
  };
  
  // Process data (sort, filter, paginate)
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply filters
    if (filterable && Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([columnId, filterValue]) => {
          const cellValue = row[columnId];
          if (cellValue === null || cellValue === undefined) return false;
          
          const stringValue = String(cellValue).toLowerCase();
          return stringValue.includes(String(filterValue).toLowerCase());
        });
      });
    }
    
    // Apply sorting
    if (sortable && sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        
        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Default string comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        return sortDirection === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }
    
    // Apply pagination
    if (pagination) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      result = result.slice(startIndex, endIndex);
    }
    
    return result;
  }, [data, sortable, sortColumn, sortDirection, filterable, filters, pagination, currentPage, pageSize]);
  
  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    
    let filteredData = [...data];
    
    // Apply filters to calculate correct total
    if (filterable && Object.keys(filters).length > 0) {
      filteredData = filteredData.filter(row => {
        return Object.entries(filters).every(([columnId, filterValue]) => {
          const cellValue = row[columnId];
          if (cellValue === null || cellValue === undefined) return false;
          
          const stringValue = String(cellValue).toLowerCase();
          return stringValue.includes(String(filterValue).toLowerCase());
        });
      });
    }
    
    return Math.ceil(filteredData.length / pageSize) || 1;
  }, [data, filterable, filters, pagination, pageSize]);
  
  // Generate styles
  const styles = {
    container: {
      width: fullWidth ? '100%' : 'auto',
      overflowX: 'auto',
      backgroundColor: isDarkMode ? theme.colors.bg.card : '#ffffff',
      borderRadius: theme.borderRadius.md,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      ...style
    },
    table: {
      width: fullWidth ? '100%' : 'auto',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      fontSize: '14px',
      color: isDarkMode ? theme.colors.text.primary : theme.colors.text.primary
    },
    thead: {
      position: stickyHeader ? 'sticky' : 'static',
      top: 0,
      backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)',
      zIndex: 1
    },
    th: {
      padding: compact ? '8px 12px' : '12px 16px',
      textAlign: 'left',
      fontWeight: 600,
      borderBottom: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      whiteSpace: 'nowrap',
      position: 'relative',
      ...(bordered && {
        borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
      })
    },
    sortableHeader: {
      cursor: 'pointer',
      userSelect: 'none'
    },
    sortIcon: {
      marginLeft: '6px',
      opacity: 0.5
    },
    activeSortIcon: {
      opacity: 1,
      color: theme.colors.primary[500]
    },
    filterInput: {
      margin: '4px 0 0 0',
      padding: '4px 8px',
      width: 'calc(100% - 16px)',
      fontSize: '12px',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
      borderRadius: '4px',
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      color: isDarkMode ? theme.colors.text.primary : theme.colors.text.primary
    },
    tbody: {},
    tr: {
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s ease'
    },
    stripedRow: (index) => ({
      backgroundColor: index % 2 === 1 
        ? (isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)')
        : 'transparent'
    }),
    hoverableRow: {
      ':hover': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
      }
    },
    selectedRow: {
      backgroundColor: `${theme.colors.primary[500]}20` // 12% opacity
    },
    clickableRow: {
      cursor: 'pointer'
    },
    td: {
      padding: compact ? '6px 12px' : '10px 16px',
      ...(bordered && {
        borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
      })
    },
    checkboxCell: {
      width: '40px',
      textAlign: 'center',
      padding: compact ? '6px' : '10px'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: theme.colors.primary[500]
    },
    noDataMessage: {
      textAlign: 'center',
      padding: '40px 20px',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
      fontStyle: 'italic'
    },
    errorMessage: {
      textAlign: 'center',
      padding: '20px',
      color: theme.colors.error.main,
      fontWeight: 500
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(250, 250, 250, 0.5)'
    },
    pageInfo: {
      fontSize: '14px',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
    },
    pageControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    pageButton: {
      padding: '4px 8px',
      minWidth: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    },
    activePageButton: {
      backgroundColor: theme.colors.primary[500],
      color: '#FFFFFF',
      fontWeight: 600,
      ':hover': {
        backgroundColor: theme.colors.primary[700]
      }
    }
  };
  
  // Render sorting icon
  const renderSortIcon = (columnId) => {
    if (columnId !== sortColumn) {
      return <span style={styles.sortIcon}>↕</span>;
    }
    
    return (
      <span style={{ ...styles.sortIcon, ...styles.activeSortIcon }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Render filter input
  const renderFilterInput = (column) => {
    if (!filterable || !column.filterable) return null;
    
    return (
      <input
        type="text"
        placeholder={`Filter ${column.label}`}
        value={filters[column.id] || ''}
        onChange={(e) => handleFilter(column.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={styles.filterInput}
      />
    );
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;
    
    const visiblePages = [];
    
    // Always show first page, last page, current page, and one page before and after current
    const showFirst = 1;
    const showLast = totalPages;
    const showCurrent = currentPage;
    const showPrev = Math.max(showCurrent - 1, 1);
    const showNext = Math.min(showCurrent + 1, totalPages);
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === showFirst ||
        i === showLast ||
        i === showCurrent ||
        i === showPrev ||
        i === showNext
      ) {
        // If we're adding a non-consecutive page, add an ellipsis
        if (visiblePages.length > 0 && visiblePages[visiblePages.length - 1] !== i - 1) {
          visiblePages.push(-1); // Use -1 to represent ellipsis
        }
        
        visiblePages.push(i);
      }
    }
    
    const processedItems = Math.min(processedData.length, pageSize);
    const totalItems = data.length;
    
    const startItem = Math.min(((currentPage - 1) * pageSize) + 1, totalItems);
    const endItem = Math.min(startItem + processedItems - 1, totalItems);
    
    return (
      <div style={styles.pagination}>
        <div style={styles.pageInfo}>
          Showing {totalItems === 0 ? 0 : startItem}-{endItem} of {totalItems} items
        </div>
        
        <div style={styles.pageControls}>
          <button
            style={styles.pageButton}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First Page"
          >
            ««
          </button>
          
          <button
            style={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            «
          </button>
          
          {visiblePages.map((page, index) => 
            page === -1 ? (
              <span key={`ellipsis-${index}`} style={{ padding: '0 4px' }}>…</span>
            ) : (
              <button
                key={`page-${page}`}
                style={{
                  ...styles.pageButton,
                  ...(page === currentPage ? styles.activePageButton : {})
                }}
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
          
          <button
            style={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            »
          </button>
          
          <button
            style={styles.pageButton}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last Page"
          >
            »»
          </button>
        </div>
      </div>
    );
  };
  
  // Render the table
  return (
    <div className={`table-component ${className}`} style={styles.container} id={id} {...rest}>
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <div>{loadingMessage}</div>
          </div>
        )}
        
        <table style={styles.table}>
          <thead style={styles.thead} className={headerClassName}>
            <tr>
              {selectable && (
                <th style={{ ...styles.th, ...styles.checkboxCell }}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={() => {
                      if (selected.size === data.length) {
                        setSelected(new Set());
                        onRowSelect([]);
                      } else {
                        const allIds = data.map(row => row[keyField]);
                        setSelected(new Set(allIds));
                        onRowSelect(allIds);
                      }
                    }}
                    disabled={data.length === 0}
                    style={styles.checkbox}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{
                    ...styles.th,
                    ...(sortable && column.sortable ? styles.sortableHeader : {}),
                    ...(column.width ? { width: column.width } : {}),
                    ...(column.headerStyle || {})
                  }}
                  onClick={() => column.sortable ? handleSort(column.id) : null}
                >
                  <div>{column.label} {sortable && column.sortable && renderSortIcon(column.id)}</div>
                  {renderFilterInput(column)}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody style={styles.tbody}>
            {error && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={styles.errorMessage}
                >
                  {error}
                </td>
              </tr>
            )}
            
            {!error && processedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={styles.noDataMessage}
                >
                  {loading ? loadingMessage : emptyMessage}
                </td>
              </tr>
            )}
            
            {!error && processedData.map((row, rowIndex) => {
              const rowKey = row[keyField];
              const isSelected = selected.has(rowKey);
              
              return (
                <tr
                  key={rowKey}
                  style={{
                    ...styles.tr,
                    ...(striped ? styles.stripedRow(rowIndex) : {}),
                    ...(hoverHighlight ? styles.hoverableRow : {}),
                    ...(isSelected ? styles.selectedRow : {}),
                    ...(onRowClick ? styles.clickableRow : {})
                  }}
                  onClick={(e) => {
                    if (selectable) {
                      handleRowSelect(row);
                    }
                    onRowClick(row, e);
                  }}
                  className={rowClassName}
                >
                  {selectable && (
                    <td style={{ ...styles.td, ...styles.checkboxCell }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(row);
                        }}
                        style={styles.checkbox}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={`${rowKey}-${column.id}`}
                      style={{ ...styles.td, ...(column.cellStyle || {}) }}
                      className={cellClassName}
                    >
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
};

Table.propTypes = {
  // Data
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func,
      headerStyle: PropTypes.object,
      cellStyle: PropTypes.object
    })
  ),
  keyField: PropTypes.string,
  
  // Features
  sortable: PropTypes.bool,
  defaultSortColumn: PropTypes.string,
  defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
  filterable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  
  // Selection
  selectable: PropTypes.bool,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  
  // Appearance
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  compact: PropTypes.bool,
  hoverHighlight: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  fullWidth: PropTypes.bool,
  
  // Custom rendering
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  
  // State
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  
  // Events
  onRowClick: PropTypes.func,
  onSort: PropTypes.func,
  onFilter: PropTypes.func,
  onPageChange: PropTypes.func,
  
  // Additional props
  className: PropTypes.string,
  style: PropTypes.object,
  headerClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  cellClassName: PropTypes.string,
  id: PropTypes.string
};

export default Table;
