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
    route: '/reports/budget_summary',
    defaultPriority: 'high',
    category: 'financial'
  },
  income_statement: {
    icon: '📊',
    color: 'blue',
    shortName: 'P&L',
    description: 'Penyata hasil dan belanja',
    route: '/reports/income_statement',
    defaultPriority: 'high',
    category: 'financial'
  },
  revenue_breakdown: {
    icon: '📈',
    color: 'green',
    shortName: 'Hasil',
    description: 'Sub hasil dan pecahan pendapatan',
    route: '/reports/revenue_breakdown',
    defaultPriority: 'medium',
    category: 'financial'
  },
  expense_breakdown: {
    icon: '📉',
    color: 'red',
    shortName: 'Belanja',
    description: 'Sub belanja dan pecahan perbelanjaan',
    route: '/reports/expense_breakdown',
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
 * Generate reports list dynamically based on user abilities
 * @param {Array} userAbilities - Array of user ability IDs
 * @returns {Array} Array of report items
 */
export const generateReportItems = (userAbilities) => {
  // Import hasPermission from constants
  const hasPermission = (abilities, permission) => {
    const permissionMap = {
      'report.budget.summary': [1, 2, 3, 4, 5, 6, 7],
      'report.income.statement': [1, 2, 3, 4, 5, 6, 7],
      'report.revenue.breakdown': [1, 2, 3, 4, 5, 6, 7],
      'report.expense.breakdown': [1, 2, 3, 4, 5, 6, 7],
      'report.detail': [1, 2, 3, 4, 5, 6, 7]
    };
    
    const allowedAbilities = permissionMap[permission] || [];
    return abilities.some(ability => allowedAbilities.includes(ability));
  };

  const reportItems = [
    {
      id: 'budget_summary',
      title: 'Ringkasan Bajet',
      type: 'budget_summary',
      status: 'Completed',
      priority: 'High',
      route: '/reports/budget_summary',
      permission: 'report.budget.summary'
    },
    {
      id: 'income_statement',
      title: 'Penyata Hasil & Belanja',
      type: 'income_statement',
      status: 'Completed',
      priority: 'High',
      route: '/reports/income_statement',
      permission: 'report.income.statement'
    },
    {
      id: 'revenue_breakdown',
      title: 'Pecahan Hasil',
      type: 'revenue_breakdown',
      status: 'Completed',
      priority: 'Medium',
      route: '/reports/revenue_breakdown',
      permission: 'report.revenue.breakdown'
    },
    {
      id: 'expense_breakdown',
      title: 'Pecahan Belanja',
      type: 'expense_breakdown',
      status: 'Completed',
      priority: 'High',
      route: '/reports/expense_breakdown',
      permission: 'report.expense.breakdown'
    },
    {
      id: 'detailed_report',
      title: 'Laporan Terperinci',
      type: 'detail',
      status: 'Completed',
      priority: 'Medium',
      route: '/report/detail',
      permission: 'report.detail'
    }
  ];
  
  // Filter reports based on permissions
  return reportItems.filter(report => 
    hasPermission(userAbilities, report.permission)
  );
};