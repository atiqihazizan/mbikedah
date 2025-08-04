import ReportBadgesContainer from "../reports/ReportBadgesContainer";

const ToolbarBadgesSection = ({ userRoles, isLoading }) => {
  console.log(userRoles)
  const reports = [
    {id: 'budget_summary', title: 'Ringkasan Bajet', type: 'budget_summary', status: 'Pending', priority: 'High'},
    {id: 'income_statement', title: 'Penyata Hasil', type: 'income_statement', status: 'Completed', priority: 'Medium'},
    {id: 'revenue_breakdown', title: 'Pecahan Hasil', type: 'revenue_breakdown', status: 'Pending', priority: 'Low'},
    {id: 'expense_breakdown', title: 'Pecahan Belanja', type: 'expense_breakdown', status: 'Completed', priority: 'High'}
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
