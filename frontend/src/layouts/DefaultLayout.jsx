// components/DefaultLayout.jsx - Updated dengan custom hooks
import { Outlet } from "react-router-dom";
import { useStateContext } from '../contexts/ContextProvider';

// Import custom components
import PasswordChangeDialog from '../components/dialogs/PasswordChangeDialog';
import UserDropdown from '../components/header/UserDropdown';
import RoleBadgesContainer from '../components/roles/RoleBadgesContainer';

// Import custom hooks
import { useTabNotifications } from '../hooks/useTabNotifications';
import { useUserData } from '../hooks/useUserData';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useActiveRole } from '../hooks/useActiveRole';
import { useUserActions } from '../hooks/useUserActions';
import { useUserDisplayInfo } from '../hooks/useUserDisplayInfo';
import { useTheme } from "../hooks/useTheme";
import { FaUserTie } from "react-icons/fa";

/**
 * Default Layout Component - Simplified dengan custom hooks
 */
export default function DefaultLayout() {
  const { currentUser, logout } = useStateContext();
  
  // Custom hooks usage
  const { dashboardData, userRoles, isLoading, error, refreshUserData } = useUserData(currentUser);
  const { handleLogout, handleSettings,handleProfile } = useUserActions(logout);
  const { isPasswordDialogOpen, setIsPasswordDialogOpen, handleChangePassword, handlePasswordSubmit } = usePasswordChange(handleLogout);
  const { currentActiveRole, hasMultipleRoles } = useActiveRole(userRoles);
  const userDisplayInfo = useUserDisplayInfo(currentUser);
  const tabNotifications = useTabNotifications(dashboardData, userRoles);
  const { theme, toggleTheme, isDark } = useTheme();

  // Don't render anything if no current user
  if (!currentUser) return null;

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
        onProfile={handleProfile}
        onRefresh={refreshUserData}
        theme={theme}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
      
      {/* Main Content Area with top padding to account for fixed header */}
      <div className="flex-1 flex flex-col overflow-hidden pt-32">
        {/* Page Content */}
        <main className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 8rem)' }}>
          <Outlet context={{ 
            dashboardData, 
            userRoles, 
            currentActiveRole, 
            tabNotifications, 
            refreshUserData: refreshUserData, 
            isLoading, 
            error,
            theme,
            isDark
          }} />
        </main>

        {/* Password Change Dialog */}
        <PasswordChangeDialog 
          isOpen={isPasswordDialogOpen} 
          onClose={() => setIsPasswordDialogOpen(false)} 
          onSubmit={handlePasswordSubmit} 
        />
      </div>
    </div>
  );
}

/**
 * Header Component - Updated dengan theme support
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
  onProfile,
  onSettings, 
  onRefresh,
  theme,
  onToggleTheme,
  isDark
}) => (
  <header className={`fixed top-0 left-0 right-0 z-50 ${
    isDark 
      ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-gray-600' 
      : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
  } border-b shadow-lg backdrop-blur-sm`}>
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
            isDark={isDark}
          />

          {/* Role Badges */}
          <RoleBadgesSection
            userRoles={userRoles}
            tabNotifications={tabNotifications}
            hasMultipleRoles={hasMultipleRoles}
            isLoading={isLoading}
          />
        </div>
        
        {/* User Dropdown dengan theme toggle */}
        <UserDropdown
          currentUser={userDisplayInfo}
          tabNotifications={tabNotifications}
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          onSettings={onSettings}
          onProfile={onProfile}
          theme={theme}
          onToggleTheme={onToggleTheme}
          isDark={isDark}
        />
      </div>
    </div>
  </header>
);

// Rest of components sama...
const UserInfo = ({ userDisplayInfo, currentActiveRole, isLoading, error, onRefresh, isDark }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center">
      <FaUserTie className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
      <div>
        <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {userDisplayInfo.name}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {userDisplayInfo.department}
        </p>
      </div>
    </div>
    
    {/* Status Indicators */}
    <div className="flex items-center space-x-2">
      {isLoading && (
        <div className={`flex items-center text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${
            isDark ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          Memuat...
        </div>
      )}
      
      {error && (
        <button
          onClick={onRefresh}
          className={`text-sm transition-colors ${
            isDark 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-red-600 hover:text-red-800'
          }`}
          title="Klik untuk cuba semula"
        >
          Ralat - Cuba semula
        </button>
      )}
    </div>
  </div>
);

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