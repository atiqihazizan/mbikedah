import React, { useState, useMemo } from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({ 
  data, 
  columns, 
  itemsPerPage = 10,
  searchPlaceholder = "Cari...",
  className = "",
  thClassName = "",
  textAlign = "left",
  isDark = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-blue-500" />
      : <FaSortDown className="w-3 h-3 text-blue-500" />;
  };

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, sortedData.length);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto border rounded-lg ${
        isDark ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <table className="w-full">
          <thead className={`${
            isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'
          }`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-medium cursor-pointer select-none transition-colors duration-200 ${
                    column.textAlign === 'center' ? 'text-center' :
                    column.textAlign === 'right' ? 'text-right' :
                    column.textAlign === 'left' ? 'text-left' :
                    textAlign === 'center' ? 'text-center' :
                    textAlign === 'right' ? 'text-right' :
                    'text-left'
                  } ${
                    sortConfig.key === column.key 
                      ? 'text-blue-600' 
                      : 'hover:text-blue-500'
                  } ${thClassName} ${column.thClassName || ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className={`flex items-center gap-2 ${
                    column.textAlign === 'center' ? 'justify-center' :
                    column.textAlign === 'right' ? 'justify-end' :
                    column.textAlign === 'left' ? 'justify-start' :
                    textAlign === 'center' ? 'justify-center' :
                    textAlign === 'right' ? 'justify-end' :
                    'justify-start'
                  }`}>
                    {column.label}
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark ? 'divide-gray-600' : 'divide-gray-200'
          }`}>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    isDark 
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  } transition-colors duration-200`}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-4 py-3 ${
                        column.textAlign === 'center' ? 'text-center' :
                        column.textAlign === 'right' ? 'text-right' :
                        column.textAlign === 'left' ? 'text-left' :
                        textAlign === 'center' ? 'text-center' :
                        textAlign === 'right' ? 'text-right' :
                        'text-left'
                      }`}
                    >
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className={`px-4 py-8 text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {searchTerm ? 'Tiada data yang dijumpai untuk carian anda.' : 'Tiada data.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`mt-4 flex items-center justify-between ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {/* Info */}
          <div className="text-sm">
            Menunjukkan {startItem} hingga {endItem} daripada {sortedData.length} rekod
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Sebelum
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    page === '...'
                      ? 'text-gray-400 cursor-default'
                      : page === currentPage
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Seterus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;