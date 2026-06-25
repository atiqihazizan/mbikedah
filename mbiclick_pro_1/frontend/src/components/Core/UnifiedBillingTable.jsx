import { FileText, RotateCcw, Eye } from 'lucide-react';
import TButton from '../Core/TButton';
import { formatCurrency, formatDate } from '../../config/format';

function UnifiedBillingTable({
  // Data props
  data = [],
  loading = false,
  error = null,
  
  // Table configuration
  title = "Senarai Data",
  titleIcon = null,
  columns = [],
  
  // Empty state
  emptyIcon = FileText,
  emptyTitle = "Tiada data pada masa ini",
  emptyDescription = "",
  emptyAction = null,
  
  // Actions
  onRefresh = null,
  onRowAction = null,
  
  // Styling
  className = "",
  containerClassName = "",
  
  // Custom renderers
  renderRow = null,
  renderActions = null,
  
  showActionsColumn = false,
  
  // Additional props
  activeTab = "",
  showCount = true,
  ...props
}) {

  const EmptyIcon = emptyIcon;

  // Default column renderer
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item, column);
    }
    
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
    
    if (column.type === 'currency') {
      return <span className="font-medium text-gray-900">{formatCurrency(value)}</span>;
    }
    
    if (column.type === 'date') {
      return <span className="text-gray-500">{formatDate(value)}</span>;
    }
    
    if (column.type === 'status') {
      const statusClass = column.getStatusClass ? column.getStatusClass(value, item) : 'bg-gray-100 text-gray-800';
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
          {value}
        </span>
      );
    }
    
    return <span className={column.className || "text-gray-900"}>{value}</span>;
  };

  // Default actions renderer
  const defaultRenderActions = (item) => {
    if (renderActions) {
      return renderActions(item);
    }
    
    return (
      <div className="flex space-x-2">
        {onRowAction && (
          <TButton 
            onClick={() => onRowAction('view', item)} 
            variant="link" 
            color="blue" 
            size="sm" 
            circle
            title="Lihat"
          >
            <Eye className="w-4 h-4" />
          </TButton>
        )}
      </div>
    );
  };

  // Header title with count
  const getTableTitle = () => {
    if (!showCount) return title;
    return `${title} (${data.length})`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${containerClassName}`}>
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            {titleIcon && <span className="mr-3">{titleIcon}</span>}
            {getTableTitle()}
          </h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
              title="Refresh Data"
            >
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className={className}>
        {loading ? (
          // Loading State
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        ) : error ? (
          // Error State
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              {onRefresh && (
                <TButton onClick={onRefresh} variant="link" color="blue" size="sm" circle>
                  Cuba Semula
                </TButton>
              )}
            </div>
          </div>
        ) : data.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <EmptyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{emptyTitle}</p>
            {emptyDescription && (
              <p className="text-sm text-gray-400 mt-1">{emptyDescription}</p>
            )}
            {emptyAction && (
              <div className="mt-4">
                {emptyAction}
              </div>
            )}
          </div>
        ) : (
          // Table with Data
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {(renderActions || onRowAction || showActionsColumn) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, rowIndex) => {
                  // If custom row renderer is provided, use it
                  if (renderRow) {
                    return renderRow(item, rowIndex);
                  }
                  
                  // Default row rendering
                  return (
                    <tr key={item.id || rowIndex} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td 
                          key={colIndex} 
                          className={`px-6 py-4 ${column.cellClassName || ''}`}
                        >
                          {renderCell(item, column)}
                        </td>
                      ))}
                      {(renderActions || onRowAction || showActionsColumn) && (
                        <td className="px-6 py-4 text-sm font-medium">
                          {renderActions ? renderActions(item) : defaultRenderActions(item)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedBillingTable;