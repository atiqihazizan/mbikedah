// components/reports/ReportBadge.jsx
import { useNavigate } from 'react-router-dom';
import { getReportMetadata } from '../../utils/reportUtils';

/**
 * Badge size configurations
 */
const BADGE_SIZES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm', 
  lg: 'px-4 py-2 text-base'
};

/**
 * Report status color configurations
 */
const STATUS_COLORS = {
  draft: {
    active: 'bg-gray-500 text-white border-gray-500 shadow-md ring-2 ring-gray-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
  },
  pending: {
    active: 'bg-yellow-500 text-white border-yellow-500 shadow-md ring-2 ring-yellow-200',
    inactive: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
  },
  approved: {
    active: 'bg-green-500 text-white border-green-500 shadow-md ring-2 ring-green-200',
    inactive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
  },
  rejected: {
    active: 'bg-red-500 text-white border-red-500 shadow-md ring-2 ring-red-200',
    inactive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
  },
  published: {
    active: 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-200',
    inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
  },
  archived: {
    active: 'bg-purple-500 text-white border-purple-500 shadow-md ring-2 ring-purple-200',
    inactive: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
  },
  completed: {
    active: 'bg-green-500 text-white border-green-500 shadow-md ring-2 ring-green-200',
    inactive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
  }
};

/**
 * Report Badge Component
 * @param {Object} report - Report object with id, title, status, type, etc.
 * @param {boolean} isActive - Whether this report is currently active/selected
 * @param {boolean} hasNotification - Whether this report has notifications
 * @param {number} notificationCount - Number of notifications
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} showIcon - Whether to show report type icon
 * @param {boolean} showStatus - Whether to show status indicator
 * @param {boolean} showPriority - Whether to show priority indicator
 * @param {Function} onClick - Custom click handler (overrides navigation)
 * @param {Function} onEdit - Edit report handler
 * @param {Function} onDelete - Delete report handler
 */
const ReportBadge = ({ 
  report,
  isActive = false, 
  hasNotification = false, 
  notificationCount = 0, 
  size = 'md', 
  showIcon = true,
  showStatus = true,
  showPriority = false,
  onClick = null,
  onEdit = null,
  onDelete = null
}) => {
  const navigate = useNavigate();
  const metadata = getReportMetadata(report.type);

  /**
   * Get size-specific CSS classes
   * @returns {string} CSS classes for badge size
   */
  const getSizeClasses = () => {
    return BADGE_SIZES[size] || BADGE_SIZES.md;
  };

  /**
   * Get color-specific CSS classes based on active state and report status
   * @returns {string} CSS classes for badge colors
   */
  const getColorClasses = () => {
    const statusColors = STATUS_COLORS[report.status] || STATUS_COLORS.draft;
    return isActive ? statusColors.active : statusColors.inactive;
  };

  /**
   * Get base CSS classes for the badge
   * @returns {string} Combined CSS classes
   */
  const getBaseClasses = () => {
    const isClickable = onClick || report.route || report.id;
    
    return `
      inline-flex items-center justify-center font-medium rounded-full border-2 
      transition-all duration-200 relative select-none group
      ${getSizeClasses()} 
      ${getColorClasses()}
      ${isClickable ? 'cursor-pointer hover:shadow-lg transform hover:scale-105 active:scale-95' : ''}
      ${isActive ? 'font-semibold' : ''}
      ${report.priority === 'high' ? 'ring-2 ring-red-300' : ''}
      ${report.priority === 'urgent' ? 'ring-2 ring-red-500 animate-pulse' : ''}
    `.trim();
  };

  /**
   * Handle badge click
   */
  const handleClick = (e) => {
    // Prevent bubbling if clicking action buttons
    if (e.target.closest('.action-button')) {
      return;
    }

    if (onClick) {
      onClick(report);
    } else if (report.route) {
      navigate(report.route);
    } else if (report.id) {
      navigate(`/reports/${report.id}`);
    }
  };

  /**
   * Get tooltip text for badge
   * @returns {string} Tooltip text
   */
  const getTooltipText = () => {
    const statusText = report.status ? ` (${report.status})` : '';
    const priorityText = report.priority ? ` - Priority: ${report.priority}` : '';
    return `${report.title}${statusText}${priorityText}`;
  };

  /**
   * Format notification count for display
   * @param {number} count - Notification count
   * @returns {string} Formatted count
   */
  const formatNotificationCount = (count) => {
    if (count > 999) return '999+';
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <BadgeWrapper
      className={getBaseClasses()}
      onClick={handleClick}
      title={getTooltipText()}
      isClickable={onClick || report.route || report.id}
    >
      <BadgeContent
        report={report}
        metadata={metadata}
        showIcon={showIcon}
        showStatus={showStatus}
        showPriority={showPriority}
        size={size}
        isActive={isActive}
        hasNotification={hasNotification}
        notificationCount={notificationCount}
        formatNotificationCount={formatNotificationCount}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </BadgeWrapper>
  );
};

/**
 * Badge Wrapper Component - handles click behavior
 */
const BadgeWrapper = ({ className, onClick, title, isClickable, children }) => {
  if (isClickable) {
    return (
      <button
        className={className}
        onClick={onClick}
        title={title}
        type="button"
      >
        {children}
      </button>
    );
  }

  return (
    <div className={className} title={title}>
      {children}
    </div>
  );
};

/**
 * Badge Content Component - renders badge interior
 */
const BadgeContent = ({ 
  report,
  metadata, 
  showIcon, 
  showStatus,
  showPriority,
  size, 
  isActive, 
  hasNotification, 
  notificationCount, 
  formatNotificationCount,
  onEdit,
  onDelete
}) => (
  <>
    {/* Report Type Icon */}
    {showIcon && (
      <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} mr-1`}>
        {metadata.icon}
      </span>
    )}

    {/* Report Title */}
    <span className="font-medium truncate max-w-32">
      {/* {size === 'sm' ? (report.shortTitle || report.title?.substring(0, 10) + '...') : report.title} */}
      {report.title}
    </span>

    {/* Priority Indicator */}
    {/* {showPriority && report.priority && (
      <PriorityIndicator priority={report.priority} size={size} />
    )} */}

    {/* Status Indicator */}
    {/* {showStatus && report.status && (
      <StatusIndicator status={report.status} size={size} />
    )} */}

    {/* Notification Badge */}
    {/* {hasNotification && notificationCount > 0 && (
      <NotificationBadge 
        count={formatNotificationCount(notificationCount)}
        size={size}
      />
    )} */}

    {/* Active Indicator */}
    {/* {isActive && <ActiveIndicator />} */}

    {/* Action Buttons (visible on hover) */}
    {/* {(onEdit || onDelete) && (
      <ActionButtons 
        onEdit={onEdit}
        onDelete={onDelete}
        report={report}
        size={size}
      />
    )} */}
  </>
);

/**
 * Priority Indicator Component
 */
const PriorityIndicator = ({ priority, size }) => {
  const getIcon = () => {
    switch (priority) {
      case 'urgent':
        return '🔥';
      case 'high':
        return '⚡';
      case 'medium':
        return '📋';
      case 'low':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} ml-1`}>
      {getIcon()}
    </span>
  );
};

/**
 * Status Indicator Component
 */
const StatusIndicator = ({ status, size }) => {
  const statusConfig = {
    draft: { dot: 'bg-gray-400', text: 'Draft' },
    pending: { dot: 'bg-yellow-400', text: 'Pending' },
    approved: { dot: 'bg-green-400', text: 'Approved' },
    rejected: { dot: 'bg-red-400', text: 'Rejected' },
    published: { dot: 'bg-blue-400', text: 'Published' },
    archived: { dot: 'bg-purple-400', text: 'Archived' },
    completed: { dot: 'bg-green-400', text: 'Completed' }
  };

  const config = statusConfig[status] || statusConfig.draft;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className="flex items-center ml-2">
      <div className={`${dotSize} ${config.dot} rounded-full`}></div>
      {size !== 'sm' && (
        <span className="text-xs ml-1 opacity-75">{config.text}</span>
      )}
    </div>
  );
};

/**
 * Notification Badge Component
 */
const NotificationBadge = ({ count, size }) => {
  const badgeSize = size === 'sm' ? 'min-w-[14px] h-3 text-[10px]' : 'min-w-[16px] h-4 text-xs';
  
  return (
    <div className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold border-2 border-white shadow-sm z-10`}>
      {count}
    </div>
  );
};

/**
 * Active Indicator Component
 */
const ActiveIndicator = () => (
  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-90 shadow-sm"></div>
);

/**
 * Action Buttons Component
 */
const ActionButtons = ({ onEdit, onDelete, report, size }) => (
  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 z-20">
    {onEdit && (
      <button
        className="action-button w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(report);
        }}
        title="Edit report"
      >
        ✏️
      </button>
    )}
    
    {onDelete && (
      <button
        className="action-button w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(report);
        }}
        title="Delete report"
      >
        🗑️
      </button>
    )}
  </div>
);

/**
 * Compact Report Badge - for use in lists or grids
 */
export const CompactReportBadge = ({ report, isSelected, onSelect }) => (
  <div 
    className={`
      p-2 rounded-lg border-2 cursor-pointer transition-all duration-200
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }
    `}
    onClick={() => onSelect(report)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getReportMetadata(report.type).icon}</span>
        <div>
          <div className="font-medium text-sm truncate">{report.title}</div>
          <div className="text-xs text-gray-500">{report.status}</div>
        </div>
      </div>
      
      {report.priority === 'urgent' && (
        <span className="text-red-500 text-lg animate-pulse">🔥</span>
      )}
    </div>
  </div>
);

export default ReportBadge;