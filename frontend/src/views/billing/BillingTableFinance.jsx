import React, { useState } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, useBillingTableFinance } from '../../hooks';
import { TButton, UnifiedCard, UnifiedBillingTable } from '../../components/Core';
import { FinanceVerifyDialog } from '../../components/dialogs';

function BillingTableFinance() {
  const { currentUser } = useStateContext();
  
  // Dialog state management
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  
  // TanStack Query hook untuk get dashboard data
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  // Custom hook untuk manage Finance table logic
  const {
    // State values
    activeTab,
    
    // Data values
    filteredBillings,
    statistics,
    
    // Configuration objects
    cardConfigurations,
    financeColumns,
    emptyStateConfig,
    
    // Helper functions
    getActionPath,
    getActionIcon,
    getActionTitle,
    getActionColor,
    getPriorityIcon,
    getPriorityBadgeClass,
    getStatusBadgeClass,
    
    // Event handlers
    handleTabClick,
    handleRefresh,
    
    // Current tab info
    currentTabInfo
  } = useBillingTableFinance(dashboardData, refetch);

  // Dialog handlers
  const handleOpenVerifyDialog = (billingId) => {
    setSelectedBillingId(billingId);
    setShowVerifyDialog(true);
  };

  const handleCloseVerifyDialog = () => {
    setShowVerifyDialog(false);
    setSelectedBillingId(null);
  };

  const handleVerificationComplete = (action, message) => {
    console.log(`Verification ${action} completed:`, message);
    
    // Refresh data setelah verification
    refetch();
    
    // Optional: additional logic berdasarkan action
    if (action === 'verify') {
      console.log('Bill was successfully verified');
    } else if (action === 'reject') {
      console.log('Bill was rejected');
    }
  };

  // Enhanced column renderer function
  const renderColumnCell = (column, item) => {
    if (!column.render) {
      // Simple field rendering
      return <span className={column.className}>{item[column.key]}</span>;
    }

    const { type, config } = column.render;

    switch (type) {
      case 'custom':
        return (
          <span className={config.className}>
            {item[config.field]}
          </span>
        );

      case 'badge':
        return (
          <span className={config.getClassName(item)}>
            {item[config.field]}
          </span>
        );

      case 'priority':
        const priorityIcon = config.getIcon(item[config.field]);
        const PriorityIconComponent = priorityIcon.component;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.getBadgeClass(item[config.field])}`}>
            <PriorityIconComponent className={priorityIcon.className} />
            <span className="ml-1">{item[config.field]}</span>
          </span>
        );

      default:
        return <span>{item[column.key]}</span>;
    }
  };

  // Create enhanced columns with proper render functions
  const enhancedFinanceColumns = financeColumns.map(column => ({
    ...column,
    render: column.render ? (item) => renderColumnCell(column, item) : undefined
  }));

  // Actions renderer untuk UnifiedBillingTable
  const financeRenderActions = (item) => {
    const actionIcon = getActionIcon(item.status_id);
    const ActionIconComponent = actionIcon.component;
    
    // Check if this is a verification action (status_id 4 biasanya untuk verification)
    const isVerificationAction = item.status_id === 4;
    
    if (isVerificationAction) {
      // Use dialog for verification
      return (
        <div className="flex items-center justify-center space-x-2">
          <TButton 
            color={getActionColor(item.status_id)}
            onClick={() => handleOpenVerifyDialog(item.id)}
            size="sm" 
            title={getActionTitle(item.status_id)}
          >
            <ActionIconComponent className={actionIcon.className} />
          </TButton>
        </div>
      );
    } else {
      // Use routing for other actions
      return (
        <div className="flex items-center justify-center space-x-2">
          <TButton 
            color={getActionColor(item.status_id)}
            to={`/finance/${item.id}/${getActionPath(item.status_id)}`} 
            size="sm" 
            title={getActionTitle(item.status_id)}
          >
            <ActionIconComponent className={actionIcon.className} />
          </TButton>
        </div>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">💰</span>Kewangan
            </h1>
            <p className="text-gray-600 mt-1">Pengurusan pembayaran dan verifikasi kewangan</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-6 mb-8">
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
              onClick={() => handleTabClick(card.tabKey)}
              interactive={true}
              showActiveIndicator={true}
              useScaleEffect={true}
              ariaTitle={card.ariaTitle}
            />
          );
        })}
      </div>

      {/* Billing Table */}
      <UnifiedBillingTable
        data={filteredBillings}
        loading={loading}
        error={error}
        title={currentTabInfo.title}
        titleIcon={React.createElement(currentTabInfo.icon.component, {
          className: currentTabInfo.icon.className
        })}
        columns={enhancedFinanceColumns}
        renderActions={financeRenderActions}
        onRefresh={handleRefresh}
        emptyIcon={emptyStateConfig.icon.component}
        emptyTitle={emptyStateConfig.title}
        emptyDescription={emptyStateConfig.description}
        showCount={true}
      />

      {/* Billing Verify Dialog */}
      <FinanceVerifyDialog
        showModal={showVerifyDialog}
        billingId={selectedBillingId}
        onCloseModal={handleCloseVerifyDialog}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

export default BillingTableFinance;