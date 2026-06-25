
// hooks/useActiveRole.js
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getRoleMetadata } from '../utils/roleUtils';

/**
 * Custom hook untuk determine active role berdasarkan current route
 */
export const useActiveRole = (userRoles) => {
  const location = useLocation();

  const currentActiveRole = useMemo(() => {
    const currentPath = location.pathname;
    
    for (let i = 0; i < userRoles.length; i++) {
      const role = userRoles[i];
      const metadata = getRoleMetadata(role);
      
      if (metadata.matchPaths && metadata.matchPaths.some(path => {
        if (path === '/') return currentPath === '/';
        return currentPath.startsWith(path);
      })) {
        return role;
      }
    }
    
    return userRoles[0] || null;
  }, [location.pathname, userRoles]);

  const hasMultipleRoles = userRoles.length > 1;

  return {
    currentActiveRole,
    hasMultipleRoles
  };
};