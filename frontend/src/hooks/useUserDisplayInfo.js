// hooks/useUserDisplayInfo.js
import { useMemo } from 'react';

/**
 * Custom hook untuk format user display information
 */
export const useUserDisplayInfo = (currentUser) => {
  const userDisplayInfo = useMemo(() => ({
    name: currentUser?.name || 'Pengguna',
    department: currentUser?.department || 'Tiada jabatan',
    email: currentUser?.email || 'Tiada email'
  }), [currentUser]);

  return userDisplayInfo;
};