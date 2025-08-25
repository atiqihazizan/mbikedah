
// hooks/useUserActions.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Custom hook untuk user actions (logout, settings, etc.)
 */
export const useUserActions = (logout) => {
  const navigate = useNavigate()
  
  /**
   * Handle logout action
   * FIXED: Removed fallback window.location.href redirect to prevent page reload
   */
  const handleLogout = useCallback(async () => {
    try {
      // Call logout function from context
      await logout();
      // Note: Redirect is now handled by ProtectedRoute via React Router
      // This ensures smooth SPA navigation without page refresh
    } catch (error) {
      console.error('Logout error:', error);
      
      // REMOVED: window.location.href = '/login'
      // WHY: Created competing redirects with ContextProvider logout()
      // WHY: Caused page reload instead of smooth React Router navigation
      // NOW: ProtectedRoute handles all redirects consistently via <Navigate replace />
      // BENEFIT: Even if logout fails, ProtectedRoute will redirect properly
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