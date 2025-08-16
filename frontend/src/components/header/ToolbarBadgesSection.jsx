import ReportBadgesContainer from "../reports/ReportBadgesContainer";

const ToolbarBadgesSection = ({ userRoles, isLoading }) => {
  
  const reports = [
    {
      id: 'budget_summary', 
      title: 'Ringkasan Bajet', 
      type: 'budget_summary', 
      status: 'Completed', 
      priority: 'High',
      route: '/reports/budget_summary'
    },
    {
      id: 'income_statement', 
      title: 'Penyata Hasil & Belanja', 
      type: 'income_statement', 
      status: 'Completed', 
      priority: 'High',
      route: '/reports/income_statement'
    },
    {
      id: 'revenue_breakdown', 
      title: 'Pecahan Hasil', 
      type: 'revenue_breakdown', 
      status: 'Completed', 
      priority: 'Medium',
      route: '/reports/revenue_breakdown'
    },
    {
      id: 'expense_breakdown', 
      title: 'Pecahan Belanja', 
      type: 'expense_breakdown', 
      status: 'Completed', 
      priority: 'High',
      route: '/reports/expense_breakdown'
    }
  ]
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
        reports={reports}
      />
    </div>
  );
};

export default ToolbarBadgesSection;
