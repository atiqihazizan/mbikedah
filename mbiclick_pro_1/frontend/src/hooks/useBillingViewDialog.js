import { useState } from 'react';
import { toast } from 'react-toastify';
import { formatDate } from '../config/format';
import apiClient from '../utils/axios';

/**
 * Custom hook untuk manage HodViewDialog data fetching dan state
 */
export const useBillingViewDialog = () => {
  const [viewBilling, setViewBilling] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function untuk extract days
  const extractDays = (daysPendingDisplay) => {
    if (!daysPendingDisplay) return 0;
    const match = daysPendingDisplay.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  /**
   * Fetch billing detail dari API
   */
  const fetchBillingDetail = async (billingId, billingBasicInfo = null) => {
    if (!billingId) return;

    setLoading(true);
    setError(null);
    setViewBilling(null);

    try {
      const { data } = await apiClient.get(`/billings/${billingId}`);
      
      // Process the data
      const processedData = {
        ...data,
        issued_at: formatDate(data.issued_at),
        days_pending_display: billingBasicInfo?.days_pending_display || data.days_pending_display,
        days_pending: extractDays(billingBasicInfo?.days_pending_display || data.days_pending_display)
      };

      setViewBilling(processedData);
    } catch (error) {
      console.error('Error fetching billing detail:', error);
      const errorMessage = error.response?.data?.message || 'Ralat semasa mendapatkan maklumat permohonan';
      setError(errorMessage);
      toast.error('Ralat semasa melihat permohonan');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset semua state
   */
  const resetState = () => {
    setViewBilling(null);
    setError(null);
    setLoading(false);
  };

  /**
   * Retry fetch operation
   */
  const retryFetch = (billingId, billingBasicInfo = null) => {
    fetchBillingDetail(billingId, billingBasicInfo);
  };

  return {
    // State values
    viewBilling,
    loading,
    error,
    
    // Actions
    fetchBillingDetail,
    resetState,
    retryFetch,
    
    // Computed values
    hasData: !!viewBilling,
    isEmpty: !loading && !error && !viewBilling,
    isUrgent: viewBilling?.days_pending > 3,
    isCritical: viewBilling?.days_pending > 7,
    canTakeActions: viewBilling?.status_id === 2 // Pending approval status
  };
};

/**
 * Enhanced hook dengan additional features untuk future use
 */
export const useEnhancedBillingViewDialog = () => {
  const basicHook = useBillingViewDialog();
  
  // Additional state untuk enhanced features
  const [viewHistory, setViewHistory] = useState([]);
  const [cache, setCache] = useState(new Map());

  /**
   * Enhanced fetch dengan caching
   */
  const fetchWithCache = async (billingId, billingBasicInfo = null, forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && cache.has(billingId)) {
      const cachedData = cache.get(billingId);
      // Check if cache is still valid (e.g., less than 5 minutes old)
      const isValidCache = Date.now() - cachedData.timestamp < 5 * 60 * 1000;
      
      if (isValidCache) {
        basicHook.setViewBilling(cachedData.data);
        return;
      }
    }

    // Fetch from API
    await basicHook.fetchBillingDetail(billingId, billingBasicInfo);
    
    // Update cache
    if (basicHook.viewBilling) {
      setCache(prev => new Map(prev.set(billingId, {
        data: basicHook.viewBilling,
        timestamp: Date.now()
      })));
    }
  };

  /**
   * Add to view history
   */
  const addToHistory = (billingData) => {
    setViewHistory(prev => {
      const newHistory = prev.filter(item => item.id !== billingData.id);
      return [billingData, ...newHistory].slice(0, 10); // Keep last 10 viewed
    });
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    setCache(new Map());
  };

  /**
   * Get recently viewed billings
   */
  const getRecentlyViewed = () => {
    return viewHistory;
  };

  return {
    ...basicHook,
    
    // Enhanced features
    fetchWithCache,
    addToHistory,
    clearCache,
    getRecentlyViewed,
    viewHistory,
    cacheSize: cache.size,
    
    // Enhanced computed values
    hasRecentlyViewed: viewHistory.length > 0
  };
};