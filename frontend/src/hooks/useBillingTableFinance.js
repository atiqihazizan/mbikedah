import { useState } from 'react';
import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCheck,
  FaFire
} from 'react-icons/fa';

export const useBillingTableFinance = (dashboardData, refetch) => {
  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState('review');

  // ==================== DATA EXTRACTION ====================
  const financeData = dashboardData?.finance || {};
  const stats = financeData.summary || {};
  const allBillings = financeData.needing_attention || [];
  const permissions = financeData.permissions || {};

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Check if user can act on billing based on status and permissions
   */
  const canActOnStatus = (statusId) => {
    switch(statusId) {
      case 3: return permissions.can_review || false;    // FINANCE_REVIEW
      case 4: return permissions.can_verify || false;    // FINANCE_VERIFY  
      case 5: return permissions.can_approve || false;   // FINANCE_APPROVAL
      case 6: return permissions.can_pay || false;       // PROCESSING_PAYMENT
      default: return false;
    }
  };

  /**
   * Check if action button should be shown for a billing item
   */
  const shouldShowActionButton = (item) => {
    return canActOnStatus(item.status_id);
  };

  const getFilteredBillings = () => {
    if (activeTab === 'all') return allBillings;
    
    switch (activeTab) {
      case 'review':
        return allBillings.filter(billing => 
          billing.status === 'Semakan Kewangan' || billing.status_id === 3
        );
      case 'verify':
        return allBillings.filter(billing => 
          billing.status === 'Pengesahan Kewangan' || billing.status_id === 4
        );
      case 'approval':
        return allBillings.filter(billing => 
          billing.status === 'Menunggu Pengesahan' || billing.status_id === 5
        );
      case 'payment':
        return allBillings.filter(billing => 
          billing.status === 'Menunggu Bayaran' || billing.status_id === 6
        );
      default:
        return allBillings;
    }
  };

  const filteredBillings = getFilteredBillings();

  /**
   * Get title untuk active tab
   */
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'review':
        return 'Menunggu Semakan';
      case 'verify':
        return 'Menunggu Verifikasi';
      case 'approval':
        return 'Menunggu Pengesahan';
      case 'payment':
        return 'Menunggu Bayaran';
      case 'all':
      default:
        return 'Semua Permohonan';
    }
  };

  /**
   * Get icon untuk active tab
   */
  const getActiveTabIcon = () => {
    switch (activeTab) {
      case 'review':
        return { component: FaClock, className: 'w-5 h-5 text-blue-500' };
      case 'verify':
        return { component: FaExclamationTriangle, className: 'w-5 h-5 text-orange-500' };
      case 'approval':
        return { component: FaMoneyBillWave, className: 'w-5 h-5 text-red-500' };
      case 'payment':
        return { component: FaMoneyBillWave, className: 'w-5 h-5 text-green-500' };
      case 'all':
      default:
        return { component: FaMoneyBillWave, className: 'w-5 h-5 text-blue-500' };
    }
  };

  /**
   * Get priority icon untuk billing
   */
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'sangat segera':
        return { component: FaFire, className: 'w-4 h-4 text-red-500' };
      case 'segera':
        return { component: FaExclamationTriangle, className: 'w-4 h-4 text-orange-500' };
      default:
        return { component: FaCheckCircle, className: 'w-4 h-4 text-green-500' };
    }
  };

  /**
   * Get action path berdasarkan status ID
   */
  const getActionPath = (statusId) => {
    const paths = {
      3: 'check',    // Semakan Kewangan
      4: 'verify',   // Pengesahan Kewangan  
      5: 'approval', // Menunggu Pengesahan
      6: 'payment',  // Menunggu Bayaran
    };
    return paths[statusId] || 'check';
  };

  /**
   * Get action icon berdasarkan status ID
   */
  const getActionIcon = (statusId) => {
    const icons = {
      3: { component: FaCheck, className: 'w-3 h-3' },
      4: { component: FaCheck, className: 'w-3 h-3' },
      5: { component: FaCheck, className: 'w-3 h-3' },
      6: { component: FaMoneyBillWave, className: 'w-3 h-3' },
    };
    return icons[statusId] || { component: FaCheck, className: 'w-3 h-3' };
  };

  /**
   * Get action title berdasarkan status ID
   */
  const getActionTitle = (statusId) => {
    const titles = {
      3: 'Semak',
      4: 'Verifikasi', 
      5: 'Pengesahan',
      6: 'Bayar',
    };
    return titles[statusId] || 'Semak';
  };

  /**
   * Get action button color berdasarkan status ID
   */
  const getActionColor = (statusId) => {
    const colors = {
      3: 'check',     // Blue untuk semakan
      4: 'warning',   // Orange untuk verifikasi
      5: 'approve',   // Green untuk pengesahan
      6: 'danger',    // Red untuk bayaran
    };
    return colors[statusId] || 'check';
  };

  /**
   * Check if billing is urgent
   */
  const isBillingUrgent = (billing) => {
    return billing.priority?.toLowerCase() === 'segera' || 
           billing.priority?.toLowerCase() === 'sangat segera';
  };

  /**
   * Check if billing is critical
   */
  const isBillingCritical = (billing) => {
    return billing.priority?.toLowerCase() === 'sangat segera';
  };

  /**
   * Get priority badge class
   */
  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'sangat segera':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'segera':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (statusId) => {
    switch (statusId) {
      case 3: // Semakan Kewangan
        return 'bg-blue-100 text-blue-800';
      case 4: // Pengesahan Kewangan
        return 'bg-orange-100 text-orange-800';
      case 5: // Menunggu Pengesahan
        return 'bg-yellow-100 text-yellow-800';
      case 6: // Menunggu Bayaran
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get print count className berdasarkan count
   */
  const getPrintCountClassName = (count) => {
    if (count === 0 || !count) {
      return 'inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full';
    } else {
      return 'inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full';
    }
  };

  /**
   * Format print count value
   */
  const formatPrintCount = (value) => {
    const count = value || 0;
    return count === 0 ? 'Belum' : `${count}x`;
  };

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle tab click
   */
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  /**
   * Handle refresh data
   */
  const handleRefresh = () => {
    if (refetch) {
      refetch();
    }
  };

  // ==================== COMPUTED VALUES ====================

  /**
   * Statistics untuk cards
   */
  const statistics = {
    review: stats.pending_review || 0,
    verify: stats.pending_verify || 0,
    approval: stats.pending_approval || 0,
    payment: stats.pending_payment || 0,
    total: allBillings.length || 0
  };

  /**
   * Card configurations untuk dashboard
   */
  const cardConfigurations = [
    {
      icon: FaClock,
      title: "Menunggu Semakan",
      value: statistics.review,
      color: "bg-blue-500",
      description: "Perlu disemak",
      tabKey: "review",
      ariaTitle: "Lihat permohonan yang menunggu semakan"
    },
    {
      icon: FaExclamationTriangle,
      title: "Menunggu Verifikasi",
      value: statistics.verify,
      color: "bg-orange-500",
      description: "Perlu diverifikasi",
      tabKey: "verify",
      ariaTitle: "Lihat permohonan yang menunggu verifikasi"
    },
    {
      icon: FaMoneyBillWave,
      title: "Menunggu Pengesahan",
      value: statistics.approval,
      color: "bg-yellow-500",
      description: "Perlu dihantar",
      tabKey: "approval",
      ariaTitle: "Lihat permohonan yang menunggu pengesahan"
    },
    {
      icon: FaMoneyBillWave,
      title: "Menunggu Bayaran",
      value: statistics.payment,
      color: "bg-red-500",
      description: "Perlu dibayar",
      tabKey: "payment",
      ariaTitle: "Lihat permohonan yang menunggu bayaran"
    }
  ];

  /**
   * Column configuration untuk UnifiedBillingTable
   * Menggunakan render config objects instead of JSX
   */
  const financeColumns = [
    {
      key: 'running_no',
      label: 'No. Rujukan',
      render: {
        type: 'custom',
        config: {
          className: 'font-medium text-gray-900',
          field: 'running_no'
        }
      }
    },
    {
      key: 'creator',
      label: 'Pemohon',
      className: 'text-gray-900'
    },
    {
      key: 'recipient',
      label: 'Penerima',
      className: 'text-gray-900'
    },
    {
      key: 'total_amount',
      label: 'Jumlah',
      type: 'currency',
      headerClassName: 'text-right',
      cellClassName: 'text-right'
    },
    {
      key: 'status',
      label: 'Status',
      render: {
        type: 'badge',
        config: {
          getClassName: (item) => `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status_id)}`,
          field: 'status'
        }
      }
    },
    {
      key: 'priority',
      label: 'Prioriti',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: {
        type: 'priority',
        config: {
          getIcon: getPriorityIcon,
          getBadgeClass: getPriorityBadgeClass,
          field: 'priority'
        }
      }
    },
    {
      key: 'days_pending_display',
      label: 'Tempoh',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: {
        type: 'custom',
        config: {
          className: 'text-sm text-gray-600',
          field: 'days_pending_display'
        }
      }
    },
    {
      key: 'print_count',
      label: 'Print',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      width: '80px',
      render: {
        type: 'print_count',
        config: {
          getClassName: getPrintCountClassName,
          field: 'print_count',
          formatter: formatPrintCount
        }
      }
    }
  ];

  /**
   * Empty state configuration
   */
  const emptyStateConfig = {
    icon: { component: FaCheckCircle },
    title: activeTab === 'all' 
      ? 'Tiada permohonan menunggu semakan' 
      : `Tiada permohonan untuk ${getActiveTabTitle().toLowerCase()}`,
    description: activeTab === 'all' 
      ? 'Semua permohonan telah diproses' 
      : 'Cuba pilih tab lain untuk melihat permohonan lain'
  };

  // ==================== RETURN HOOK VALUES ====================

  return {
    // State values
    activeTab,
    
    // Data values
    financeData,
    stats,
    allBillings,
    filteredBillings,
    statistics,
    permissions,
    
    // Configuration objects
    cardConfigurations,
    financeColumns,
    emptyStateConfig,
    
    // Helper functions
    getFilteredBillings,
    getActiveTabTitle,
    getActiveTabIcon,
    getPriorityIcon,
    getActionPath,
    getActionIcon,
    getActionTitle,
    getActionColor,
    getPriorityBadgeClass,
    getStatusBadgeClass,
    getPrintCountClassName,
    formatPrintCount,
    isBillingUrgent,
    isBillingCritical,
    
    // Permission functions
    canActOnStatus,
    shouldShowActionButton,
    
    // Event handlers
    handleTabClick,
    handleRefresh,
    
    // Computed values
    hasData: allBillings.length > 0,
    hasFilteredData: filteredBillings.length > 0,
    isEmpty: !filteredBillings.length,
    
    // Action helpers
    canProcessReview: statistics.review > 0,
    canProcessVerify: statistics.verify > 0,
    canProcessApproval: statistics.approval > 0,
    canProcessPayment: statistics.payment > 0,
    
    // Current tab info
    currentTabInfo: {
      title: getActiveTabTitle(),
      icon: getActiveTabIcon(),
      count: filteredBillings.length,
      total: statistics.total
    }
  };
};