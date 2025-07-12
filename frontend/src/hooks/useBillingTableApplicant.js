import { useEffect, useState } from 'react';
import { FileText, Clock, Edit, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const getDefaultTab = (statusCounts) => {
  if (statusCounts?.returned > 0) return 'returned';
  if (statusCounts?.draft > 0) return 'draft';
  return 'pending';
};

export const useBillingTableApplicant = (dashboardData, refetch) => {
  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState('pending');
  
  // Dialog states
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const [dialogMode, setDialogMode] = useState('create');

  // ==================== DATA EXTRACTION ====================
  const applicantData = dashboardData?.applicant || {};
  const stats = applicantData.summary || {};
  const applications = applicantData.my_billings || [];
  const statusCounts = applicantData.status_counts || {};
  const quickActions = applicantData.quick_actions || {};

  // ==================== CONSTANTS & CONFIGURATIONS ====================

  const statusMapping = {
    'all': { 
      statuses: [], 
      label: 'Semua',
      description: 'Semua permohonan'
    },
    'pending': { 
      statuses: ['Diproses', 'Kelulusan Kewangan', 'Pengesahan Kewangan', 'Semakan Kewangan', 'Menunggu Kelulusan'], 
      label: 'Menunggu',
      description: 'Perlu kelulusan'
    },
    'completed': { 
      statuses: ['Permohonan Dibayar', 'Selesai'], 
      label: 'Selesai',
      description: 'Permohonan selesai'
    },
    'draft': { 
      statuses: ['Draf'], 
      label: 'Draf',
      description: 'Belum dihantar'
    },
    'rejected': { 
      statuses: ['Ditolak'], 
      label: 'Ditolak',
      description: 'Perlu tindakan'
    },
    'returned': { 
      statuses: ['Dikembalikan'], 
      label: 'Dikembalikan',
      description: 'Perlu tindakan'
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const getStatusColor = (status, statusClass) => {
    if (statusClass) return statusClass;
    
    const statusColorMapping = {
      'diproses': 'bg-blue-100 text-blue-800',
      'kelulusan kewangan': 'bg-blue-100 text-blue-800',
      'pengesahan kewangan': 'bg-blue-100 text-blue-800',
      'semakan kewangan': 'bg-blue-100 text-blue-800',
      'permohonan dibayar': 'bg-green-100 text-green-800',
      'selesai': 'bg-green-100 text-green-800',
      'draf': 'bg-gray-100 text-gray-800',
      'menunggu kelulusan': 'bg-yellow-100 text-yellow-800',
      'ditolak': 'bg-red-100 text-red-800',
      'dikembalikan': 'bg-red-100 text-red-800'
    };
    
    return statusColorMapping[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    setActiveTab(getDefaultTab(statusCounts));
  }, [statusCounts]);

  /**
   * Filter applications berdasarkan active tab
   */
  const getFilteredApplications = () => {
    if (activeTab === 'all') return applications;
    
    const tabConfig = statusMapping[activeTab];
    if (!tabConfig) return applications;
    
    return applications.filter(app => tabConfig.statuses.includes(app.status));
  };

  const filteredApplications = getFilteredApplications();

  /**
   * Get current tab information
   */
  const getCurrentTabInfo = () => {
    const tabConfig = statusMapping[activeTab] || statusMapping.all;
    return {
      key: activeTab,
      label: tabConfig.label,
      description: tabConfig.description,
      count: filteredApplications.length,
      total: applications.length
    };
  };

  /**
   * Check if user can create new billing
   */
  const canCreateNew = () => quickActions.can_create_new === true;

  /**
   * Check if there are returned billings that need fixing
   */
  const hasReturnedBillings = () => (quickActions.returned_to_fix || 0) > 0;

  /**
   * Check if billing can be edited
   */
  const canEditBilling = (billing) => billing.can_edit === true;

  /**
   * Get tab icon berdasarkan tab key
   */
  const getTabIcon = (tabKey) => {
    const iconMapping = {
      all: { component: FileText, className: 'w-5 h-5' },
      pending: { component: Clock, className: 'w-5 h-5' },
      completed: { component: CheckCircle, className: 'w-5 h-5' },
      draft: { component: Edit, className: 'w-5 h-5' },
      rejected: { component: XCircle, className: 'w-5 h-5' }
    };
    
    return iconMapping[tabKey] || iconMapping.all;
  };

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle tab change
   */
  const handleTabChange = (tabKey) => setActiveTab(tabKey);

  /**
   * Handle create new billing
   */
  const handleCreateNew = () => {
    setSelectedBillingId(null);
    setDialogMode('create');
    setShowBillingDialog(true);
  };

  /**
   * Handle edit billing
   */
  const handleEditBilling = (billingId) => {
    setSelectedBillingId(billingId);
    setDialogMode('edit');
    setShowBillingDialog(true);
  };

  /**
   * Handle view billing
   */
  const handleViewBilling = (billingId) => {
    setSelectedBillingId(billingId);
    setDialogMode('view');
    setShowBillingDialog(true);
  };

  /**
   * Handle dialog close
   */
  const handleDialogClose = () => {
    setShowBillingDialog(false);
    setSelectedBillingId(null);
    setDialogMode('create');
  };

  /**
   * Handle dialog saved callback
   */
  const handleDialogSaved = (savedData) => {
    // TanStack Query mutation handles cache updates automatically
    // Optional: Add any additional logic here if needed
  };

  /**
   * Handle refresh data
   */
  const handleRefresh = () => {
    if (refetch) refetch();
  };

  // ==================== COMPUTED VALUES ====================

  /**
   * Statistics untuk cards
   */
  const statistics = {
    draft: statusCounts.draft || 0,
    pending: statusCounts.pending || 0,
    completed: statusCounts.completed || 0,
    rejected: statusCounts.rejected || 0,
    returned: statusCounts.returned || 0,
    total: applications.length || 0
  };

  /**
   * Card configurations untuk dashboard
   */
  const cardConfigurations = [
    {
      icon: Edit,
      title: "Draf",
      value: statistics.draft,
      color: "bg-gray-500",
      description: "Belum dihantar",
      tabKey: "draft",
      ariaTitle: "Lihat permohonan draf"
    },
    {
      icon: Clock,
      title: "Menunggu",
      value: statistics.pending,
      color: "bg-yellow-500",
      description: "Perlu kelulusan",
      tabKey: "pending",
      ariaTitle: "Lihat permohonan menunggu"
    },
    {
      icon: CheckCircle,
      title: "Selesai",
      value: statistics.completed,
      color: "bg-green-500",
      description: "Permohonan selesai",
      tabKey: "completed",
      ariaTitle: "Lihat permohonan selesai"
    },
    {
      icon: XCircle,
      title: "Ditolak",
      value: statistics.rejected,
      color: "bg-red-500",
      description: "Perlu tindakan",
      tabKey: "rejected",
      ariaTitle: "Lihat permohonan ditolak"
    },
    {
      icon: AlertTriangle,
      title: "Dikembalikan",
      value: statistics.returned,
      color: "bg-red-500",
      description: "Perlu tindakan",
      tabKey: "returned",
      ariaTitle: "Lihat permohonan dikembalikan"
    }
  ];

  /**
   * Column configuration untuk UnifiedBillingTable
   */
  const applicantColumns = [
    {
      key: 'running_no',
      label: 'No. Rujukan',
      type: 'custom',
      cellClassName: 'text-sm font-medium text-gray-900'
    },
    {
      key: 'recipient',
      label: 'Penerima',
      className: 'text-sm text-gray-900'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      getStatusClass: (status, item) => getStatusColor(status, item.status_class)
    },
    {
      key: 'total_amount',
      label: 'Jumlah',
      type: 'currency',
      cellClassName: 'text-sm text-gray-900 font-medium'
    },
    {
      key: 'created_at',
      label: 'Tarikh',
      type: 'date',
      cellClassName: 'text-sm text-gray-500'
    }
  ];

  /**
   * Actions configuration untuk UnifiedBillingTable
   */
  const getActionsConfig = (item) => {
    const actions = [
      {
        type: 'view',
        onClick: () => handleViewBilling(item.id),
        title: 'Lihat',
        color: 'blue',
        icon: 'Eye'
      }
    ];

    if (canEditBilling(item)) {
      actions.push({
        type: 'edit',
        onClick: () => handleEditBilling(item.id),
        title: 'Edit',
        color: 'green',
        icon: 'Edit'
      });
    }

    return actions;
  };

  /**
   * Empty action configuration untuk table
   */
  const getEmptyActionConfig = () => {
    if (!canCreateNew() || activeTab !== 'all') return null;
    
    return {
      onClick: handleCreateNew,
      color: 'primary',
      size: 'sm',
      title: 'Buat Permohonan Baru',
      text: 'Permohonan Baru',
      icon: 'Plus'
    };
  };

  /**
   * Alert configuration untuk returned billings
   */
  const returnedBillingsAlert = hasReturnedBillings() ? {
    show: true,
    count: quickActions.returned_to_fix,
    message: `Terdapat ${quickActions.returned_to_fix} permohonan yang perlu diperbaiki`,
    icon: AlertTriangle,
    className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
  } : { show: false };

  /**
   * Table title berdasarkan active tab
   */
  const getTableTitle = () => {
    const tabInfo = getCurrentTabInfo();
    return activeTab === 'all' 
      ? `Senarai Semua Permohonan` 
      : `Senarai Permohonan ${tabInfo.label}`;
  };

  /**
   * Empty state configuration
   */
  const emptyStateConfig = {
    title: "Tiada permohonan pada masa ini",
    description: activeTab === 'all' 
      ? "Belum ada permohonan yang dibuat" 
      : `Tiada permohonan ${statusMapping[activeTab]?.label?.toLowerCase() || ''} pada masa ini`,
    actionConfig: getEmptyActionConfig()
  };

  // ==================== RETURN HOOK VALUES ====================

  return {
    // State values
    activeTab,
    showBillingDialog,
    selectedBillingId,
    dialogMode,
    
    // Data values
    applicantData,
    stats,
    applications,
    statusCounts,
    quickActions,
    filteredApplications,
    statistics,
    
    // Configuration objects
    statusMapping,
    cardConfigurations,
    applicantColumns,
    returnedBillingsAlert,
    emptyStateConfig,
    
    // Helper functions
    getStatusColor,
    getFilteredApplications,
    getCurrentTabInfo,
    getTabIcon,
    getTableTitle,
    canCreateNew,
    canEditBilling,
    hasReturnedBillings,
    
    // Event handlers
    handleTabChange,
    handleCreateNew,
    handleEditBilling,
    handleViewBilling,
    handleDialogClose,
    handleDialogSaved,
    handleRefresh,
    
    // Render functions
    getActionsConfig,
    getEmptyActionConfig,
    
    // Computed values
    
    // Computed values
    hasData: applications.length > 0,
    hasFilteredData: filteredApplications.length > 0,
    isEmpty: filteredApplications.length === 0,
    currentTabInfo: getCurrentTabInfo(),
    
    // Feature flags
    features: {
      canCreate: canCreateNew(),
      hasReturned: hasReturnedBillings(),
      showAlert: returnedBillingsAlert.show
    },
    
    // Dialog state helpers
    isDialogOpen: showBillingDialog,
    isCreateMode: dialogMode === 'create',
    isEditMode: dialogMode === 'edit',
    isViewMode: dialogMode === 'view'
  };
};