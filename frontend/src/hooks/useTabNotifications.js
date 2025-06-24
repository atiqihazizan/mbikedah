// hooks/useTabNotifications.js
import { useMemo } from 'react';
import { ROLE_TYPES } from '../utils/roleUtils';

/**
 * Custom hook to calculate tab notifications for each role
 * @param {Object} dashboardData - Dashboard data from API
 * @param {Array} userRoles - Array of user roles
 * @returns {Object} Notifications count for each role index
 */
export const useTabNotifications = (dashboardData, userRoles) => {
  return useMemo(() => {
    if (!userRoles || !Array.isArray(userRoles)) return {};
    
    return userRoles.reduce((acc, role, index) => {
      acc[index] = calculateRoleNotifications(role, dashboardData);
      return acc;
    }, {});
  }, [dashboardData, userRoles]);
};

/**
 * Calculate notifications for a specific role
 * @param {string} role - Role name
 * @param {Object} dashboardData - Dashboard data
 * @returns {number} Notification count
 */
const calculateRoleNotifications = (role, dashboardData) => {
  if (!dashboardData) return 0;
  
  switch (role) {
    case ROLE_TYPES.PEMOHON:
      return calculatePemohonNotifications(dashboardData.applicant);
      
    case ROLE_TYPES.KETUA_JABATAN:
      return calculateHodNotifications(dashboardData.hod);
      
    case ROLE_TYPES.KEWANGAN:
      return calculateFinanceNotifications(dashboardData.finance);
      
    default:
      return 0;
  }
};

/**
 * Calculate notifications for Pemohon role
 * @param {Object} applicantData - Applicant dashboard data
 * @returns {number} Notification count
 */
const calculatePemohonNotifications = (applicantData) => {
  if (!applicantData?.summary) return 0;
  
  const { summary } = applicantData;
  return (
    (summary.pending_approval || 0) +
    (summary.action_required || 0) +
    (summary.rejected_drafts || 0)
  );
};

/**
 * Calculate notifications for HOD role
 * @param {Object} hodData - HOD dashboard data
 * @returns {number} Notification count
 */
const calculateHodNotifications = (hodData) => {
  if (!hodData?.summary) return 0;
  
  const { summary } = hodData;
  return (
    (summary.pending_approvals || 0) +
    (summary.urgent_requests || 0)
  );
};

/**
 * Calculate notifications for Finance role
 * @param {Object} financeData - Finance dashboard data
 * @returns {number} Notification count
 */
const calculateFinanceNotifications = (financeData) => {
  if (!financeData?.status_counts) return 0;
  
  const { status_counts } = financeData;
  return (
    (status_counts.pending_review || 0) +
    (status_counts.pending_verify || 0) +
    (status_counts.pending_payment || 0) +
    (status_counts.urgent_payments || 0)
  );
};

/**
 * Get total notifications across all roles
 * @param {Object} tabNotifications - Notifications object from useTabNotifications
 * @returns {number} Total notification count
 */
export const getTotalNotifications = (tabNotifications) => {
  if (!tabNotifications || typeof tabNotifications !== 'object') return 0;
  
  return Object.values(tabNotifications).reduce((total, count) => {
    return total + (typeof count === 'number' ? count : 0);
  }, 0);
};

/**
 * Check if role has notifications
 * @param {Object} tabNotifications - Notifications object
 * @param {number} roleIndex - Role index to check
 * @returns {boolean} True if role has notifications
 */
export const hasRoleNotifications = (tabNotifications, roleIndex) => {
  return tabNotifications[roleIndex] > 0;
};

/**
 * Get notification count for specific role
 * @param {Object} tabNotifications - Notifications object
 * @param {number} roleIndex - Role index
 * @returns {number} Notification count for role
 */
export const getRoleNotificationCount = (tabNotifications, roleIndex) => {
  return tabNotifications[roleIndex] || 0;
};