// components/SettingsLayout.jsx (Updated dengan currentUser context update)
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useStateContext } from '../contexts/ContextProvider';
import apiClient from '../utils/axios';

// Import custom hooks
import { useTheme } from "../hooks/useTheme";
import { useUserData } from '../hooks/useUserData';
import { useUserDisplayInfo } from '../hooks/useUserDisplayInfo';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useUserActions } from '../hooks/useUserActions';

// Import components
import PasswordChangeDialog from '../components/dialogs/PasswordChangeDialog';

// Import icons
import { FaUser, FaShieldAlt, FaLock, FaBell, FaEye, FaChartLine, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
import BudgetSettings from "../views/settings/BudgetSettings";
import BudgetArchive from "../views/settings/BudgetArchive";
import ProfileSettings from "../views/settings/ProfileSettings";
import BankBalanceSettings from "../views/settings/BankBalanceSettings";
import SecuritySettings from "../views/settings/SecuritySettings";
import PrivacySettings from "../views/settings/PrivacySettings";
import NotificationSettings from "../views/settings/NotificationSettings";
import AppearanceSettings from "../views/settings/AppearanceSettings";

/**
 * Settings Layout Component
 * Provides a consistent settings interface with sidebar navigation
 */
export default function SettingsLayout() {
  const { currentUser, logout } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks usage
  const { userRoles, isLoading, error, refreshUserData } = useUserData(currentUser);
  const { handleLogout, handleSettings, handleProfile } = useUserActions(logout);
  const { isPasswordDialogOpen, setIsPasswordDialogOpen, handleChangePassword, handlePasswordSubmit } = usePasswordChange(handleLogout);
  const userDisplayInfo = useUserDisplayInfo(currentUser);
  const { theme, toggleTheme, isDark } = useTheme();

  // Determine current section from URL
  const currentSection = location.pathname.split('/').pop() || 'profile';

  // Handle back navigation
  const handleBack = () => {
    navigate('/'); // Navigate back to dashboard
  };

  // Don't render anything if no current user
  if (!currentUser) return null;

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <SettingsHeader 
          userDisplayInfo={userDisplayInfo} 
          isDark={isDark} 
          onBack={handleBack} 
          hasUnsavedChanges={false}
        />
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="w-full">
            <SettingsLoadingState isDark={isDark} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SettingsHeader 
        userDisplayInfo={userDisplayInfo} 
        isDark={isDark} 
        onBack={handleBack} 
        hasUnsavedChanges={false}
      />
      <div className="px-4 sm:px-6 lg:px-8 pt-8">
        <div className="w-full">

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <SettingsSidebar 
                currentSection={currentSection} 
                isDark={isDark} 
                userRoles={userRoles} 
              />
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-4 h-[calc(100vh-8.5rem)] overflow-y-auto">
              <SettingsContent 
                currentSection={currentSection}
                userDisplayInfo={userDisplayInfo}
                userRoles={userRoles}
                currentUser={currentUser}
                isDark={isDark}
                theme={theme}
                onToggleTheme={toggleTheme}
                onChangePassword={handleChangePassword}
                onUnsavedChanges={() => {}} // Add empty function for now
                refreshUserData={refreshUserData}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </div>
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
 * Settings Header Component
 */
const SettingsHeader = ({ userDisplayInfo, isDark, onBack, hasUnsavedChanges }) => (
  <header className={`${
    isDark 
      ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-gray-600' 
      : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
  } border-b shadow-lg`}>
    {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className={`mr-4 p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tetapan
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Urus akaun dan keutamaan anda, {userDisplayInfo.name}
              </p>
            </div>
          </div>

          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <div className={`flex items-center text-sm ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              <FaExclamationTriangle className="w-4 h-4 mr-2" />
              Perubahan belum disimpan
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);

/**
 * Settings Sidebar Navigation
 */
const SettingsSidebar = ({ currentSection, isDark, userRoles = [] }) => {
  const navigate = useNavigate();
  
  // Check if user has finance role
  const hasFinanceRole = userRoles.some(role => 
    typeof role === 'string' 
      ? ['finance', 'kewangan'].includes(role.toLowerCase())
      : ['finance', 'kewangan'].includes(role.name?.toLowerCase())
  );

  const baseMenuItems = [
    { id: 'profile', label: 'Profil', icon: FaUser, path: '/settings/profile' },
    { id: 'security', label: 'Keselamatan', icon: FaShieldAlt, path: '/settings/security' },
    // { id: 'privacy', label: 'Privasi', icon: FaLock, path: '/settings/privacy' },
    // { id: 'notifications', label: 'Notifikasi', icon: FaBell, path: '/settings/notifications' },
    // { id: 'appearance', label: 'Penampilan', icon: FaEye, path: '/settings/appearance' },
  ];

  // Finance-specific menu items
  const financeMenuItems = [
    { id: 'budget', label: 'Maklumat Budget', icon: FaChartLine, path: '/settings/budget', requiresFinance: true },
    { id: 'budget-archive', label: 'Arkib Bajet', icon: FaChartLine, path: '/settings/budget-archive', requiresFinance: true },
    { id: 'bank-balance', label: 'Baki Bank', icon: FaMoneyBillWave, path: '/settings/bank-balance', requiresFinance: true },
  ];

  // Combine menu items based on role
  const menuItems = hasFinanceRole 
    ? [...baseMenuItems, ...financeMenuItems]
    : baseMenuItems;

  const handleSectionChange = (path) => {
    navigate(path);
  };

  return (
    <nav className={`${
      isDark ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-sm p-4`}>
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-900 text-blue-200 border border-blue-700'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * Settings Content Area
 */
const SettingsContent = ({ 
  currentSection, 
  userDisplayInfo, 
  userRoles, 
  currentUser,
  theme, 
  isDark, 
  onToggleTheme, 
  onChangePassword,
  onUnsavedChanges,
  refreshUserData
}) => {
  const renderContent = () => {
    switch (currentSection) {
      case 'profile':
        return (
          <ProfileSettings 
            userDisplayInfo={userDisplayInfo}
            userRoles={userRoles}
            currentUser={currentUser}
            isDark={isDark}
            onUnsavedChanges={onUnsavedChanges}
            refreshUserData={refreshUserData} // This now updates context too
          />
        );
      case 'security':
        return (<SecuritySettings isDark={isDark} onChangePassword={onChangePassword}/>);
      case 'privacy':
        return (<PrivacySettings isDark={isDark} />);
      case 'notifications':
        return (<NotificationSettings isDark={isDark} />);
      case 'appearance':
        return (<AppearanceSettings theme={theme} isDark={isDark} onToggleTheme={onToggleTheme} />);
      case 'budget':
        return (<BudgetSettings isDark={isDark} currentUser={currentUser} onUnsavedChanges={onUnsavedChanges}/>);
      case 'budget-archive':
        return (<BudgetArchive isDark={isDark} onUnsavedChanges={onUnsavedChanges} />);
      case 'bank-balance':
        return (<BankBalanceSettings isDark={isDark} currentUser={currentUser} onUnsavedChanges={onUnsavedChanges}/>);
      default:
        return (
          <ProfileSettings 
            userDisplayInfo={userDisplayInfo} 
            userRoles={userRoles}
            currentUser={currentUser}
            isDark={isDark} 
            onUnsavedChanges={onUnsavedChanges}
            refreshUserData={refreshUserData}
          />
        );
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
      {renderContent()}
    </div>
  );
};

/**
 * Loading State Component
 */
const SettingsLoadingState = ({ isDark }) => (
  <div className={`min-h-screen flex items-center justify-center ${
    isDark ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className="text-center">
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
        isDark ? 'border-blue-400' : 'border-blue-600'
      }`}></div>
      <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Memuatkan tetapan...
      </p>
    </div>
  </div>
);