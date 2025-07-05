import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook untuk BillingTableHOD component
 * Mengurus semua state management dan business logic untuk HOD billing approvals
 */
export const useBillingTableHOD = (dashboardData, refetch) => {
  // ==================== DATA EXTRACTION ====================
  const hodData = dashboardData?.hod || {};
  const stats = hodData.summary || {};
  const needingApproval = hodData.needing_approval || [];
  const performance = hodData.performance || {};

  // ==================== HELPER FUNCTIONS ====================
  
  /**
   * Extract number of days from days_pending_display string
   */
  const extractDays = (daysPendingDisplay) => {
    if (!daysPendingDisplay) return 0;
    const match = daysPendingDisplay.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  /**
   * Filter untuk permohonan urgent (lebih dari 3 hari)
   */
  const urgentApprovals = needingApproval.filter(
    billing => extractDays(billing.days_pending_display) > 3
  );

  /**
   * Calculate urgent count
   */
  const urgentCount = urgentApprovals.length || 0;

  /**
   * Determine default tab based on urgent count
   */
  const getDefaultTab = () => {
    return urgentCount === 0 ? 'all' : 'urgent';
  };

  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  
  // Modal States
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Selected billing untuk modals
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [viewBilling, setViewBilling] = useState(null);
  const [selectedBillingId, setSelectedBillingId] = useState(null); // For ViewDialog internal fetching

  // ==================== EFFECT FOR DYNAMIC TAB SWITCHING ====================
  
  /**
   * Effect untuk auto-switch tab jika urgent count berubah kepada 0
   * dan current tab adalah 'urgent'
   */
  useEffect(() => {
    if (urgentCount === 0 && activeTab === 'urgent') {
      setActiveTab('all');
    }
  }, [urgentCount, activeTab]);

  // ==================== HELPER FUNCTIONS (CONTINUED) ====================
  
  /**
   * Get filtered billings berdasarkan active tab
   */
  const getFilteredBillings = () => {
    switch (activeTab) {
      case 'urgent':
        return urgentApprovals;
      case 'all':
      default:
        return needingApproval;
    }
  };

  const filteredBillings = getFilteredBillings();

  /**
   * Get title untuk active tab
   */
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'urgent':
        return 'Permohonan Urgent (Tunggakan > 3 Hari)';
      case 'all':
      default:
        return 'Semua Permohonan Menunggu Kelulusan';
    }
  };

  /**
   * Get icon untuk active tab
   */
  const getActiveTabIcon = () => {
    switch (activeTab) {
      case 'urgent':
        return { name: 'FaFire', className: 'w-5 h-5 mr-3 text-red-500' };
      case 'all':
      default:
        return { name: 'FaClock', className: 'w-5 h-5 mr-3 text-orange-500' };
    }
  };

  // ==================== TAB HANDLERS ====================
  
  /**
   * Handle tab click
   */
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  // ==================== ACTION HANDLERS ====================
  
  /**
   * Handle approve billing
   */
  const handleApprove = async (billing) => {
    try {
      const billingWithDays = {
        ...billing,
        days_pending: extractDays(billing.days_pending_display)
      };
      setSelectedBilling(billingWithDays);
      setShowApprovalModal(true);
    } catch (error) {
      console.error('Error preparing approval:', error);
      toast.error('Ralat semasa menyediakan kelulusan');
    }
  };

  /**
   * Handle reject billing
   */
  const handleReject = async (billing) => {
    try {
      const billingWithDays = {
        ...billing,
        days_pending: extractDays(billing.days_pending_display)
      };
      setSelectedBilling(billingWithDays);
      setShowRejectModal(true);
    } catch (error) {
      console.error('Error preparing rejection:', error);
      toast.error('Ralat semasa menyediakan penolakan');
    }
  };

  /**
   * Handle return billing
   */
  const handleReturn = async (billing) => {
    try {
      const billingWithDays = { 
        ...billing, 
        days_pending: extractDays(billing.days_pending_display) 
      };
      setSelectedBilling(billingWithDays);
      setShowReturnModal(true);
    } catch (error) {
      console.error('Error preparing return:', error);
      toast.error('Ralat semasa menyediakan pemulangan');
    }
  };

  /**
   * Handle view billing detail - Simplified (ViewDialog handles API call internally)
   */
  const handleView = (billing) => {
    try {
      // Set basic info untuk display while loading dalam ViewDialog
      const basicInfo = {
        id: billing.id,
        running_no: billing.running_no,
        days_pending_display: billing.days_pending_display,
        // Add any other basic info yang mungkin perlu untuk display
        creator: billing.creator,
        recipient: billing.recipient,
        total_amount: billing.total_amount
      };
      
      setViewBilling(basicInfo);
      setSelectedBillingId(billing.id); // New state untuk pass ID to ViewDialog
      setShowViewModal(true);
    } catch (error) {
      console.error('Error preparing view:', error);
      toast.error('Ralat semasa menyediakan paparan');
    }
  };

  // ==================== SUCCESS CALLBACKS ====================
  
  /**
   * Success callback untuk approval
   */
  const handleApprovalSuccess = () => {
    refetch();
  };

  /**
   * Success callback untuk rejection
   */
  const handleRejectSuccess = () => {
    refetch();
  };

  /**
   * Success callback untuk return
   */
  const handleReturnSuccess = () => {
    refetch();
  };

  // ==================== MODAL CLOSE HANDLERS ====================
  
  /**
   * Close approval modal
   */
  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedBilling(null);
  };

  /**
   * Close reject modal
   */
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBilling(null);
  };

  /**
   * Close return modal
   */
  const handleCloseReturnModal = () => {
    setShowReturnModal(false);
    setSelectedBilling(null);
  };

  /**
   * Close view modal
   */
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewBilling(null);
    setSelectedBillingId(null); // Clear billing ID as well
  };

  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Get priority icon configuration
   */
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'segera':
        return { name: 'FaExclamationTriangle', className: 'w-4 h-4 text-red-500' };
      case 'penting':
        return { name: 'FaClock', className: 'w-4 h-4 text-orange-500' };
      default:
        return { name: 'FaCheckCircle', className: 'w-4 h-4 text-green-500' };
    }
  };

  /**
   * Check if billing is urgent (untuk styling)
   */
  const isBillingUrgent = (billing) => {
    const days = extractDays(billing.days_pending_display);
    return days > 3;
  };

  /**
   * Check if billing is critical (untuk styling)
   */
  const isBillingCritical = (billing) => {
    const days = extractDays(billing.days_pending_display);
    return days > 7;
  };

  /**
   * Get row styling class berdasarkan urgency
   */
  const getRowStyling = (billing) => {
    if (activeTab === 'urgent') {
      if (isBillingCritical(billing)) {
        return 'bg-red-50 border-l-4 border-red-500';
      } else if (isBillingUrgent(billing)) {
        return 'bg-orange-50 border-l-4 border-orange-400';
      }
    }
    return '';
  };

  /**
   * Get text color untuk days pending
   */
  const getDaysPendingColor = (billing) => {
    const days = extractDays(billing.days_pending_display);
    if (days > 7) return 'text-red-600';
    if (days > 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  // ==================== COMPUTED VALUES ====================
  
  /**
   * Statistics untuk cards
   */
  const statistics = {
    urgent: urgentCount,
    pending: stats.pending_approvals || 0,
    thisMonth: performance.this_month || 0
  };

  /**
   * Empty state configuration
   */
  const emptyStateConfig = {
    icon: { name: 'FaCheckCircle' },
    title: activeTab === 'urgent' 
      ? 'Tiada permohonan urgent pada masa ini' 
      : 'Tiada permohonan menunggu kelulusan',
    description: activeTab === 'urgent' 
      ? 'Semua permohonan dalam tempoh yang wajar' 
      : activeTab === 'all'
      ? 'Semua permohonan telah diproses'
      : 'Cuba pilih tab lain untuk melihat permohonan lain'
  };

  // ==================== RETURN HOOK VALUES ====================
  
  return {
    // State values
    activeTab,
    showApprovalModal,
    showRejectModal,
    showReturnModal,
    showViewModal,
    selectedBilling,
    viewBilling,
    selectedBillingId, // For ViewDialog internal fetching
    
    // Data values
    hodData,
    stats,
    needingApproval,
    performance,
    urgentApprovals,
    filteredBillings,
    statistics,
    
    // Helper functions
    extractDays,
    getFilteredBillings,
    getActiveTabTitle,
    getActiveTabIcon,
    getPriorityIcon,
    isBillingUrgent,
    isBillingCritical,
    getRowStyling,
    getDaysPendingColor,
    
    // Event handlers
    handleTabClick,
    handleApprove,
    handleReject,
    handleReturn,
    handleView,
    
    // Success callbacks
    handleApprovalSuccess,
    handleRejectSuccess,
    handleReturnSuccess,
    
    // Modal handlers
    handleCloseApprovalModal,
    handleCloseRejectModal,
    handleCloseReturnModal,
    handleCloseViewModal,
    
    // Configuration objects
    emptyStateConfig
  };
};