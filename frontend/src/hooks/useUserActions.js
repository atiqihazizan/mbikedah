
// hooks/useUserActions.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Custom hook untuk user actions (logout, settings, etc.)
 */
export const useUserActions = (logout) => {
  const navigate = useNavigate()
  
  const handleLogout = useCallback(async () => {
    try {
      // Call logout function from context
      await logout();
      // Note: Redirect is now handled in ContextProvider logout function
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to login even if logout fails
      window.location.href = '/login';
    }
  }, [logout]);

  const handleSettings = useCallback(() => {
    // toast.info('Settings not implemented yet');
    navigate('/settings');
  }, []);

  const handleProfile = useCallback(() => {
    toast.info('Profile not implemented yet');
    // navigate('/settings');
  }, []);

  return {
    handleLogout,
    handleSettings,
    handleProfile
  };
};