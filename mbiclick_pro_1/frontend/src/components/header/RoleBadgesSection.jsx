import RoleBadgesContainer from "../roles/RoleBadgesContainer";


const RoleBadgesSection = ({ userRoles, tabNotifications, hasMultipleRoles, isLoading, isDark }) => {
  if (isLoading && userRoles.length === 0) {
    return (
      <div className="flex space-x-2">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className={`h-8 w-20 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
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

export default RoleBadgesSection;
