// components/DefaultLayout.jsx - Updated dengan custom hooks
import { Outlet } from "react-router-dom";
import { useStateContext } from '../contexts/ContextProvider';

// Import custom components
import PasswordChangeDialog from '../components/dialogs/PasswordChangeDialog';
import MainNavigation from '../components/MainNavigation';

// Import custom hooks
import { useTabNotifications } from '../hooks/useTabNotifications';
import { useUserData } from '../hooks/useUserData';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useActiveRole } from '../hooks/useActiveRole';
import { useUserActions } from '../hooks/useUserActions';
import { useUserDisplayInfo } from '../hooks/useUserDisplayInfo';
import { useTheme } from "../hooks/useTheme";
import Topbar from "../components/header/Topbar";

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
      <Topbar
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
        {/* Main Navigation */}
        <div className="px-4 sm:px-6 lg:px-8">
          <MainNavigation />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8" style={{ height: 'calc(100vh - 8rem)' }}>
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

