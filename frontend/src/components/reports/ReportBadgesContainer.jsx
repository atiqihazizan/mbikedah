// components/reports/ReportBadgesContainer.jsx
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getActiveReportIndex, sortReportsByPriority, sortReportsByStatus, sortReportsByDate } from '../../utils/reportUtils';
import ReportBadge,{CompactReportBadge} from './ReportBadge';

/**
 * Container variants configuration
 */
const CONTAINER_VARIANTS = {
  default: 'flex flex-wrap gap-2',
  compact: 'flex flex-wrap gap-1',
  vertical: 'flex flex-col gap-2',
  grid: 'grid grid-cols-2 gap-2',
  list: 'space-y-1'
};

/**
 * Report Badges Container Component
 * @param {Array} reports - Array of report objects
 * @param {Object} reportNotifications - Notifications object for each report
 * @param {string} variant - Container layout variant
 * @param {string} size - Badge size to use
 * @param {boolean} showIcons - Whether to show report type icons
 * @param {boolean} showStatus - Whether to show status indicators
 * @param {boolean} showPriority - Whether to show priority indicators
 * @param {Function} onReportClick - Custom report click handler
 * @param {Function} onEdit - Edit report handler
 * @param {Function} onDelete - Delete report handler
 * @param {string} className - Additional CSS classes
 */
const ReportBadgesContainer = ({ 
  userRoles=[],
  reports = [],
  reportNotifications = {},
  variant = 'default',
  size = 'md',
  showIcons = true,
  showStatus = true,
  showPriority = false,
  onReportClick = null,
  onEdit = null,
  onDelete = null,
  className = ''
}) => {
  const location = useLocation();

  // Early return if no reports
  if (!reports || reports.length === 0) {
    return <EmptyReportsState />;
  }

  const activeReportIndex = getActiveReportIndex(location.pathname, reports);
  const containerClasses = getContainerClasses(variant, className);

  return (
    <div className={containerClasses}>
      {reports.map((report, index) => (
        <ReportBadgeItem
          key={`report-${report.id || index}`}
          report={report}
          index={index}
          isActive={activeReportIndex === index}
          reportNotifications={reportNotifications}
          size={variant === 'compact' ? 'sm' : size}
          showIcon={showIcons}
          showStatus={showStatus}
          showPriority={showPriority}
          onReportClick={onReportClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/**
 * Get container CSS classes based on variant
 * @param {string} variant - Container variant
 * @param {string} additionalClasses - Additional CSS classes
 * @returns {string} Combined CSS classes
 */
const getContainerClasses = (variant, additionalClasses) => {
  const baseClasses = CONTAINER_VARIANTS[variant] || CONTAINER_VARIANTS.default;
  return `${baseClasses} ${additionalClasses}`.trim();
};

/**
 * Individual Report Badge Item Component
 */
const ReportBadgeItem = ({ 
  report, 
  index, 
  isActive, 
  reportNotifications, 
  size, 
  showIcon, 
  showStatus,
  showPriority,
  onReportClick,
  onEdit,
  onDelete
}) => {
  const hasNotifications = reportNotifications[report.id] > 0;
  const notificationCount = reportNotifications[report.id] || 0;

  const handleClick = onReportClick ? () => onReportClick(report) : null;
  const handleEdit = onEdit ? () => onEdit(report) : null;
  const handleDelete = onDelete ? () => onDelete(report) : null;

  return (
    <ReportBadge
      report={report}
      isActive={isActive}
      hasNotification={hasNotifications}
      notificationCount={notificationCount}
      size={size}
      showIcon={showIcon}
      showStatus={showStatus}
      showPriority={showPriority}
      onClick={handleClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

/**
 * Empty Reports State Component
 */
const EmptyReportsState = () => (
  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <div className="text-center">
      <div className="text-gray-400 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">Tiada laporan tersedia</p>
      <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
        Buat laporan baru
      </button>
    </div>
  </div>
);

/**
 * Reports Summary Component - shows additional info for multi-report view
 */
const ReportsSummary = ({ reports, activeReportIndex, reportNotifications, variant }) => {
  if (variant === 'compact') return null;

  const totalNotifications = Object.values(reportNotifications).reduce((sum, count) => sum + count, 0);
  const activeReport = activeReportIndex >= 0 ? reports[activeReportIndex] : null;
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
      <span className="flex items-center">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></span>
        {reports.length} laporan
      </span>
      
      {totalNotifications > 0 && (
        <>
          <span>•</span>
          <span className="flex items-center text-red-600">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
            {totalNotifications} notifikasi
          </span>
        </>
      )}
      
      {statusCounts.pending > 0 && (
        <>
          <span>•</span>
          <span className="flex items-center text-yellow-600">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>
            {statusCounts.pending} pending
          </span>
        </>
      )}
      
      {activeReport && (
        <>
          <span>•</span>
          <span className="text-green-600 font-medium">
            {activeReport.title} aktif
          </span>
        </>
      )}
    </div>
  );
};

/**
 * Report Badges Container with advanced features
 */
export const AdvancedReportBadgesContainer = ({ 
  reports = [],
  reportNotifications = {},
  variant = 'default',
  showSearch = false,
  showSort = false,
  showFilter = false,
  maxVisible = null,
  defaultSort = 'date',
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(defaultSort); // 'date', 'title', 'status', 'priority'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Process reports (filter, search, sort)
  const processedReports = useMemo(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(report => report.priority === filterPriority);
    }

    // Apply sorting
    if (showSort) {
      switch (sortBy) {
        case 'title':
          filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        case 'status':
          filtered = sortReportsByStatus(filtered);
          break;
        case 'priority':
          filtered = sortReportsByPriority(filtered);
          break;
        case 'notifications':
          filtered.sort((a, b) => {
            const aNotifications = reportNotifications[a.id] || 0;
            const bNotifications = reportNotifications[b.id] || 0;
            return bNotifications - aNotifications;
          });
          break;
        case 'date':
        default:
          filtered = sortReportsByDate(filtered);
          break;
      }
    }

    return maxVisible ? filtered.slice(0, maxVisible) : filtered;
  }, [reports, searchTerm, sortBy, filterStatus, filterPriority, reportNotifications, maxVisible, showSort]);

  const remainingCount = reports.length - (processedReports.length >= maxVisible ? maxVisible : processedReports.length);

  return (
    <div className="space-y-3">
      {/* Search, Sort, and Filter Controls */}
      {(showSearch || showSort || showFilter) && (
        <ReportControls
          showSearch={showSearch}
          showSort={showSort}
          showFilter={showFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          reports={reports}
        />
      )}

      {/* Main Container */}
      <ReportBadgesContainer
        reports={processedReports}
        reportNotifications={reportNotifications}
        variant={variant}
        {...props}
      />

      {/* Summary */}
      <ReportsSummary
        reports={processedReports}
        activeReportIndex={-1}
        reportNotifications={reportNotifications}
        variant={variant}
      />

      {/* Show More Indicator */}
      {maxVisible && remainingCount > 0 && (
        <div className="text-xs text-gray-500 text-center">
          +{remainingCount} laporan lagi
        </div>
      )}
    </div>
  );
};

/**
 * Report Controls Component (Search, Sort & Filter)
 */
const ReportControls = ({ 
  showSearch, 
  showSort, 
  showFilter,
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
  reports
}) => {
  // Get unique statuses and priorities from reports
  const uniqueStatuses = [...new Set(reports.map(r => r.status))].filter(Boolean);
  const uniquePriorities = [...new Set(reports.map(r => r.priority))].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showSearch && (
        <input
          type="text"
          placeholder="Cari laporan..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-32"
        />
      )}
      
      {showSort && (
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="date">Tarikh</option>
          <option value="title">Nama</option>
          <option value="status">Status</option>
          <option value="priority">Keutamaan</option>
          <option value="notifications">Notifikasi</option>
        </select>
      )}

      {showFilter && (
        <>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => onFilterPriorityChange(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Keutamaan</option>
            {uniquePriorities.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

/**
 * Quick Filter Chips Component
 */
export const ReportFilterChips = ({ reports, onFilterChange, activeFilters = {} }) => {
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = reports.reduce((acc, report) => {
    acc[report.priority] = (acc[report.priority] || 0) + 1;
    return acc;
  }, {});

  const handleChipClick = (type, value) => {
    onFilterChange(type, activeFilters[type] === value ? 'all' : value);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {/* Status Chips */}
      {Object.entries(statusCounts).map(([status, count]) => (
        <button
          key={status}
          onClick={() => handleChipClick('status', status)}
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
            activeFilters.status === status
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {status} ({count})
        </button>
      ))}

      {/* Priority Chips */}
      {Object.entries(priorityCounts).map(([priority, count]) => (
        <button
          key={priority}
          onClick={() => handleChipClick('priority', priority)}
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
            activeFilters.priority === priority
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {priority} ({count})
        </button>
      ))}
    </div>
  );
};

export default ReportBadgesContainer;