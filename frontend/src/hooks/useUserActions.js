
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
      toast.success('Berjaya log keluar');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ralat semasa log keluar');
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