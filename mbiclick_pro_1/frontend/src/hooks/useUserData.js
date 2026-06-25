// hooks/useUserData.js - Updated dengan TanStack Query
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../utils/axios';

/**
 * Custom hook untuk manage user data dan roles menggunakan TanStack Query
 */
export const useUserData = (currentUser) => {
  // Query function untuk fetch dashboard data
  const fetchUserData = async () => {
    const response = await apiClient.get('/dashboard');
    if (response.success) {
      return {
        dashboardData: response.data || {},
        userRoles: response.user_roles || []
      };
    } else {
      throw new Error(response.message || 'Failed to fetch user data');
    }
  };

  // TanStack Query hook
  const {data,isLoading,error,refetch,isError,isFetching } = useQuery({
    queryKey: ['userData', currentUser?.id], // Query key dengan user ID
    queryFn: fetchUserData,
    enabled: !!currentUser, // Only run query kalau ada currentUser
    staleTime: 5 * 60 * 1000, // Data fresh selama 5 minit
    cacheTime: 10 * 60 * 1000, // Cache selama 10 minit
    retry: 3, // Retry 3 kali kalau fail
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (err) => {
      console.error('Error fetching user data:', err);
      toast.error('Gagal memuat data pengguna');
    },
    // Auto refetch setiap 30 saat kalau window focus
    // refetchOnWindowFocus: true,
    // refetchInterval: 10000, // Auto refetch setiap 30 saat
    refetchInterval: false,           // Disable auto-refresh
    refetchOnWindowFocus: true,       // Refresh bila focus window
  });

  // Helper function untuk refresh data manually - keep sama macam original
  const refreshUserData = () => refetch();

  // Return sama format macam original hook
  return {
    dashboardData: data?.dashboardData || {},
    userRoles: data?.userRoles || [],
    isLoading,
    error: error?.message || null,
    refreshUserData
  };
};