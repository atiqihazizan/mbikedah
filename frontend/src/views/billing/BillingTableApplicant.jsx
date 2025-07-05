import React from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, useBillingTableApplicant } from '../../hooks';
import { BillingFormDialog } from '../../components/dialogs';
import { UnifiedCard, UnifiedBillingTable, TButton } from '../../components/Core';

function BillingTableApplicant() {
  const { currentUser } = useStateContext();
  
  // TanStack Query hook untuk get dashboard data
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  // Custom hook untuk manage Applicant table logic
  const {
    // State values
    activeTab,
    showBillingDialog,
    selectedBillingId,
    dialogMode,
    
    // Data values
    filteredApplications,
    statistics,
    
    // Configuration objects
    cardConfigurations,
    applicantColumns,
    returnedBillingsAlert,
    emptyStateConfig,
    
    // Event handlers
    handleTabChange,
    handleCreateNew,
    handleDialogClose,
    handleDialogSaved,
    handleRefresh,
    
    // Render functions
    getActionsConfig,
    getEmptyActionConfig,
    
    // Helper functions
    getTableTitle,
    
    // Feature flags
    features
  } = useBillingTableApplicant(dashboardData, refetch);

  // Helper function to render actions from config
  const renderActionsFromConfig = (item) => {
    const actions = getActionsConfig(item);
    
    return (
      <div className="flex space-x-2">
        {actions.map((action, index) => {
          const IconComponent = action.icon === 'Eye' ? Eye : Edit;
          return (
            <TButton
              key={index}
              onClick={action.onClick}
              variant="link"
              color={action.color}
              size="sm"
              circle
              title={action.title}
            >
              <IconComponent className="w-4 h-4" />
            </TButton>
          );
        })}
      </div>
    );
  };

  // Helper function to render empty action from config
  const renderEmptyActionFromConfig = () => {
    const actionConfig = getEmptyActionConfig();
    if (!actionConfig) return null;

    return (
      <TButton
        onClick={actionConfig.onClick}
        color={actionConfig.color}
        size={actionConfig.size}
        title={actionConfig.title}
      >
        <Plus className="w-4 h-4 mr-2" />
        {actionConfig.text}
      </TButton>
    );
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📝</span>
              Permohonan 
            </h1>
            <p className="text-gray-600 mt-1">
              Senarai permohonan yang sedang dalam proses
            </p>
          </div>
          <div className="flex space-x-3">
            {features.canCreate && (
              <TButton 
                onClick={handleCreateNew} 
                color='primary' 
                size='sm' 
                title="Buat Permohonan Baru"
              >
                <Plus className="w-4 h-4 mr-2" />
                Permohonan Baru
              </TButton>
            )}
          </div>
        </div>
      </div>

      {/* Statistics/Filter Tabs Grid */}
      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        {cardConfigurations.map((card) => {
          const IconComponent = card.icon;
          return (
            <UnifiedCard
              key={card.tabKey}
              icon={IconComponent}
              title={card.title}
              value={card.value}
              color={card.color}
              description={card.description}
              tabKey={card.tabKey}
              isActive={activeTab === card.tabKey}
              onClick={() => handleTabChange(card.tabKey)}
              interactive={true}
              useScaleEffect={true}
              ariaTitle={card.ariaTitle}
              showActiveIndicator={true}
            />
          );
        })}
      </div>

      {/* Quick Actions Alert */}
      {returnedBillingsAlert.show && (
        <div className={returnedBillingsAlert.className}>
          <div className="flex items-center">
            <returnedBillingsAlert.icon className="text-red-500 w-5 h-5 mr-3" />
            <span className="text-red-800 font-medium">
              {returnedBillingsAlert.message}
            </span>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <UnifiedBillingTable
        data={filteredApplications}
        loading={loading}
        error={error}
        title={getTableTitle()}
        columns={applicantColumns}
        renderActions={renderActionsFromConfig}
        onRefresh={handleRefresh}
        emptyTitle={emptyStateConfig.title}
        emptyDescription={emptyStateConfig.description}
        emptyAction={renderEmptyActionFromConfig()}
        showCount={true}
      />

      {/* Billing Form Dialog */}
      <BillingFormDialog 
        show={showBillingDialog} 
        onClose={handleDialogClose} 
        onSaved={handleDialogSaved} 
        billingId={selectedBillingId} 
        mode={dialogMode} 
      />
    </div>
  );
}

export default BillingTableApplicant;