// hooks/useDashboardTabs.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// Hook untuk manage tab state dengan localStorage persistence
export const useDashboardTabs = (userRoles = [], storageKey = 'dashboard-active-tab') => {
  const [activeTab, setActiveTab] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousActiveTab = useRef(0);

  // Load saved tab from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem(storageKey);
      if (savedTab !== null) {
        const tabIndex = parseInt(savedTab, 10);
        if (tabIndex >= 0 && tabIndex < userRoles.length) {
          setActiveTab(tabIndex);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved tab from localStorage:', error);
    }
  }, [userRoles.length, storageKey]);

  // Save tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, activeTab.toString());
    } catch (error) {
      console.warn('Failed to save tab to localStorage:', error);
    }
  }, [activeTab, storageKey]);

  // Reset tab if roles change
  useEffect(() => {
    if (userRoles.length > 0 && activeTab >= userRoles.length) {
      setActiveTab(0);
    }
  }, [userRoles.length, activeTab]);

  // Smooth tab change with transition
  const changeTab = useCallback((newTabIndex) => {
    if (newTabIndex === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    previousActiveTab.current = activeTab;
    
    // Small delay for smooth transition
    setTimeout(() => {
      setActiveTab(newTabIndex);
      setIsTransitioning(false);
    }, 150);
  }, [activeTab, isTransitioning]);

  // Navigate to next tab
  const nextTab = useCallback(() => {
    const nextIndex = (activeTab + 1) % userRoles.length;
    changeTab(nextIndex);
  }, [activeTab, userRoles.length, changeTab]);

  // Navigate to previous tab
  const previousTab = useCallback(() => {
    const prevIndex = activeTab === 0 ? userRoles.length - 1 : activeTab - 1;
    changeTab(prevIndex);
  }, [activeTab, userRoles.length, changeTab]);

  return {
    activeTab,
    setActiveTab: changeTab,
    nextTab,
    previousTab,
    isTransitioning,
    previousActiveTab: previousActiveTab.current
  };
};

// Hook untuk manage keyboard navigation
export const useTabKeyboardNavigation = (
  userRoles, 
  activeTab, 
  setActiveTab, 
  containerRef
) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if focus is within the tab container
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      if (userRoles.length <= 1) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = activeTab === 0 ? userRoles.length - 1 : activeTab - 1;
          setActiveTab(prevIndex);
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = (activeTab + 1) % userRoles.length;
          setActiveTab(nextIndex);
          break;
          
        case 'Home':
          e.preventDefault();
          setActiveTab(0);
          break;
          
        case 'End':
          e.preventDefault();
          setActiveTab(userRoles.length - 1);
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, userRoles.length, setActiveTab, containerRef]);
};

// Hook untuk manage dashboard refresh dengan loading states
export const useDashboardRefresh = (fetchFunction) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const refreshTimeoutRef = useRef(null);

  const refresh = useCallback(async (showToast = true) => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await fetchFunction(true);
      setLastRefreshTime(new Date());
      
      if (showToast) {
        toast.success('Dashboard dikemaskini', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      if (showToast) {
        toast.error('Gagal mengemaskini dashboard');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFunction, isRefreshing]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const autoRefresh = () => {
      refresh(false);
    };

    refreshTimeoutRef.current = setInterval(autoRefresh, 5 * 60 * 1000);
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [refresh]);

  return {
    refresh,
    isRefreshing,
    lastRefreshTime
  };
};

// Hook untuk detect urgent notifications per tab
export const useTabNotifications = (dashboardData, userRoles) => {
  const [tabNotifications, setTabNotifications] = useState({});

  useEffect(() => {
    const notifications = {};

    userRoles.forEach((role, index) => {
      let count = 0;
      
      switch (role) {
        case 'Pemohon':
          // Count returned items that need fixing
          const applicantData = dashboardData.applicant;
          if (applicantData?.quick_actions?.returned_to_fix) {
            count += applicantData.quick_actions.returned_to_fix;
          }
          break;
          
        case 'Ketua Jabatan':
          // Count pending approvals
          const hodData = dashboardData.hod;
          if (hodData?.summary?.pending_approvals) {
            count += hodData.summary.pending_approvals;
          }
          break;
          
        case 'Kewangan':
          // Count all pending finance tasks
          const financeData = dashboardData.finance;
          if (financeData?.summary) {
            count += (financeData.summary.pending_review || 0) +
                    (financeData.summary.pending_verify || 0) +
                    (financeData.summary.pending_payment || 0);
          }
          break;
          
        default:
          break;
      }
      
      if (count > 0) {
        notifications[index] = count;
      }
    });

    setTabNotifications(notifications);
  }, [dashboardData, userRoles]);

  return tabNotifications;
};

// Hook untuk manage tab preferences
export const useTabPreferences = () => {
  const [preferences, setPreferences] = useState({
    autoSave: true,
    showNotifications: true,
    animationsEnabled: true,
    compactMode: false
  });

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('dashboard-tab-preferences');
      if (savedPrefs) {
        setPreferences(prev => ({
          ...prev,
          ...JSON.parse(savedPrefs)
        }));
      }
    } catch (error) {
      console.warn('Failed to load tab preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      
      try {
        localStorage.setItem('dashboard-tab-preferences', JSON.stringify(newPrefs));
      } catch (error) {
        console.warn('Failed to save tab preferences:', error);
      }
      
      return newPrefs;
    });
  }, []);

  return {
    preferences,
    updatePreference
  };
};

// Utility function untuk get role metadata
export const getRoleMetadata = (role) => {
  const metadata = {
    'Pemohon': {
      icon: '👤',
      color: 'purple',
      shortName: 'Pemohon',
      description: 'Dashboard untuk pemohon permohonan',
      primaryActions: ['create', 'edit', 'view']
    },
    'Ketua Jabatan': {
      icon: '👨‍💼',
      color: 'blue',
      shortName: 'HOD',
      description: 'Dashboard untuk ketua jabatan',
      primaryActions: ['approve', 'review', 'manage']
    },
    'Kewangan': {
      icon: '💰',
      color: 'green',
      shortName: 'Finance',
      description: 'Dashboard untuk bahagian kewangan',
      primaryActions: ['verify', 'process', 'pay']
    }
  };

  return metadata[role] || {
    icon: '📋',
    color: 'gray',
    shortName: role,
    description: `Dashboard untuk ${role.toLowerCase()}`,
    primaryActions: ['view']
  };
};

// Utility function untuk format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Baru sahaja';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else {
    return date.toLocaleDateString('ms-MY');
  }
};

// Hook untuk manage tab analytics
export const useTabAnalytics = (userRoles) => {
  const [analytics, setAnalytics] = useState({});
  
  const trackTabView = useCallback((tabIndex, role) => {
    const today = new Date().toDateString();
    
    setAnalytics(prev => {
      const newAnalytics = { ...prev };
      
      if (!newAnalytics[today]) {
        newAnalytics[today] = {};
      }
      
      if (!newAnalytics[today][role]) {
        newAnalytics[today][role] = 0;
      }
      
      newAnalytics[today][role]++;
      
      // Save to localStorage
      try {
        localStorage.setItem('dashboard-tab-analytics', JSON.stringify(newAnalytics));
      } catch (error) {
        console.warn('Failed to save analytics:', error);
      }
      
      return newAnalytics;
    });
  }, []);

  // Load analytics from localStorage
  useEffect(() => {
    try {
      const savedAnalytics = localStorage.getItem('dashboard-tab-analytics');
      if (savedAnalytics) {
        setAnalytics(JSON.parse(savedAnalytics));
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error);
    }
  }, []);

  const getMostUsedTab = useCallback(() => {
    const today = new Date().toDateString();
    const todayData = analytics[today];
    
    if (!todayData) return null;
    
    let maxViews = 0;
    let mostUsedRole = null;
    
    Object.entries(todayData).forEach(([role, views]) => {
      if (views > maxViews) {
        maxViews = views;
        mostUsedRole = role;
      }
    });
    
    return mostUsedRole;
  }, [analytics]);

  return {
    trackTabView,
    getMostUsedTab,
    analytics
  };
};

// Export all hooks and utilities
export default {
  useDashboardTabs,
  useTabKeyboardNavigation,
  useDashboardRefresh,
  useTabNotifications,
  useTabPreferences,
  useTabAnalytics,
  getRoleMetadata,
  formatRelativeTime
};