// utils/reportUtils.js

/**
 * Report type metadata configuration
 */
const REPORT_METADATA = {
  // Financial Reports - Main Category
  financial: {
    icon: '💰',
    color: 'green',
    shortName: 'Financial',
    description: 'Laporan kewangan am',
    route: '/reports/financial',
    defaultPriority: 'high'
  },
  
  // Specific Financial Report Types
  budget_summary: {
    icon: '💼',
    color: 'emerald',
    shortName: 'Bajet',
    description: 'Ringkasan bajet dan peruntukan kewangan',
    route: '/reports/budget-summary',
    defaultPriority: 'high',
    category: 'financial'
  },
  income_statement: {
    icon: '📊',
    color: 'blue',
    shortName: 'P&L',
    description: 'Penyata hasil dan belanja',
    route: '/reports/income-statement',
    defaultPriority: 'high',
    category: 'financial'
  },
  revenue_breakdown: {
    icon: '📈',
    color: 'green',
    shortName: 'Hasil',
    description: 'Sub hasil dan pecahan pendapatan',
    route: '/reports/revenue-breakdown',
    defaultPriority: 'medium',
    category: 'financial'
  },
  expense_breakdown: {
    icon: '📉',
    color: 'red',
    shortName: 'Belanja',
    description: 'Sub belanja dan pecahan perbelanjaan',
    route: '/reports/expense-breakdown',
    defaultPriority: 'medium',
    category: 'financial'
  },
  
  // Other Report Types
  operational: {
    icon: '⚙️',
    color: 'blue',
    shortName: 'Ops',
    description: 'Laporan operasi harian',
    route: '/reports/operational',
    defaultPriority: 'medium'
  },
  performance: {
    icon: '📊',
    color: 'purple',
    shortName: 'Performance',
    description: 'Laporan prestasi dan analitik',
    route: '/reports/performance',
    defaultPriority: 'medium'
  },
  compliance: {
    icon: '📋',
    color: 'orange',
    shortName: 'Compliance',
    description: 'Laporan kepatuhan dan audit',
    route: '/reports/compliance',
    defaultPriority: 'high'
  },
  hr: {
    icon: '👥',
    color: 'teal',
    shortName: 'HR',
    description: 'Laporan sumber manusia',
    route: '/reports/hr',
    defaultPriority: 'medium'
  },
  project: {
    icon: '🚀',
    color: 'indigo',
    shortName: 'Project',
    description: 'Laporan kemajuan projek',
    route: '/reports/project',
    defaultPriority: 'medium'
  },
  inventory: {
    icon: '📦',
    color: 'brown',
    shortName: 'Inventory',
    description: 'Laporan inventori dan stok',
    route: '/reports/inventory',
    defaultPriority: 'low'
  },
  sales: {
    icon: '💼',
    color: 'green',
    shortName: 'Sales',
    description: 'Laporan jualan dan marketing',
    route: '/reports/sales',
    defaultPriority: 'high'
  },
  customer: {
    icon: '🤝',
    color: 'pink',
    shortName: 'Customer',
    description: 'Laporan kepuasan pelanggan',
    route: '/reports/customer',
    defaultPriority: 'medium'
  },
  security: {
    icon: '🔒',
    color: 'red',
    shortName: 'Security',
    description: 'Laporan keselamatan sistem',
    route: '/reports/security',
    defaultPriority: 'urgent'
  }
};

/**
 * Report status configurations
 */
export const REPORT_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'gray',
    icon: '📝',
    description: 'Laporan dalam pembuatan'
  },
  pending: {
    label: 'Pending Review',
    color: 'yellow', 
    icon: '⏳',
    description: 'Menunggu semakan'
  },
  approved: {
    label: 'Approved',
    color: 'green',
    icon: '✅',
    description: 'Laporan telah diluluskan'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    icon: '❌',
    description: 'Laporan ditolak'
  },
  published: {
    label: 'Published',
    color: 'blue',
    icon: '📰',
    description: 'Laporan telah diterbitkan'
  },
  archived: {
    label: 'Archived',
    color: 'purple',
    icon: '📚',
    description: 'Laporan diarkibkan'
  }
};

/**
 * Report priority configurations
 */
export const REPORT_PRIORITIES = {
  low: {
    label: 'Low',
    color: 'gray',
    icon: '📝',
    weight: 1
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    icon: '📋',
    weight: 2
  },
  high: {
    label: 'High',
    color: 'orange',
    icon: '⚡',
    weight: 3
  },
  urgent: {
    label: 'Urgent',
    color: 'red',
    icon: '🔥',
    weight: 4
  }
};

/**
 * Get metadata for a specific report type
 * @param {string} reportType - Type of report
 * @returns {Object} Report metadata
 */
export const getReportMetadata = (reportType) => {
  return REPORT_METADATA[reportType] || {
    icon: '📄',
    color: 'gray',
    shortName: 'Report',
    description: 'Laporan am',
    route: '/reports',
    defaultPriority: 'medium'
  };
};

/**
 * Get all available report types
 * @returns {Array} Array of report type objects
 */
export const getAllReportTypes = () => {
  return Object.entries(REPORT_METADATA).map(([key, metadata]) => ({
    type: key,
    ...metadata
  }));
};

/**
 * Get all financial report types
 * @returns {Array} Array of financial report type objects
 */
export const getFinancialReportTypes = () => {
  return Object.entries(REPORT_METADATA)
    .filter(([key, metadata]) => metadata.category === 'financial' || key === 'financial')
    .map(([key, metadata]) => ({
      type: key,
      ...metadata
    }));
};

/**
 * Get reports by category
 * @param {Array} reports - Array of reports
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered reports
 */
export const getReportsByCategory = (reports, category) => {
  return reports.filter(report => {
    const metadata = getReportMetadata(report.type);
    return metadata.category === category || report.type === category;
  });
};

/**
 * Check if report type is financial
 * @param {string} reportType - Type of report
 * @returns {boolean} True if report is financial type
 */
export const isFinancialReport = (reportType) => {
  const metadata = getReportMetadata(reportType);
  return metadata.category === 'financial' || reportType === 'financial';
};

/**
 * Get financial report breakdown for dashboard
 * @param {Array} reports - Array of reports
 * @returns {Object} Financial reports breakdown
 */
export const getFinancialReportsBreakdown = (reports) => {
  const financialReports = getReportsByCategory(reports, 'financial');
  
  return {
    budget_summary: financialReports.filter(r => r.type === 'budget_summary'),
    income_statement: financialReports.filter(r => r.type === 'income_statement'),
    revenue_breakdown: financialReports.filter(r => r.type === 'revenue_breakdown'),
    expense_breakdown: financialReports.filter(r => r.type === 'expense_breakdown'),
    other_financial: financialReports.filter(r => r.type === 'financial')
  };
};

/**
 * Get reports by status
 * @param {Array} reports - Array of reports
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered reports
 */
export const getReportsByStatus = (reports, status) => {
  return reports.filter(report => report.status === status);
};

/**
 * Get reports by priority
 * @param {Array} reports - Array of reports
 * @param {string} priority - Priority to filter by
 * @returns {Array} Filtered reports
 */
export const getReportsByPriority = (reports, priority) => {
  return reports.filter(report => report.priority === priority);
};

/**
 * Get reports by type
 * @param {Array} reports - Array of reports
 * @param {string} type - Type to filter by
 * @returns {Array} Filtered reports
 */
export const getReportsByType = (reports, type) => {
  return reports.filter(report => report.type === type);
};

/**
 * Sort reports by priority (urgent first)
 * @param {Array} reports - Array of reports
 * @returns {Array} Sorted reports
 */
export const sortReportsByPriority = (reports) => {
  return [...reports].sort((a, b) => {
    const priorityA = REPORT_PRIORITIES[a.priority]?.weight || 0;
    const priorityB = REPORT_PRIORITIES[b.priority]?.weight || 0;
    return priorityB - priorityA;
  });
};

/**
 * Sort reports by status
 * @param {Array} reports - Array of reports
 * @returns {Array} Sorted reports
 */
export const sortReportsByStatus = (reports) => {
  const statusOrder = ['draft', 'pending', 'approved', 'published', 'rejected', 'archived'];
  return [...reports].sort((a, b) => {
    const indexA = statusOrder.indexOf(a.status);
    const indexB = statusOrder.indexOf(b.status);
    return indexA - indexB;
  });
};

/**
 * Sort reports by date (newest first)
 * @param {Array} reports - Array of reports
 * @returns {Array} Sorted reports
 */
export const sortReportsByDate = (reports) => {
  return [...reports].sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });
};

/**
 * Get active report index from pathname
 * @param {string} pathname - Current URL pathname
 * @param {Array} reports - Array of reports
 * @returns {number} Index of active report or -1
 */
export const getActiveReportIndex = (pathname, reports) => {
  const reportIdMatch = pathname.match(/\/reports\/(.+)/);
  if (!reportIdMatch) return -1;
  
  const reportId = reportIdMatch[1];
  return reports.findIndex(report => report.id === reportId);
};

/**
 * Format report title for display
 * @param {string} title - Original title
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted title
 */
export const formatReportTitle = (title, maxLength = 30) => {
  if (!title) return 'Untitled Report';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
};

/**
 * Get report status color class
 * @param {string} status - Report status
 * @returns {string} CSS color class
 */
export const getReportStatusColor = (status) => {
  const statusConfig = REPORT_STATUSES[status];
  return statusConfig ? statusConfig.color : 'gray';
};

/**
 * Get report priority color class
 * @param {string} priority - Report priority
 * @returns {string} CSS color class
 */
export const getReportPriorityColor = (priority) => {
  const priorityConfig = REPORT_PRIORITIES[priority];
  return priorityConfig ? priorityConfig.color : 'gray';
};

/**
 * Check if report is overdue
 * @param {Object} report - Report object
 * @returns {boolean} True if report is overdue
 */
export const isReportOverdue = (report) => {
  if (!report.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(report.dueDate);
  return now > dueDate && !['approved', 'published', 'archived'].includes(report.status);
};

/**
 * Get report deadline status
 * @param {Object} report - Report object
 * @returns {Object} Deadline status object
 */
export const getReportDeadlineStatus = (report) => {
  if (!report.dueDate) {
    return { status: 'none', message: 'Tiada tarikh tamat', color: 'gray' };
  }

  const now = new Date();
  const dueDate = new Date(report.dueDate);
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { 
      status: 'overdue', 
      message: `Terlewat ${Math.abs(diffDays)} hari`, 
      color: 'red' 
    };
  } else if (diffDays === 0) {
    return { 
      status: 'today', 
      message: 'Tamat hari ini', 
      color: 'orange' 
    };
  } else if (diffDays <= 3) {
    return { 
      status: 'soon', 
      message: `${diffDays} hari lagi`, 
      color: 'yellow' 
    };
  } else {
    return { 
      status: 'ok', 
      message: `${diffDays} hari lagi`, 
      color: 'green' 
    };
  }
};

/**
 * Create sample report data
 * @returns {Array} Array of sample reports
 */
export const createSampleReports = () => {
  return [
    {
      id: 'rpt-001',
      title: 'Laporan Kewangan Q1 2025',
      type: 'financial',
      status: 'approved',
      priority: 'high',
      createdAt: '2025-01-15',
      updatedAt: '2025-02-01',
      dueDate: '2025-02-15',
      author: 'Ahmad Rahman'
    },
    {
      id: 'rpt-002', 
      title: 'Analisis Prestasi Jualan',
      type: 'sales',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-02-01',
      updatedAt: '2025-02-03',
      dueDate: '2025-02-10',
      author: 'Siti Nurhaliza'
    },
    {
      id: 'rpt-003',
      title: 'Audit Keselamatan Sistem',
      type: 'security',
      status: 'draft',
      priority: 'urgent',
      createdAt: '2025-02-03',
      updatedAt: '2025-02-03',
      dueDate: '2025-02-05',
      author: 'Muhammad Ali'
    },
    {
      id: 'rpt-004',
      title: 'Ringkasan Bajet Q1 2025',
      type: 'budget_summary',
      status: 'published',
      priority: 'high',
      createdAt: '2025-01-20',
      updatedAt: '2025-02-01',
      dueDate: '2025-02-28',
      author: 'Finance Team'
    },
    {
      id: 'rpt-005',
      title: 'Penyata Untung Rugi Januari',
      type: 'income_statement',
      status: 'approved',
      priority: 'high',
      createdAt: '2025-01-25',
      updatedAt: '2025-02-02',
      dueDate: '2025-02-15',
      author: 'CFO Office'
    },
    {
      id: 'rpt-006',
      title: 'Pecahan Hasil Mengikut Produk',
      type: 'revenue_breakdown',
      status: 'draft',
      priority: 'medium',
      createdAt: '2025-02-01',
      updatedAt: '2025-02-03',
      dueDate: '2025-02-12',
      author: 'Sales Analytics'
    },
    {
      id: 'rpt-007',
      title: 'Analisis Perbelanjaan Operasi',
      type: 'expense_breakdown',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-01-28',
      updatedAt: '2025-02-02',
      dueDate: '2025-02-14',
      author: 'Operations Team'
    }
  ];
};

/**
 * Create sample financial reports only
 * @returns {Array} Array of financial reports
 */
export const createSampleFinancialReports = () => {
  const allReports = createSampleReports();
  return allReports.filter(report => isFinancialReport(report.type));
};