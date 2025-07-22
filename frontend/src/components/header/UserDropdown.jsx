// components/header/UserDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  FaBell, 
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaKey,
  FaUserCog,
  FaCog
} from 'react-icons/fa';
import { getTotalNotifications } from '../../hooks/useTabNotifications';

/**
 * User Dropdown Component
 * @param {Object} currentUser - Current logged in user data
 * @param {Object} tabNotifications - Notifications for each role tab
 * @param {Function} onLogout - Logout handler function
 * @param {Function} onChangePassword - Change password handler
 * @param {Function} onSettings - Settings handler
 */
const UserDropdown = ({ 
  currentUser, 
  tabNotifications, 
  onLogout,
  onChangePassword,
  onProfile,
  onSettings 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalNotifications = getTotalNotifications(tabNotifications);

  /**
   * Get user's initials for avatar
   * @param {string} name - User's full name
   * @returns {string} User initials (max 2 characters)
   */
  const getUserInitials = (name) => {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  /**
   * Menu items configuration
   */
  const menuItems = [
    {
      icon: FaKey,
      label: 'Tukar Kata Laluan',
      action: () => {
        onChangePassword?.();
        setIsOpen(false);
      },
      description: 'Kemaskini kata laluan akaun',
    },
    {
      icon: FaCog,
      label: 'Tetapan',
      action: () => {
        onSettings?.();
        setIsOpen(false);
      },
      description: 'Konfigurasi tetapan sistem',
    },
    {
      type: 'divider'
    },
    {
      icon: FaSignOutAlt,
      label: 'Log Keluar',
      action: () => {
        onLogout?.();
        setIsOpen(false);
      },
      description: 'Keluar dari sistem',
      danger: true
    }
  ];

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Notification Bell */}
        <NotificationBell count={totalNotifications} onClick={() => console.log('Open notifications')} />

        {/* User Avatar & Dropdown Toggle */}
        <UserAvatarButton user={currentUser} isOpen={isOpen} onClick={toggleDropdown} getUserInitials={getUserInitials} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <DropdownMenu
          currentUser={currentUser}
          menuItems={menuItems}
          totalNotifications={totalNotifications}
          getUserInitials={getUserInitials}
        />
      )}
    </div>
  );
};

/**
 * Notification Bell Component
 */
const NotificationBell = ({ count, onClick }) => (
  <div className="relative">
    <button 
      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-white/50"
      onClick={onClick}
      title={`${count} notifikasi ${count > 0 ? 'baru' : ''}`}
    >
      <FaBell className="w-5 h-5" />
    </button>
    {count > 0 && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </div>
);

/**
 * User Avatar Button Component
 */
const UserAvatarButton = ({ user, isOpen, onClick, getUserInitials }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
    title={`${user?.name || 'Pengguna'} - Click untuk menu`}
  >
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
      {getUserInitials(user?.name)}
    </div>
    {isOpen ? (
      <FaChevronUp className="w-3 h-3 text-gray-400" />
    ) : (
      <FaChevronDown className="w-3 h-3 text-gray-400" />
    )}
  </button>
);

/**
 * Dropdown Menu Component
 */
const DropdownMenu = ({ currentUser, menuItems, totalNotifications, getUserInitials }) => (
  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
    {/* User Info Header */}
    <UserInfoHeader user={currentUser} getUserInitials={getUserInitials}/>

    {/* Menu Items */}
    <div className="py-1">
      {menuItems.map((item, index) => {
        if (item.type === 'divider') return <MenuDivider key={index} />;
        return <MenuItem key={index}item={item}/>
      })}
    </div>

    {/* Notifications Footer */}
    {totalNotifications > 0 && (<NotificationsFooter count={totalNotifications} />)}
  </div>
);

/**
 * User Info Header Component
 */
const UserInfoHeader = ({ user, getUserInitials }) => (
  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
        {getUserInitials(user?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.name || 'Pengguna'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user?.email || 'Tiada email'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user?.department || 'Tiada jabatan'}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Menu Item Component
 */
const MenuItem = ({ item }) => {
  const IconComponent = item.icon;
  
  return (
    <button
      onClick={item.action}
      className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
        item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
      }`}
      title={item.description}
    >
      <IconComponent className={`w-4 h-4 ${item.danger ? 'text-red-500' : 'text-gray-400'}`} />
      <div className="flex-1">
        <div className={`text-sm font-medium ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>
          {item.label}
        </div>
        <div className="text-xs text-gray-500">
          {item.description}
        </div>
      </div>
    </button>
  );
};

/**
 * Menu Divider Component
 */
const MenuDivider = () => (
  <div className="border-t border-gray-200 my-1"></div>
);

/**
 * Notifications Footer Component
 */
const NotificationsFooter = ({ count }) => (
  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
    <div className="text-xs text-gray-500 flex items-center justify-between">
      <span>Notifikasi aktif</span>
      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  </div>
);

export default UserDropdown;