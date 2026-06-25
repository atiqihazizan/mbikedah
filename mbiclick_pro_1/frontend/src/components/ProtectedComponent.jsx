// components/ProtectedComponent.jsx
import React from 'react';
import { useHasPermission, useHasPermissions } from '../hooks/usePermissions';

/**
 * Component wrapper for permission-based rendering
 * @param {string} permission - Single permission to check
 * @param {Array} permissions - Array of permissions to check  
 * @param {string} mode - 'any' or 'all' when checking multiple permissions
 * @param {React.ReactNode} children - Content to render if permission granted
 * @param {React.ReactNode} fallback - Content to render if permission denied
 * @param {boolean} showFallback - Whether to show fallback or return null
 * @returns {React.ReactNode} Protected content or fallback
 */
const ProtectedComponent = ({ 
  permission, 
  permissions,
  mode = 'any',
  children, 
  fallback = null,
  showFallback = false 
}) => {
  // Single permission check
  const hasSinglePermission = useHasPermission(permission);
  
  // Multiple permissions check
  const hasMultiplePermissions = useHasPermissions(permissions, mode);
  
  // Determine if user has access
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (permissions) {
    hasAccess = hasMultiplePermissions;
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }
  
  // Render based on access
  if (hasAccess) {
    return children;
  }
  
  // No access - return fallback or null
  if (showFallback && fallback) {
    return fallback;
  }
  
  return null;
};

/**
 * Higher-order component for protecting components with permissions
 * @param {React.Component} Component - Component to protect
 * @param {string|Array} requiredPermissions - Required permissions
 * @param {Object} options - Additional options
 * @returns {React.Component} Protected component
 */
export const withPermissions = (Component, requiredPermissions, options = {}) => {
  const { mode = 'any', fallback = null } = options;
  
  return function ProtectedComponentHOC(props) {
    const permission = typeof requiredPermissions === 'string' ? requiredPermissions : null;
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : null;
    
    return (
      <ProtectedComponent 
        permission={permission}
        permissions={permissions}
        mode={mode}
        fallback={fallback}
        showFallback={true}
      >
        <Component {...props} />
      </ProtectedComponent>
    );
  };
};

/**
 * Protected Button Component
 */
export const ProtectedButton = ({ permission, permissions, mode, children, ...props }) => (
  <ProtectedComponent permission={permission} permissions={permissions} mode={mode}>
    <button {...props}>
      {children}
    </button>
  </ProtectedComponent>
);

/**
 * Protected Link Component
 */
export const ProtectedLink = ({ permission, permissions, mode, children, ...props }) => (
  <ProtectedComponent permission={permission} permissions={permissions} mode={mode}>
    <a {...props}>
      {children}
    </a>
  </ProtectedComponent>
);

/**
 * Protected Navigation Item Component
 */
export const ProtectedNavItem = ({ 
  permission, 
  permissions, 
  mode, 
  to, 
  children, 
  className = '',
  activeClassName = '',
  ...props 
}) => {
  return (
    <ProtectedComponent permission={permission} permissions={permissions} mode={mode}>
      <a 
        href={to}
        className={`${className} ${window.location.pathname === to ? activeClassName : ''}`}
        {...props}
      >
        {children}
      </a>
    </ProtectedComponent>
  );
};

/**
 * Protected Section Component - for grouping related protected content
 */
export const ProtectedSection = ({ 
  permission, 
  permissions, 
  mode,
  title,
  children,
  className = '',
  showTitle = true
}) => (
  <ProtectedComponent permission={permission} permissions={permissions} mode={mode}>
    <section className={className}>
      {showTitle && title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      {children}
    </section>
  </ProtectedComponent>
);

/**
 * Conditional render based on permissions with custom logic
 */
export const ConditionalRender = ({ 
  condition, 
  permission,
  permissions,
  mode,
  children,
  fallback = null 
}) => {
  const hasPermissionAccess = permission ? useHasPermission(permission) : true;
  const hasPermissionsAccess = permissions ? useHasPermissions(permissions, mode) : true;
  
  const hasAccess = hasPermissionAccess && hasPermissionsAccess && condition;
  
  return hasAccess ? children : fallback;
};

/**
 * Permission Guard for complex permission logic
 */
export const PermissionGuard = ({ 
  rules, 
  children, 
  fallback = null,
  mode = 'and' // 'and' or 'or'
}) => {
  const checkRules = () => {
    if (!Array.isArray(rules)) return false;
    
    const results = rules.map(rule => {
      if (typeof rule === 'function') {
        return rule(); // Custom function
      }
      if (typeof rule === 'string') {
        return useHasPermission(rule); // Single permission
      }
      if (Array.isArray(rule)) {
        return useHasPermissions(rule, 'any'); // Multiple permissions
      }
      return false;
    });
    
    if (mode === 'or') {
      return results.some(result => result);
    }
    
    return results.every(result => result);
  };
  
  return checkRules() ? children : fallback;
};

export default ProtectedComponent;
