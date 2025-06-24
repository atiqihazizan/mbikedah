// utils/roleUtils.js
/**
 * Role metadata configuration and utility functions
 */

export const ROLE_TYPES = {
  PEMOHON: 'Pemohon',
  KETUA_JABATAN: 'Ketua Jabatan', 
  KEWANGAN: 'Kewangan'
};

export const ROLE_COLORS = {
  PURPLE: 'purple',
  BLUE: 'blue',
  GREEN: 'green',
  GRAY: 'gray'
};

/**
 * Get metadata for a specific role
 * @param {string} role - The role name
 * @returns {Object} Role metadata object
 */
export const getRoleMetadata = (role) => {
  const metadata = {
    [ROLE_TYPES.PEMOHON]: {
      icon: '📝',
      color: ROLE_COLORS.BLUE,
      description: 'Dashboard untuk pemohon',
      shortName: 'Pemohon',
      route: '/billing/dashboard',
      matchPaths: ['/', '/billing/dashboard', '/billing/archive', '/billing/create', '/billing/edit']
    },
    [ROLE_TYPES.KETUA_JABATAN]: {
      icon: '👔',
      color: ROLE_COLORS.PURPLE,
      description: 'Dashboard ketua jabatan',
      shortName: 'HOD',
      route: '/billing/hod',
      matchPaths: ['/billing/hod']
    },
    [ROLE_TYPES.KEWANGAN]: {
      icon: '💰',
      color: ROLE_COLORS.GREEN,
      description: 'Dashboard kewangan',
      shortName: 'Finance',
      route: '/billing/finance',
      matchPaths: ['/billing/finance']
    }
  };
  
  return metadata[role] || {
    icon: '👤',
    color: ROLE_COLORS.GRAY,
    description: 'Dashboard pengguna',
    shortName: role,
    route: '/billing/dashboard',
    matchPaths: ['/']
  };
};

/**
 * Get default route for a role
 * @param {string} role - The role name
 * @returns {string} Default route path
 */
export const getRoleDefaultRoute = (role) => {
  const metadata = getRoleMetadata(role);
  return metadata.route;
};

/**
 * Check if current path matches a role
 * @param {string} currentPath - Current URL path
 * @param {string} role - Role to check against
 * @returns {boolean} True if path matches role
 */
export const isPathMatchingRole = (currentPath, role) => {
  const metadata = getRoleMetadata(role);
  
  if (!metadata.matchPaths) return false;
  
  return metadata.matchPaths.some(path => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  });
};

/**
 * Get active role index based on current path
 * @param {string} currentPath - Current URL path
 * @param {Array} userRoles - Array of user roles
 * @returns {number} Active role index (-1 if none found)
 */
export const getActiveRoleIndex = (currentPath, userRoles) => {
  if (!userRoles || userRoles.length === 0) return -1;
  
  for (let i = 0; i < userRoles.length; i++) {
    if (isPathMatchingRole(currentPath, userRoles[i])) {
      return i;
    }
  }
  
  return -1;
};

/**
 * Get role-based routes mapping
 * @returns {Object} Role routes mapping
 */
export const getRoleRoutes = () => ({
  [ROLE_TYPES.PEMOHON]: '/billing/dashboard',
  [ROLE_TYPES.KETUA_JABATAN]: '/billing/hod',
  [ROLE_TYPES.KEWANGAN]: '/billing/finance'
});