// components/DefaultLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { toast } from 'react-toastify';
import apiClient from '../axios';
import Sidebar from "./Sidebar";
import { FaUserTie } from 'react-icons/fa';

// Import custom components
import PasswordChangeDialog from './dialogs/PasswordChangeDialog';
import UserDropdown from './header/UserDropdown';
import RoleBadgesContainer from './roles/RoleBadgesContainer';

// Import custom hooks and utilities
import { useTabNotifications } from '../hooks/useTabNotifications';
import { getRoleMetadata } from '../utils/roleUtils';

/**
 * Default Layout Component
 * Main layout wrapper that provides navigation, user management, and role switching
 */
export default function DefaultLayout() {
  const { currentUser, logout } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [dashboardData, setDashboardData] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom hooks
  const tabNotifications = useTabNotifications(dashboardData, userRoles);

  /**
   * Fetch user data and roles from API
   */
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/dashboard');
      if (response.success) {
        setDashboardData(response.data || {});
        setUserRoles(response.user_roles || []);
      } else {
        throw new Error(response.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Error loading user data');
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize user data when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  /**
   * Get current active role based on current route
   * @returns {string|null} Current active role name
   */
  const getCurrentActiveRole = () => {
    const currentPath = location.pathname;
    
    for (let i = 0; i < userRoles.length; i++) {
      const role = userRoles[i];
      const metadata = getRoleMetadata(role);
      
      if (metadata.matchPaths && metadata.matchPaths.some(path => {
        if (path === '/') return currentPath === '/';
        return currentPath.startsWith(path);
      })) {
        return role;
      }
    }
    
    return userRoles[0] || null;
  };

  const currentActiveRole = getCurrentActiveRole();
  const hasMultipleRoles = userRoles.length > 1;

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berjaya log keluar');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ralat semasa log keluar');
    }
  };

  /**
   * Handle password change request
   */
  const handleChangePassword = () => {
    setIsPasswordDialogOpen(true);
  };

  /**
   * Handle password change form submission
   * @param {Object} passwordData - Password form data
   */
  const handlePasswordSubmit = async (passwordData) => {
    try {
      const response = await apiClient.post('/change-password', passwordData);
      
      if (!response.success) {
        throw new Error(response.message || 'Gagal menukar kata laluan');
      }
      
      toast.success('Kata laluan berjaya dikemaskini');
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menukar kata laluan';
      throw new Error(errorMessage);
    }
  };

  /**
   * Handle settings navigation
   */
  const handleSettings = () => {
    toast.info('Settings not implemented yet');
    // navigate('/settings');
  };

  /**
   * Get user display information
   * @returns {Object} User display data
   */
  const getUserDisplayInfo = () => ({
    name: currentUser?.name || 'Pengguna',
    department: currentUser?.department || 'Tiada jabatan',
    email: currentUser?.email || 'Tiada email'
  });

  const userDisplayInfo = getUserDisplayInfo();

  // Don't render anything if no current user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      {/* <Sidebar /> */}
      
      {/* Fixed Header */}
      <Header
        userDisplayInfo={userDisplayInfo}
        userRoles={userRoles}
        currentActiveRole={currentActiveRole}
        hasMultipleRoles={hasMultipleRoles}
        tabNotifications={tabNotifications}
        isLoading={isLoading}
        error={error}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        onSettings={handleSettings}
        onRefresh={fetchUserData}
      />
      
      {/* Main Content Area with top padding to account for fixed header */}
      <div className="flex-1 flex flex-col overflow-hidden pt-32">
        {/* Page Content */}
        <main className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 8rem)' }}>
          <Outlet context={{ dashboardData, userRoles, currentActiveRole, tabNotifications, refreshUserData: fetchUserData, isLoading, error }} />
        </main>

        {/* Password Change Dialog */}
        <PasswordChangeDialog isOpen={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} onSubmit={handlePasswordSubmit} />
      </div>
    </div>
  );
}

/**
 * Header Component
 * Contains user info, role badges, and user dropdown
 */
const Header = ({
  userDisplayInfo,
  userRoles,
  currentActiveRole,
  hasMultipleRoles,
  tabNotifications,
  isLoading,
  error,
  onLogout,
  onChangePassword,
  onSettings,
  onRefresh
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 shadow-lg backdrop-blur-sm">
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* User Information */}
          <UserInfo 
            userDisplayInfo={userDisplayInfo}
            currentActiveRole={currentActiveRole}
            isLoading={isLoading}
            error={error}
            onRefresh={onRefresh}
          />

          {/* Role Badges */}
          <RoleBadgesSection
            userRoles={userRoles}
            tabNotifications={tabNotifications}
            hasMultipleRoles={hasMultipleRoles}
            isLoading={isLoading}
          />

          {/* Current Active Role Info */}
          {/* <ActiveRoleInfo 
            currentActiveRole={currentActiveRole}
            hasMultipleRoles={hasMultipleRoles}
          /> */}
        </div>
        
        {/* User Dropdown */}
        <UserDropdown
          currentUser={userDisplayInfo}
          tabNotifications={tabNotifications}
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          onSettings={onSettings}
        />
      </div>
    </div>
  </header>
);

/**
 * User Info Component
 */
const UserInfo = ({ userDisplayInfo, currentActiveRole, isLoading, error, onRefresh }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center">
      <FaUserTie className="w-5 h-5 mr-2 text-blue-600" />
      <div>
        <h2 className="font-bold text-lg text-gray-800">
          {userDisplayInfo.name}
        </h2>
        <p className="text-gray-600 text-sm">
          {userDisplayInfo.department}
        </p>
      </div>
    </div>
    
    {/* Status Indicators */}
    <div className="flex items-center space-x-2">
      {isLoading && (
        <div className="flex items-center text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Memuat...
        </div>
      )}
      
      {error && (
        <button
          onClick={onRefresh}
          className="text-red-600 text-sm hover:text-red-800 transition-colors"
          title="Klik untuk cuba semula"
        >
          Ralat - Cuba semula
        </button>
      )}
    </div>
  </div>
);

/**
 * Role Badges Section Component
 */
const RoleBadgesSection = ({ userRoles, tabNotifications, hasMultipleRoles, isLoading }) => {
  if (isLoading && userRoles.length === 0) {
    return (
      <div className="mb-2">
        <div className="flex space-x-2">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <RoleBadgesContainer
        userRoles={userRoles}
        tabNotifications={tabNotifications}
        variant={hasMultipleRoles ? 'default' : 'compact'}
        size="md"
        showIcons={true}
      />
    </div>
  );
};

/**
 * Active Role Info Component
 */
const ActiveRoleInfo = ({ currentActiveRole, hasMultipleRoles }) => {
  if (!currentActiveRole || !hasMultipleRoles) return null;

  return (
    <div className="mt-2 text-sm text-gray-600">
      <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        Sedang menggunakan: 
        <span className="font-medium ml-1 text-green-700">
          {currentActiveRole}
        </span>
      </span>
    </div>
  );
};