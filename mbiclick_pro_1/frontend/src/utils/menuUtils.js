import { hasPermission } from './constants';

/**
 * Generate navigation items dynamically based on user abilities
 * @param {Array} userAbilities - Array of user ability IDs
 * @returns {Array} Array of navigation items
 */
export const generateNavigationItems = (userAbilities) => {
  const menuItems = [];
  
  // Dashboard
  if (hasPermission(userAbilities, 'dashboard.view')) {
    menuItems.push({
      id: 'dashboard',
      title: 'Dashboard', 
      route: '/dashboard',
      icon: 'home',
      permission: 'dashboard.view'
    });
  }
  
  // Billing section
  const billingItems = [];
  if (hasPermission(userAbilities, 'billing.create')) {
    billingItems.push({ 
      title: 'Create Billing', 
      route: '/applicant/create',
      permission: 'billing.create'
    });
  }
  if (hasPermission(userAbilities, 'billing.incomplete')) {
    billingItems.push({ 
      title: 'Active Billings', 
      route: '/billing/dashboard',
      permission: 'billing.incomplete'
    });
  }
  if (hasPermission(userAbilities, 'billing.archive')) {
    billingItems.push({ 
      title: 'Archive', 
      route: '/billing/archive',
      permission: 'billing.archive'
    });
  }
  if (hasPermission(userAbilities, 'billing.hod')) {
    billingItems.push({ 
      title: 'HOD Approval', 
      route: '/billing/hod',
      permission: 'billing.hod'
    });
  }
  if (hasPermission(userAbilities, 'billing.finance')) {
    billingItems.push({ 
      title: 'Finance Actions', 
      route: '/finance',
      permission: 'billing.finance'
    });
  }
  
  if (billingItems.length > 0) {
    menuItems.push({
      id: 'billing',
      title: 'Billing',
      children: billingItems,
      icon: 'billing'
    });
  }
  
  // Reports section  
  const reportItems = [];
  if (hasPermission(userAbilities, 'report.budget.summary')) {
    reportItems.push({ 
      title: 'Budget Summary', 
      route: '/reports/budget_summary',
      permission: 'report.budget.summary'
    });
  }
  if (hasPermission(userAbilities, 'report.income.statement')) {
    reportItems.push({ 
      title: 'Income Statement', 
      route: '/reports/income_statement',
      permission: 'report.income.statement'
    });
  }
  if (hasPermission(userAbilities, 'report.revenue.breakdown')) {
    reportItems.push({ 
      title: 'Revenue Breakdown', 
      route: '/reports/revenue_breakdown',
      permission: 'report.revenue.breakdown'
    });
  }
  if (hasPermission(userAbilities, 'report.expense.breakdown')) {
    reportItems.push({ 
      title: 'Expense Breakdown', 
      route: '/reports/expense_breakdown',
      permission: 'report.expense.breakdown'
    });
  }
  if (hasPermission(userAbilities, 'report.detail')) {
    reportItems.push({ 
      title: 'Detailed Report', 
      route: '/report/detail',
      permission: 'report.detail'
    });
  }
  
  if (reportItems.length > 0) {
    menuItems.push({
      id: 'reports',
      title: 'Reports', 
      children: reportItems,
      icon: 'reports'
    });
  }
  
  // Settings section
  const settingsItems = [];
  if (hasPermission(userAbilities, 'settings.view')) {
    settingsItems.push({ 
      title: 'System Settings', 
      route: '/settings',
      permission: 'settings.view'
    });
  }
  if (hasPermission(userAbilities, 'settings.bank')) {
    settingsItems.push({ 
      title: 'Bank Settings', 
      route: '/settings/bank',
      permission: 'settings.bank'
    });
  }
  if (hasPermission(userAbilities, 'settings.code')) {
    settingsItems.push({ 
      title: 'Code Settings', 
      route: '/settings/code',
      permission: 'settings.code'
    });
  }
  if (hasPermission(userAbilities, 'settings.budget')) {
    settingsItems.push({ 
      title: 'Budget Settings', 
      route: '/settings/budget',
      permission: 'settings.budget'
    });
  }
  
  if (settingsItems.length > 0) {
    menuItems.push({
      id: 'settings',
      title: 'Settings', 
      children: settingsItems,
      icon: 'settings'
    });
  }
  
  return menuItems;
};

/**
 * Check if user has access to finance features
 * @param {Array} userAbilities - Array of user ability IDs
 * @returns {boolean} True if user has finance access
 */
export const hasFinanceAccess = (userAbilities) => {
  return hasPermission(userAbilities, 'billing.finance');
};

/**
 * Check if user has access to any reports
 * @param {Array} userAbilities - Array of user ability IDs
 * @returns {boolean} True if user has report access
 */
export const hasReportAccess = (userAbilities) => {
  const reportPermissions = [
    'report.budget.summary',
    'report.income.statement', 
    'report.revenue.breakdown',
    'report.expense.breakdown',
    'report.detail'
  ];
  
  return reportPermissions.some(permission => 
    hasPermission(userAbilities, permission)
  );
};

/**
 * Get role-specific dashboard routes
 * @param {Array} userAbilities - Array of user ability IDs
 * @returns {Array} Array of dashboard routes
 */
export const getRoleDashboards = (userAbilities) => {
  const dashboards = [];
  
  if (hasPermission(userAbilities, 'billing.create') || hasPermission(userAbilities, 'billing.incomplete')) {
    dashboards.push({
      role: 'applicant',
      title: 'Pemohon',
      route: '/applicant/dashboard',
      color: 'blue'
    });
  }
  
  if (hasPermission(userAbilities, 'billing.hod')) {
    dashboards.push({
      role: 'hod',
      title: 'Ketua Jabatan',
      route: '/hod',
      color: 'purple'
    });
  }
  
  if (hasPermission(userAbilities, 'billing.finance')) {
    dashboards.push({
      role: 'finance',
      title: 'Kewangan',
      route: '/finance',
      color: 'green'
    });
  }
  
  return dashboards;
};

export default {
  generateNavigationItems,
  hasFinanceAccess,
  hasReportAccess,
  getRoleDashboards
};
