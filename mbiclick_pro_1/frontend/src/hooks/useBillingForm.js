// hooks/useBillingForm.js
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStateContext } from '../contexts/ContextProvider';
import apiClient from '../utils/axios';

export const useBillingForm = () => {
  const { currentUser } = useStateContext();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const checkValid = (petition) => (
    petition?.recipient_id !== "" && 
    parseFloat(petition?.total_amount || 0) !== 0 && 
    (petition?.details || []).length !== 0
  );

  // Mutation untuk save billing
  const saveBillingMutation = useMutation({
    mutationFn: async ({ petition, billingId, statusId }) => {
      // Validation check
      if (statusId !== 1 && !checkValid(petition)) {
        throw new Error("Sila lengkapkan semua maklumat yang diperlukan");
      }

      const url = !billingId ? "/billings" : `/billings/${billingId}`;
      const method = !billingId ? "post" : "put";
      const formData = { ...petition, status_id: statusId };
      
      const { data } = await apiClient[method](url, formData);
      return { data, statusId, isNew: !billingId };
    },
    onSuccess: (result, variables) => {
      const { statusId, isNew } = result;
      
      // Success message
      if (statusId === 1) {
        toast.success("Permohonan berjaya disimpan sebagai draf");
      } else if (statusId === 2) {
        toast.success("Permohonan berjaya dihantar kepada ketua jabatan");
      } else if (statusId === 3) {
        toast.success("Permohonan berjaya dihantar kepada bahagian kewangan");
      }

      // Optimistic update untuk dashboard data
      queryClient.setQueryData(['dashboardData', currentUser?.id], (oldData) => {
        if (!oldData?.applicant?.status_counts) return oldData;

        const newCounts = { ...oldData.applicant.status_counts };
        
        if (isNew) {
          // New billing - increment appropriate counter
          if (statusId === 1) {
            newCounts.draft = (newCounts.draft || 0) + 1;
          } else if (statusId === 2) {
            newCounts.pending = (newCounts.pending || 0) + 1;
          } else if (statusId === 3) {
            newCounts.pending = (newCounts.pending || 0) + 1; // Finance review is still "pending" from applicant perspective
          }
        }
        // For updates, we'll let invalidateQueries handle it

        return {
          ...oldData,
          applicant: {
            ...oldData.applicant,
            status_counts: newCounts
          }
        };
      });

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries(['dashboardData']);
      queryClient.invalidateQueries(['billings']);
      
      // Clear any previous errors
      setError(null);
    },
    onError: (error, variables) => {
      const { statusId } = variables;
      
      if (error?.response?.status === 403) {
        toast.error("Anda tidak mempunyai kebenaran untuk menghantar permohonan ini");
      } else if (error?.response?.status === 422) {
        const { data } = error?.response || {};
        setError(data?.errors);
        // Don't show toast for validation errors, let the form handle it
      } else {
        const message = error?.response?.data?.message || error.message;
        const actionText = statusId === 1 ? 'menyimpan draf' : 'menghantar permohonan';
        toast.error(message || `Ralat semasa ${actionText}. Sila cuba lagi.`);
      }
    }
  });

  const saveForm = async (petition, billingId, statusId) => {
    setError(null);
    toast.dismiss();
    
    try {
      const result = await saveBillingMutation.mutateAsync({petition,billingId,statusId});
      
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    saveForm,
    loading: saveBillingMutation.isLoading,
    error,
    setError
  };
};