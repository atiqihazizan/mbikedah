// hooks/useRealTimeUpdates.js
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook untuk real-time updates menggunakan WebSocket atau polling
 */
export const useRealTimeUpdates = (endpoint, interval = 30000) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await apiClient.get(endpoint);
        if (response.success) {
          setData(response.data);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error fetching real-time updates:', error);
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchUpdates();

    // Setup interval for polling
    intervalRef.current = setInterval(fetchUpdates, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endpoint, interval]);

  return { data, isConnected };
};

// hooks/usePermissions.js
import { useMemo } from 'react';
import { useStateContext } from '../contexts/ContextProvider';

/**
 * Custom hook untuk check user permissions
 */
export const usePermissions = () => {
  const { currentUser } = useStateContext();

  const permissions = useMemo(() => {
    if (!currentUser?.permissions) return {};

    return {
      canApprove: currentUser.permissions.includes('approve'),
      canReject: currentUser.permissions.includes('reject'),
      canEdit: currentUser.permissions.includes('edit'),
      canDelete: currentUser.permissions.includes('delete'),
      canViewFinance: currentUser.permissions.includes('view_finance'),
      canManageUsers: currentUser.permissions.includes('manage_users'),
      
      // Helper functions
      hasPermission: (permission) => currentUser.permissions.includes(permission),
      hasAnyPermission: (permissionList) => permissionList.some(p => currentUser.permissions.includes(p)),
      hasAllPermissions: (permissionList) => permissionList.every(p => currentUser.permissions.includes(p))
    };
  }, [currentUser]);

  return permissions;
};

// hooks/useAutoSave.js
import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook untuk auto-save functionality
 */
export const useAutoSave = (data, saveFunction, delay = 2000) => {
  const debouncedData = useDebounce(data, delay);
  const initialRender = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const save = useCallback(async (dataToSave) => {
    if (!dataToSave || initialRender.current) return;
    
    try {
      setIsSaving(true);
      await saveFunction(dataToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    save(debouncedData);
  }, [debouncedData, save]);

  return { isSaving, lastSaved };
};

// hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

/**
 * Custom hook untuk keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      for (const shortcut of shortcuts) {
        const { key, ctrl, alt, shift, action } = shortcut;
        
        if (
          event.key === key &&
          event.ctrlKey === !!ctrl &&
          event.altKey === !!alt &&
          event.shiftKey === !!shift
        ) {
          event.preventDefault();
          action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// hooks/useBreakpoint.js
import { useState, useEffect } from 'react';

/**
 * Custom hook untuk responsive breakpoints
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
    isLarge: ['xl', '2xl'].includes(breakpoint)
  };
};

// hooks/useConfirmDialog.js
import { useState, useCallback } from 'react';

/**
 * Custom hook untuk confirmation dialogs
 */
export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showDialog = useCallback(({ title, message, onConfirm, onCancel }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    closeDialog();
  }, [dialog.onConfirm, closeDialog]);

  const handleCancel = useCallback(() => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    closeDialog();
  }, [dialog.onCancel, closeDialog]);

  return {
    dialog,
    showDialog,
    closeDialog,
    handleConfirm,
    handleCancel
  };
};

// hooks/useAsync.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook untuk async operations
 */
export const useAsync = (asyncFunction, dependencies = []) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    return asyncFunction()
      .then((response) => {
        setValue(response);
        setStatus('success');
      })
      .catch((error) => {
        setError(error);
        setStatus('error');
      });
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    execute,
    status,
    value,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
};

// hooks/useNotificationCenter.js
import { useState, useCallback } from 'react';

/**
 * Custom hook untuk notification center
 */
export const useNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto remove after timeout
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead
  };
};