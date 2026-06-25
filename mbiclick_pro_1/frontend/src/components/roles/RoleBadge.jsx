// components/roles/RoleBadge.jsx
import { useNavigate } from 'react-router-dom';
import { getRoleMetadata } from '../../utils/roleUtils';

/**
 * Badge size configurations
 */
const BADGE_SIZES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm', 
  lg: 'px-4 py-2 text-base'
};

/**
 * Role Badge Component
 * @param {string} role - Role name
 * @param {boolean} isActive - Whether this role is currently active
 * @param {boolean} hasNotification - Whether this role has notifications
 * @param {number} notificationCount - Number of notifications
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} showIcon - Whether to show role icon
 * @param {Function} onClick - Custom click handler (overrides navigation)
 */
const RoleBadge = ({ 
  role, 
  isActive = false, 
  hasNotification = false, 
  notificationCount = 0, 
  size = 'md', 
  showIcon = true, 
  onClick = null 
}) => {
  const navigate = useNavigate();
  const metadata = getRoleMetadata(role);

  /**
   * Get size-specific CSS classes
   * @returns {string} CSS classes for badge size
   */
  const getSizeClasses = () => {
    return BADGE_SIZES[size] || BADGE_SIZES.md;
  };

  /**
   * Get color-specific CSS classes based on active state and role color
   * @returns {string} CSS classes for badge colors
   */
  const getColorClasses = () => {
    const { color } = metadata;
    
    if (isActive) {
      switch (color) {
        case 'purple':
          return 'bg-purple-500 text-white border-purple-500 shadow-md ring-2 ring-purple-200';
        case 'blue':
          return 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-200';
        case 'green':
          return 'bg-green-500 text-white border-green-500 shadow-md ring-2 ring-green-200';
        default:
          return 'bg-gray-500 text-white border-gray-500 shadow-md ring-2 ring-gray-200';
      }
    } else {
      switch (color) {
        case 'purple':
          return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300';
        case 'blue':
          return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
        case 'green':
          return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
      }
    }
  };

  /**
   * Get base CSS classes for the badge
   * @returns {string} Combined CSS classes
   */
  const getBaseClasses = () => {
    const isClickable = onClick || metadata.route;
    
    return `
      inline-flex items-center justify-center font-medium rounded-full border-2 
      transition-all duration-200 relative select-none
      ${getSizeClasses()} 
      ${getColorClasses()}
      ${isClickable ? 'cursor-pointer hover:shadow-lg transform hover:scale-105 active:scale-95' : ''}
      ${isActive ? 'font-semibold' : ''}
    `.trim();
  };

  /**
   * Handle badge click
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (metadata.route) {
      navigate(metadata.route);
    }
  };

  /**
   * Get tooltip text for badge
   * @returns {string} Tooltip text
   */
  const getTooltipText = () => {
    if (isActive) {
      return `Role aktif: ${role}`;
    }
    
    if (onClick || metadata.route) {
      return `Navigate to ${role} ${metadata.route === '/' ? 'applicant' : 'page'}`;
    }
    
    return metadata.description;
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
      isClickable={onClick || metadata.route}
    >
      <BadgeContent
        metadata={metadata}
        role={role}
        showIcon={showIcon}
        size={size}
        isActive={isActive}
        hasNotification={hasNotification}
        notificationCount={notificationCount}
        formatNotificationCount={formatNotificationCount}
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
  metadata, 
  role, 
  showIcon, 
  size, 
  isActive, 
  hasNotification, 
  notificationCount, 
  formatNotificationCount 
}) => (
  <>
    {/* Role Icon */}
    {showIcon && (
      <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} mr-1`}>
        {metadata.icon}
      </span>
    )}

    {/* Role Name */}
    <span className="font-medium truncate">
      {size === 'sm' ? metadata.shortName : role}
    </span>

    {/* Notification Badge */}
    {hasNotification && notificationCount > 0 && (
      <NotificationBadge 
        count={formatNotificationCount(notificationCount)}
        size={'sm'}
      />
    )}

    {/* Active Indicator */}
    {isActive && <ActiveIndicator />}
  </>
);

/**
 * Notification Badge Component
 */
const NotificationBadge = ({ count, size }) => {
  const badgeSize = size === 'sm' ? 'min-w-[16px] h-4 text-[10px]' : 'min-w-[16px] h-4 text-xs';
  return (
    // <div className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
    <div className={`absolute -top-2 -right-1 bg-red-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold border-white shadow-sm`}>
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

export default RoleBadge;