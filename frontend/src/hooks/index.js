// hooks/index.js
// Auto-generated on: 8/4/2025, 2:27:14 PM
// Total hooks: 18

/**
 * Centralized exports for all custom React hooks
 * 
 * Categories:
 * - data: Data fetching and state management hooks
 * - form: Form handling and validation hooks  
 * - ui: UI state and interaction hooks
 * - business: Business logic and domain-specific hooks
 * - utility: General utility and helper hooks
 * - auth: Authentication and user action hooks
 * - reports: Report-specific hooks
 */

// ==================== DATA HOOKS ====================
// Hooks for data fetching, API calls, and remote state management
export { useUserData } from './useUserData';

// ==================== FORM HOOKS ====================
// Hooks for form handling, validation, and user input management
export { useBillingForm } from './useBillingForm';
export { usePasswordChange } from './usePasswordChange';

// ==================== UI HOOKS ====================
// Hooks for UI state, theme, notifications, and user interactions
export { useBillingTableApplicant } from './useBillingTableApplicant';
export { useBillingTableFinance } from './useBillingTableFinance';
export { useBillingTableHOD } from './useBillingTableHOD';
export { useBillingViewDialog } from './useBillingViewDialog';
export { useTabNotifications } from './useTabNotifications';
export { useTheme } from './useTheme';

// ==================== BUSINESS HOOKS ====================
// Hooks for business logic, roles, permissions, and domain operations
export { useActiveRole } from './useActiveRole';
export { useBudgetSettings } from './useBudgetSettings';

// ==================== UTILITY HOOKS ====================
// General utility hooks for common functionality
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useUserDisplayInfo } from './useUserDisplayInfo';

// ==================== AUTH HOOKS ====================
// Authentication, user management, and security-related hooks
export { useUserActions } from './useUserActions';

// ==================== REPORT HOOKS ====================
// Report-specific hooks for data management and calculations
export { default as useBudgetSummary } from './useBudgetSummary';
export { default as useRevenueBreakdown } from './useRevenueBreakdown';
export { default as useExpenseBreakdown } from './useExpenseBreakdown';
export { default as useIncomeExpediturreStatment } from './useIncomeExpediturreStatment';
export { usePrintout } from './usePrintout';

// ==================== USAGE EXAMPLES ====================
// Single hook import:
// import { useActiveRole } from '../hooks';

// Multiple hooks import:
// import { useActiveRole, useBillingForm, useBillingTableApplicant } from '../hooks';

// Category-specific import (recommended for large files):
// import { useUserData, useRealTimeUpdates } from '../hooks';        // data hooks
// import { useTheme, useTabNotifications } from '../hooks';           // ui hooks  
// import { useBillingTableApplicant, useActiveRole } from '../hooks'; // business hooks
// import { useBudgetSummary, useIncomeExpenditureStatement } from '../hooks'; // report hooks
