import ReportBadgesContainer from "../reports/ReportBadgesContainer";
import { usePermissions } from "../../hooks/usePermissions";

const ToolbarBadgesSection = ({ userRoles, isLoading }) => {
  // Get dynamic reports based on user permissions
  const { reportItems } = usePermissions();
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
      <ReportBadgesContainer 
        userRoles={userRoles} 
        variant={'default'} 
        size="md" 
        showIcons={true}
        reports={reportItems}
      />
    </div>
  );
};

export default ToolbarBadgesSection;
