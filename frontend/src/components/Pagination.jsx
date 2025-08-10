import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  lastPage, 
  total, 
  perPage, 
  onPageChange, 
  onPerPageChange,
  showPerPageSelector = true,
  className = ""
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    if (onPerPageChange) {
      onPerPageChange(parseInt(newPerPage));
    }
  };

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (lastPage <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(lastPage, start + maxVisiblePages - 1);
      
      // Adjust start if end is too close to last page
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (lastPage <= 1) {
    return null; // Don't show pagination if only one page
  }

  const pageNumbers = getPageNumbers();
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Page Info */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Per Page Selector */}
        {showPerPageSelector && onPerPageChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(parseInt(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <FaAngleDoubleLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(lastPage)}
          disabled={currentPage === lastPage}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <FaAngleDoubleRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
