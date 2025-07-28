import RoleBadgesSection from "./RoleBadgesSection";
import UserDropdown from "./UserDropdown";
import UserInfo from "./UserInfo";

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
  </header>
);

export default Topbar;
