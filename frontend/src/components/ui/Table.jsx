import React from 'react';
import { clsx } from 'clsx';

/**
 * Table Component
 * Reusable table component with sorting and pagination
 */

const Table = ({
  children,
  className = '',
  data = [],
  columns = [],
  loading = false,
  error = null,
  pagination = null,
  ...props
}) => {
  // If data and columns are provided, render a data table
  if (data && columns && columns.length > 0 && Array.isArray(data)) {
    return (
      <div className="overflow-x-auto">
        <table className={clsx('min-w-full divide-y divide-gray-200', className)} {...props}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={column.key || index}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-red-600">
                  Error: {error.message || 'Failed to load data'}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={row.id || rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={column.key || colIndex}>
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
        {pagination && (
          <TablePagination
            currentPage={pagination.current}
            totalPages={pagination.total}
            totalItems={pagination.totalItems || 0}
            itemsPerPage={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onPageSizeChange}
          />
        )}
      </div>
    );
  }

  // If data is provided but not an array, show error
  if (data && !Array.isArray(data)) {
    return (
      <div className="overflow-x-auto">
        <table className={clsx('min-w-full divide-y divide-gray-200', className)} {...props}>
          <TableHeader>
            <TableRow>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center py-8 text-red-600">
                Invalid data format: Expected array but received {typeof data}
              </TableCell>
            </TableRow>
          </TableBody>
        </table>
      </div>
    );
  }

  // Default table rendering for custom content
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={clsx('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={clsx('bg-white divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({
  children,
  className = '',
  onClick,
  hover = false,
  ...props
}) => {
  return (
    <tr
      className={clsx(
        hover && 'hover:bg-gray-50 cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead = ({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  ...props
}) => {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-100',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={clsx(
                'w-3 h-3',
                sortDirection === 'asc' ? 'text-gray-900' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            <svg
              className={clsx(
                'w-3 h-3 -mt-1',
                sortDirection === 'desc' ? 'text-gray-900' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
};

const TableCell = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} {...props}>
      {children}
    </td>
  );
};

const TableCellActions = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-right text-sm font-medium', className)} {...props}>
      <div className="flex items-center justify-end space-x-2">
        {children}
      </div>
    </td>
  );
};

// Pagination component
const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={clsx('flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200', className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.CellActions = TableCellActions;
Table.Pagination = TablePagination;

export default Table;
