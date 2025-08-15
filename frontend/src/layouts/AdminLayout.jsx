// components/AdminLayout.jsx - Admin-specific layout
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useTheme } from "../hooks/useTheme";
import { useUserData } from '../hooks/useUserData';
import { useUserDisplayInfo } from '../hooks/useUserDisplayInfo';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useUserActions } from '../hooks/useUserActions';

// Import components
import PasswordChangeDialog from '../components/dialogs/PasswordChangeDialog';

// Import icons
import { 
  FaUser, 
  FaShieldAlt, 
  FaCog, 
  FaChartBar, 
  FaUsers, 
  FaUserTie, 
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaBuilding
} from 'react-icons/fa';

/**
 * Admin Layout Component
 * Provides a consistent admin interface with sidebar navigation
 */
export default function AdminLayout() {
  const { currentUser, logout } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom hooks usage
  const { userRoles, isLoading, error, refreshUserData } = useUserData(currentUser);
  const { handleLogout, handleSettings, handleProfile } = useUserActions(logout);
  const { isPasswordDialogOpen, setIsPasswordDialogOpen, handleChangePassword, handlePasswordSubmit } = usePasswordChange(handleLogout);
  const userDisplayInfo = useUserDisplayInfo(currentUser);
  const { theme, toggleTheme, isDark } = useTheme();

  // Determine current section from URL
  const currentSection = location.pathname.split('/').pop() || 'dashboard';



  // Don't render anything if no current user
  if (!currentUser) return null;

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <AdminHeader 
          userDisplayInfo={userDisplayInfo} 
          isDark={isDark} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="w-full">
            <AdminLoadingState isDark={isDark} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar 
          currentSection={currentSection} 
          isDark={isDark}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <AdminHeader 
          userDisplayInfo={userDisplayInfo} 
          isDark={isDark} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Password Change Dialog */}
      <PasswordChangeDialog 
        isOpen={isPasswordDialogOpen} 
        onClose={() => setIsPasswordDialogOpen(false)} 
        onSubmit={handlePasswordSubmit} 
      />
    </div>
  );
}

/**
 * Admin Header Component
 */
const AdminHeader = ({ 
  userDisplayInfo, 
  isDark, 
  onToggleSidebar, 
  sidebarOpen,
  onLogout,
  onToggleTheme,
  theme
}) => (
  <header className={`${
    isDark 
      ? 'bg-gray-800 border-gray-600' 
      : 'bg-blue-500 border-blue-200'
  } border-b shadow-lg text-white`}>
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden mr-3 p-2 rounded-lg transition-colors text-white hover:bg-white hover:bg-opacity-20"
            >
              {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
            

            
            <div>
              <h1 className="text-2xl font-bold">
                Admin Dashboard
              </h1>
              <p className="text-sm text-blue-100">
                Welcome back, {userDisplayInfo.name}
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg transition-colors text-white hover:bg-white hover:bg-opacity-20"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 rounded-lg transition-colors text-white hover:bg-white hover:bg-opacity-20"
            >
              <FaSignOutAlt className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);

/**
 * Admin Sidebar Navigation
 */
const AdminSidebar = ({ currentSection, isDark, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Admin menu items
  const adminMenuItems = [
    {
      id: 'dashboard',
      icon: FaChartBar,
      label: "Dashboard",
      path: "/admin/dashboard",
      description: "Overview and statistics"
    },
    {
      id: 'users',
      icon: FaUsers,
      label: "User Management",
      path: "/admin/users",
      description: "Manage system users"
    },
    {
      id: 'departments',
      icon: FaBuilding,
      label: "Department Management",
      path: "/admin/departments",
      description: "Manage departments"
    },
    {
      id: 'roles',
      icon: FaUserTie,
      label: "Role Management",
      path: "/admin/roles",
      description: "Manage user roles and permissions"
    },
    {
      id: 'system',
      icon: FaCog,
      label: "System Settings",
      path: "/admin/system",
      description: "Configure system settings"
    }
  ];

  const handleSectionChange = (path) => {
    navigate(path);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className={`h-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Sidebar header */}
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-blue-600' : 'bg-blue-100'
          }`}>
            <FaShieldAlt className={`w-6 h-6 ${isDark ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className="ml-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              System Administration
            </p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.path)}
                className={`w-full flex items-start px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-blue-900 text-blue-200 border border-blue-700'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                <Icon className={`w-5 h-5 mr-3 mt-0.5 ${
                  isActive ? '' : 'opacity-70'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs mt-1 ${
                    isActive 
                      ? isDark ? 'text-blue-300' : 'text-blue-600'
                      : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

/**
 * Admin Loading State Component
 */
const AdminLoadingState = ({ isDark }) => (
  <div className={`min-h-screen flex items-center justify-center ${
    isDark ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className="text-center">
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
        isDark ? 'border-blue-400' : 'border-blue-600'
      }`}></div>
      <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Loading admin panel...
      </p>
    </div>
  </div>
);