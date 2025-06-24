// components/roles/RoleBadgesContainer.jsx
import { useLocation } from 'react-router-dom';
import RoleBadge from './RoleBadge';
import { getActiveRoleIndex } from '../../utils/roleUtils';
import { hasRoleNotifications, getRoleNotificationCount } from '../../hooks/useTabNotifications';

/**
 * Container variants configuration
 */
const CONTAINER_VARIANTS = {
  default: 'flex flex-wrap gap-2',
  compact: 'flex flex-wrap gap-1',
  vertical: 'flex flex-col gap-2',
  grid: 'grid grid-cols-2 gap-2'
};

/**
 * Role Badges Container Component
 * @param {Array} userRoles - Array of user roles
 * @param {Object} tabNotifications - Notifications object for each role
 * @param {string} variant - Container layout variant
 * @param {string} size - Badge size to use
 * @param {boolean} showIcons - Whether to show role icons
 * @param {Function} onRoleClick - Custom role click handler
 * @param {string} className - Additional CSS classes
 */
const RoleBadgesContainer = ({ 
  userRoles, 
  tabNotifications = {},
  variant = 'default',
  size = 'md',
  showIcons = true,
  onRoleClick = null,
  className = ''
}) => {
  const location = useLocation();

  // Early return if no roles
  if (!userRoles || userRoles.length === 0) {
    return <EmptyRolesState />;
  }

  const activeRoleIndex = getActiveRoleIndex(location.pathname, userRoles);
  const containerClasses = getContainerClasses(variant, className);

  return (
    <div className={containerClasses}>
      {userRoles.map((role, index) => (
        <RoleBadgeItem
          key={`role-${index}-${role}`}
          role={role}
          index={index}
          isActive={activeRoleIndex === index}
          tabNotifications={tabNotifications}
          size={variant === 'compact' ? 'sm' : size}
          showIcon={showIcons}
          onRoleClick={onRoleClick}
        />
      ))}
      
      {/* Additional Info */}
      {/* {userRoles.length > 1 && (
        <RolesSummary 
          totalRoles={userRoles.length}
          activeRoleIndex={activeRoleIndex}
          tabNotifications={tabNotifications}
          variant={variant}
        />
      )} */}
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
 * Individual Role Badge Item Component
 */
const RoleBadgeItem = ({ 
  role, 
  index, 
  isActive, 
  tabNotifications, 
  size, 
  showIcon, 
  onRoleClick 
}) => {
  const hasNotifications = hasRoleNotifications(tabNotifications, index);
  const notificationCount = getRoleNotificationCount(tabNotifications, index);

  const handleClick = onRoleClick ? () => onRoleClick(index, role) : null;

  return (
    <RoleBadge
      role={role}
      isActive={isActive}
      hasNotification={hasNotifications}
      notificationCount={notificationCount}
      size={size}
      showIcon={showIcon}
      onClick={handleClick}
    />
  );
};

/**
 * Empty Roles State Component
 */
const EmptyRolesState = () => (
  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <div className="text-center">
      <div className="text-gray-400 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">Tiada role ditetapkan</p>
    </div>
  </div>
);

/**
 * Roles Summary Component - shows additional info for multi-role users
 */
const RolesSummary = ({ totalRoles, activeRoleIndex, tabNotifications, variant }) => {
  if (variant === 'compact') return null;

  const totalNotifications = Object.values(tabNotifications).reduce((sum, count) => sum + count, 0);
  const activeRoleName = activeRoleIndex >= 0 ? `Role ${activeRoleIndex + 1}` : 'Tiada role aktif';

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
      <span className="flex items-center">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></span>
        {totalRoles} role tersedia
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
      
      {activeRoleIndex >= 0 && (
        <>
          <span>•</span>
          <span className="text-green-600 font-medium">
            {activeRoleName} aktif
          </span>
        </>
      )}
    </div>
  );
};

/**
 * Role Badges Container with advanced features
 */
export const AdvancedRoleBadgesContainer = ({ 
  userRoles, 
  tabNotifications,
  variant = 'default',
  showSearch = false,
  showSort = false,
  maxVisible = null,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'notifications', 'activity'

  // Filter and sort roles
  const processedRoles = useMemo(() => {
    let filtered = userRoles.filter(role => 
      role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showSort) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'notifications':
            const aNotifications = getRoleNotificationCount(tabNotifications, userRoles.indexOf(a));
            const bNotifications = getRoleNotificationCount(tabNotifications, userRoles.indexOf(b));
            return bNotifications - aNotifications;
          case 'activity':
            // Sort by active status (implement based on your logic)
            return 0;
          default:
            return a.localeCompare(b);
        }
      });
    }

    return maxVisible ? filtered.slice(0, maxVisible) : filtered;
  }, [userRoles, searchTerm, sortBy, tabNotifications, maxVisible]);

  return (
    <div className="space-y-2">
      {/* Search and Sort Controls */}
      {(showSearch || showSort) && (
        <RoleControls
          showSearch={showSearch}
          showSort={showSort}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* Main Container */}
      <RoleBadgesContainer
        userRoles={processedRoles}
        tabNotifications={tabNotifications}
        variant={variant}
        {...props}
      />

      {/* Show More Indicator */}
      {maxVisible && userRoles.length > maxVisible && (
        <div className="text-xs text-gray-500 text-center">
          +{userRoles.length - maxVisible} role lagi
        </div>
      )}
    </div>
  );
};

/**
 * Role Controls Component (Search & Sort)
 */
const RoleControls = ({ 
  showSearch, 
  showSort, 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange 
}) => (
  <div className="flex items-center space-x-2">
    {showSearch && (
      <input
        type="text"
        placeholder="Cari role..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )}
    
    {showSort && (
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="name">Nama</option>
        <option value="notifications">Notifikasi</option>
        <option value="activity">Aktiviti</option>
      </select>
    )}
  </div>
);

export default RoleBadgesContainer;