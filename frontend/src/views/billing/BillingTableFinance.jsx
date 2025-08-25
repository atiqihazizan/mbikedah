import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, useBillingTableFinance } from '../../hooks';
import { TButton, UnifiedCard, UnifiedBillingTable } from '../../components/Core';
import { FinanceVerifyDialog } from '../../components/dialogs';
import FinanceApprovalDialog from '../../components/dialogs/FinanceApprovalDialog';
import BillingPrint from './BillingPrint';
import BillingPaymentDialog from '../../components/dialogs/FinancePaymentDialog';

function BillingTableFinance() {
  const printRef = useRef(null);
  const { currentUser } = useStateContext();
  
  // Dialog state management
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const [selectedBillingData, setSelectedBillingData] = useState(null);
  
  // Print states
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [pendingPrintAfterApproval, setPendingPrintAfterApproval] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // TanStack Query hook untuk get dashboard data
  const { dashboardData, isLoading: loading, error, refreshUserData: refetch } = useUserData(currentUser);
  
  // Custom hook untuk manage Finance table logic
  const {
    // State values
    activeTab,
    
    // Data values
    filteredBillings,
    permissions,
    
    // Configuration objects
    cardConfigurations,
    financeColumns,
    emptyStateConfig,
    
    // Helper functions
    getActionPath,
    getActionIcon,
    getActionTitle,
    getActionColor,
    shouldShowActionButton,
    canActOnStatus,
    
    // Event handlers
    handleTabClick,
    handleRefresh,
    
    // Current tab info
    currentTabInfo
  } = useBillingTableFinance(dashboardData, refetch);

  // Monitor print loading state
  useEffect(() => {
    if (printRef.current) {
      setIsPrintLoading(printRef.current.isLoading || false);
    }
  }, [selectedBillingId]);

  // Enhanced dialog handlers with proper validation and loading
  const handleOpenDialog = useCallback(async (data, billingId, statusId) => {
    // Validation
    if (!billingId || !data) {
      console.log("Data tidak sah");
      return;
    }

    // Set selected billing ID and data
    setSelectedBillingId(billingId);
    setSelectedBillingData(data);

    // Handle different status actions
    if (statusId === 4) {
      setShowVerifyDialog(true);
    } else if (statusId === 5) {
      if (data.print_count > 0) {
        // Show approval dialog - need fresh data first
        setIsPrintLoading(true);
        
        try {
          // Initialize print data in background
          if (printRef.current) await printRef.current.initialize(billingId, false);
          setShowApprovalDialog(true);
        } catch (error) {
          console.log("Ralat memuat data bil");
        } finally {
          setIsPrintLoading(false);
        }
      } else {
        // Direct print for first time - initialize and print
        setIsPrintLoading(true);
        
        try {
          if (printRef.current) await printRef.current.initialize(billingId, true);
          else console.log("Print service tidak tersedia");
        } catch (error) {
          console.log("Ralat mencetak dokumen");
        } finally {
          setIsPrintLoading(false);
        }
      }
    } else if (statusId === 6) {
      setShowPaymentDialog(true);
    }
  }, []);

  const handleCloseDialog = useCallback(() => {
    setShowVerifyDialog(false);
    setShowApprovalDialog(false);
    setShowPaymentDialog(false);
    setSelectedBillingId(null);
    setSelectedBillingData(null);
    setPendingPrintAfterApproval(false);
  }, []);

  // Handle approval completion - refresh data and print
  const handleApprovalComplete = useCallback(async (action, approvalData) => {
    try {
      // Refresh main table data
      refetch();
      
      if (action === 'approve' && selectedBillingId) {
        // Close dialog first
        setShowApprovalDialog(false);
        
        // Show loading
        setIsPrintLoading(true);
        setPendingPrintAfterApproval(true);
        
        // Wait a bit for the approval to be processed in backend
        setTimeout(async () => {
          try {
            // Print with fresh data
            if (printRef.current) await printRef.current.printWithFreshData();
          } catch (error) {
            console.log("Dokumen diluluskan tetapi gagal dicetak");
          } finally {
            setIsPrintLoading(false);
            setPendingPrintAfterApproval(false);
            handleCloseDialog();
          }
        }, 1000);
      } else {
        // Just close dialog for reject/other actions
        handleCloseDialog();
      }
    } catch (error) {
      console.log("Ralat semasa memproses kelulusan");
      setIsPrintLoading(false);
      setPendingPrintAfterApproval(false);
    }
  }, [selectedBillingId, refetch, handleCloseDialog]);

  // Enhanced column renderer function
  const renderColumnCell = (column, item) => {
    if (!column.render) {
      const className = column.className || '';
      return <span className={className}>{item[column.key]}</span>;
    }

    const { type, config } = column.render;

    switch (type) {
      case 'custom':
        const customClassName = config?.className || '';
        return <span className={customClassName}>{item[config?.field]}</span>;

      case 'badge':
        const badgeClassName = config?.getClassName ? config.getClassName(item) || '' : '';
        return <span className={badgeClassName}>{item[config?.field]}</span>;

      case 'priority':
        const priorityIcon = config?.getIcon ? config.getIcon(item[config?.field]) : null;
        const PriorityIconComponent = priorityIcon?.component;
        const badgeClass = config?.getBadgeClass ? config.getBadgeClass(item[config?.field]) || '' : '';
        const baseClasses = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`;
        
        return (
          <span className={baseClasses}>
            {PriorityIconComponent && <PriorityIconComponent className={priorityIcon?.className || ''} />}
            <span className="ml-1">{item[config?.field]}</span>
          </span>
        );

      case 'print_count':
        const printCount = item[config?.field] || 0;
        const printClassName = config?.getClassName ? config.getClassName(printCount) || '' : '';
        const printValue = config?.formatter ? config.formatter(printCount) : printCount;
        return <span className={printClassName}>{printValue}</span>;

      default:
        return <span>{item[column.key]}</span>;
    }
  };

  // Create enhanced columns with proper render functions
  const enhancedFinanceColumns = financeColumns.map(column => ({
    ...column,
    render: column.render ? (item) => renderColumnCell(column, item) : undefined
  }));

  const handlePrintComplete = useCallback(() => {
    refetch();
    setIsPrintLoading(false);
  }, [refetch]);

  const handlePaymentComplete = useCallback(() => {
    refetch();
    setIsPrintLoading(false);
  }, [refetch]);

  // Actions renderer untuk UnifiedBillingTable dengan permission checking
  const financeRenderActions = (item) => {
    // Check if user has permission to act on this billing
    if (!shouldShowActionButton(item)) {
      return (
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Tiada akses
          </span>
        </div>
      );
    }

    const actionIcon = getActionIcon(item.status_id);
    const ActionIconComponent = actionIcon?.component;
    
    const isDialog = [4, 5, 6].includes(item.status_id);
    const isCurrentlyProcessing = isPrintLoading && selectedBillingId === item.id;
    
    if (isDialog) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <TButton 
            color={getActionColor(item.status_id)}
            onClick={() => handleOpenDialog(item, item.id, item.status_id)}
            size="sm" 
            title={getActionTitle(item.status_id)}
            disabled={isCurrentlyProcessing}
            loading={isCurrentlyProcessing}
          >
            {!isCurrentlyProcessing && ActionIconComponent && <ActionIconComponent className={actionIcon?.className || ''} />}
            {isCurrentlyProcessing && <span className="text-xs">Loading...</span>}
          </TButton>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center space-x-2">
          <TButton 
            color={getActionColor(item.status_id)}
            to={`/finance/${item.id}/${getActionPath(item.status_id)}`} 
            size="sm" 
            title={getActionTitle(item.status_id)}
          >
            {ActionIconComponent && <ActionIconComponent className={actionIcon?.className || ''} />}
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
          
          {/* Loading indicator for print operations */}
          {(isPrintLoading || pendingPrintAfterApproval) && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">
                {pendingPrintAfterApproval ? 'Memproses kelulusan dan mencetak...' : 'Memuat data untuk cetak...'}
              </span>
            </div>
          )}
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
        titleIcon={React.createElement(currentTabInfo.icon.component, {className: currentTabInfo.icon.className})}
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
        onCloseModal={handleCloseDialog}
        onVerificationComplete={(action, data) => {
          refetch();
          handleCloseDialog();
        }}
      />

      {/* Billing Approval Dialog with loading state */}
      <FinanceApprovalDialog 
        isOpen={showApprovalDialog}
        onClose={handleCloseDialog}
        idBilling={selectedBillingId}
        onApprovalComplete={handleApprovalComplete}
        loading={isPrintLoading}
        onPrint = { () => {
          printRef.current.printWithFreshData(); 
        }}
      />

      {/* Billing Payment Dialog */}
      <BillingPaymentDialog 
        isOpen={showPaymentDialog}
        onClose={handleCloseDialog}
        idBilling={selectedBillingId}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* BillingPrint Component */}
      <BillingPrint ref={printRef} billingId={selectedBillingId} onPrintComplete={handlePrintComplete}/>
    </div>
  );
}

export default BillingTableFinance;