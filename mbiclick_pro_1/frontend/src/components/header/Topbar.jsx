import RoleBadgesSection from "./RoleBadgesSection";
import FinancialReportsDropdown from "./FinancialReportsDropdown";
import UserDropdown from "./UserDropdown";
import UserInfo from "./UserInfo";
import { usePermissions } from "../../hooks/usePermissions";

const Topbar = ({
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
}) => {
  // Use dynamic permissions instead of hardcoded role checking
  const { canAccessReports } = usePermissions();
  
  return (
  <header className={`fixed top-0 left-0 right-0 z-50 ${
    isDark 
      ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-gray-600' 
      : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
  } border-b shadow-lg backdrop-blur-sm`}>
    <div className="p-4">
      {/* Row 1: User Info and User Dropdown */}
      <div className="flex items-start justify-between mb-3">
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
        </div>
        
        <div className="flex items-center">
          {/* User Dropdown dengan theme toggle */}
          <UserDropdown
            userRoles={userRoles}
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

      {/* Row 2: Navigation Bar - Role Badges + Financial Reports Dropdown */}
      <div className="flex items-center justify-between">
        {/* Left: Role Badges Navigation */}
        <div className="flex items-center gap-2">
          <RoleBadgesSection
            userRoles={userRoles}
            tabNotifications={tabNotifications}
            hasMultipleRoles={hasMultipleRoles}
            isLoading={isLoading}
            isDark={isDark}
          />
        </div>
        
        {/* Right: Financial Reports Dropdown Button */}
        {canAccessReports && (
          <div className="flex items-center">
            <FinancialReportsDropdown isDark={isDark} isPillButton={true} />
          </div>
        )}
      </div>
    </div>
  </header>
  );
};

export default Topbar;
