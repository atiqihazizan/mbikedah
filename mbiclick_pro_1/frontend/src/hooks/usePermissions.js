// hooks/usePermissions.js
import { useMemo } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { hasPermission } from '../utils/constants';
import { 
  generateNavigationItems, 
  hasFinanceAccess, 
  hasReportAccess,
  getRoleDashboards 
} from '../utils/menuUtils';
import { generateReportItems } from '../utils/reportUtils';

/**
 * Custom hook for permission checking and menu generation
 * @returns {Object} Permission utilities and menu data
 */
export const usePermissions = () => {
  const { currentUser } = useStateContext();
  
  // Memoize heavy computations
  const userAbilities = useMemo(() => {
    return currentUser?.abilities || [];
  }, [currentUser?.abilities]);
  
  const navigationItems = useMemo(() => {
    return generateNavigationItems(userAbilities);
  }, [userAbilities]);
  
  const reportItems = useMemo(() => {
    return generateReportItems(userAbilities);
  }, [userAbilities]);
  
  const roleDashboards = useMemo(() => {
    return getRoleDashboards(userAbilities);
  }, [userAbilities]);
  
  // Permission checking functions
  const checkPermission = (permission) => {
    return hasPermission(userAbilities, permission);
  };
  
  const checkAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => checkPermission(permission));
  };
  
  const checkAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => checkPermission(permission));
  };
  
  // Role checking functions
  const isAdmin = () => {
    return userAbilities.includes(1); // ADMIN = 1
  };
  
  const isApplicant = () => {
    return userAbilities.includes(2); // APPLICANT = 2
  };
  
  const isHOD = () => {
    return userAbilities.includes(3); // HOD = 3
  };
  
  const isFinance = () => {
    return userAbilities.some(ability => [4, 5, 6, 7].includes(ability));
  };
  
  // Feature access functions
  const canAccessFinance = useMemo(() => {
    return hasFinanceAccess(userAbilities);
  }, [userAbilities]);
  
  const canAccessReports = useMemo(() => {
    return hasReportAccess(userAbilities);
  }, [userAbilities]);
  
  const canCreateBilling = useMemo(() => {
    return checkPermission('billing.create');
  }, [userAbilities]);
  
  const canViewDashboard = useMemo(() => {
    return checkPermission('dashboard.view');
  }, [userAbilities]);
  
  // Get available routes based on permissions
  const getAvailableRoutes = () => {
    const routes = [];
    
    navigationItems.forEach(item => {
      if (item.route) {
        routes.push(item.route);
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.route) {
            routes.push(child.route);
          }
        });
      }
    });
    
    return routes;
  };
  
  // Get user role names for display
  const getRoleNames = () => {
    const roles = [];
    
    if (isAdmin()) roles.push('Pentadbir');
    if (isApplicant()) roles.push('Pemohon');
    if (isHOD()) roles.push('Ketua Jabatan');
    if (isFinance()) roles.push('Kewangan');
    
    return roles;
  };
  
  // Check if user can access specific routes
  const canAccessRoute = (route) => {
    const availableRoutes = getAvailableRoutes();
    return availableRoutes.includes(route);
  };
  
  return {
    // User data
    currentUser,
    userAbilities,
    isAuthenticated: !!currentUser,
    
    // Permission checking
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    
    // Role checking
    isAdmin,
    isApplicant,
    isHOD,
    isFinance,
    
    // Feature access
    canAccessFinance,
    canAccessReports,
    canCreateBilling,
    canViewDashboard,
    
    // Menu data
    navigationItems,
    reportItems,
    roleDashboards,
    
    // Utility functions
    getAvailableRoutes,
    getRoleNames,
    canAccessRoute
  };
};

/**
 * Hook for checking specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const useHasPermission = (permission) => {
  const { checkPermission } = usePermissions();
  return checkPermission(permission);
};

/**
 * Hook for checking multiple permissions
 * @param {Array} permissions - Array of permissions to check
 * @param {string} mode - 'any' or 'all' (default: 'any')
 * @returns {boolean} True if user has required permissions
 */
export const useHasPermissions = (permissions, mode = 'any') => {
  const { checkAnyPermission, checkAllPermissions } = usePermissions();
  
  if (mode === 'all') {
    return checkAllPermissions(permissions);
  }
  
  return checkAnyPermission(permissions);
};

/**
 * Hook for checking user roles
 * @returns {Object} Role checking utilities
 */
export const useUserRoles = () => {
  const { isAdmin, isApplicant, isHOD, isFinance, getRoleNames } = usePermissions();
  
  return {
    isAdmin,
    isApplicant,
    isHOD,
    isFinance,
    roleNames: getRoleNames()
  };
};

export default usePermissions;
