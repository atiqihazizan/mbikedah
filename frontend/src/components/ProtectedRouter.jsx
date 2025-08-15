// components/guards/ProtectedRoute.jsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import { useTheme } from '../hooks';

/**
 * Protected Route Component
 * Prevents access to routes when user is not authenticated
 */
export default function ProtectedRoute({ 
  children, 
  requireRole = null, 
  redirectTo = '/login',
  loadingComponent = null 
}) {
  const { currentUser, isLoading } = useStateContext(); // Now using isLoading from context
  const location = useLocation();
  const { isDark } = useTheme();

  // Show loading if still checking authentication
  if (isLoading) {
    return loadingComponent || <DefaultLoadingScreen isDark={isDark} />;
  }

  // Redirect to login if no current user
  if (!currentUser) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // Check role requirement if specified
  if (requireRole && !hasRequiredRole(currentUser, requireRole)) {
    return <UnauthorizedAccess isDark={isDark} />;
  }

  // Render protected content
  return children;
}

/**
 * Role-based access control helper
 */
function hasRequiredRole(user, requiredRole) {
  if (!requiredRole) return true;
  
  // Check if user has abilities (new structure)
  if (user.ability && user.ability.length > 0) {
    // Handle string role requirement
    if (typeof requiredRole === 'string') {
      return user.ability.some(ability => 
        ability === requiredRole || 
        (typeof ability === 'object' && ability.name === requiredRole)
      );
    }

    // Handle array of roles requirement
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(reqRole =>
        user.ability.some(userAbility =>
          userAbility === reqRole ||
          (typeof userAbility === 'object' && userAbility.name === reqRole)
        )
      );
    }
  }
  
  // Fallback: Check if user has roles (old structure for backward compatibility)
  if (user.roles && user.roles.length > 0) {
    // Handle string role requirement
    if (typeof requiredRole === 'string') {
      return user.roles.some(role => 
        role === requiredRole || 
        (typeof role === 'object' && role.name === requiredRole)
      );
    }

    // Handle array of roles requirement
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(reqRole =>
        user.roles.some(userRole =>
          userRole === reqRole ||
          (typeof userRole === 'object' && userRole.name === reqRole)
        )
      );
    }
  }

  return false;
}

/**
 * Default Loading Screen Component
 */
const DefaultLoadingScreen = ({ isDark }) => (
  <div className={`min-h-screen flex items-center justify-center ${
    isDark ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className="text-center">
      <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6 ${
        isDark ? 'border-blue-400' : 'border-blue-600'
      }`}></div>
      <h2 className={`text-xl font-semibold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Memuat...
      </h2>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Mengesahkan akses anda
      </p>
    </div>
  </div>
);

/**
 * Unauthorized Access Component
 */
const UnauthorizedAccess = ({ isDark }) => (
  <div className={`min-h-screen flex items-center justify-center ${
    isDark ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className="text-center max-w-md mx-auto px-4">
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
        isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600'
      }`}>
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      </div>
      
      <h2 className={`text-2xl font-bold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Akses Ditolak
      </h2>
      
      <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Anda tidak mempunyai kebenaran untuk mengakses halaman ini.
      </p>
      
      <button
        onClick={() => window.history.back()}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>
);

/**
 * Higher-Order Component for protecting routes with specific roles
 */
export function withRoleProtection(Component, requiredRole) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requireRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking current user permissions
 */
export function usePermissions() {
  const { currentUser } = useStateContext();

  const hasRole = (role) => {
    if (!currentUser?.ability && !currentUser?.roles) return false;
    return hasRequiredRole(currentUser, role);
  };

  const hasAnyRole = (roles) => {
    if (!currentUser?.ability && !currentUser?.roles) return false;
    return hasRequiredRole(currentUser, roles);
  };

  const hasAllRoles = (roles) => {
    if ((!currentUser?.ability && !currentUser?.roles) || !Array.isArray(roles)) return false;
    return roles.every(role => hasRequiredRole(currentUser, role));
  };

  const hasAbility = (ability) => {
    if (!currentUser?.ability) return false;
    return currentUser.ability.includes(ability);
  };

  const hasAnyAbility = (abilities) => {
    if (!currentUser?.ability || !Array.isArray(abilities)) return false;
    return abilities.some(ability => currentUser.ability.includes(ability));
  };

  const hasAllAbilities = (abilities) => {
    if (!currentUser?.ability || !Array.isArray(abilities)) return false;
    return abilities.every(ability => currentUser.ability.includes(ability));
  };

  return {
    currentUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasAbility,
    hasAnyAbility,
    hasAllAbilities,
    isAuthenticated: !!currentUser
  };
}