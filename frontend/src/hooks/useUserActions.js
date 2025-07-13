
// hooks/useUserActions.js
import { useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook untuk user actions (logout, settings, etc.)
 */
export const useUserActions = (logout) => {
  const handleLogout = useCallback(async () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  const handleSettings = useCallback(() => {
    toast.info('Settings not implemented yet');
    // navigate('/settings');
  }, []);

  return {
    handleLogout,
    handleSettings
  };
};