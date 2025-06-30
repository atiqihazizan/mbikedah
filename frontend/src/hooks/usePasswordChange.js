
// hooks/usePasswordChange.js
import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../utils/axios';

/**
 * Custom hook untuk handle password change functionality
 */
export const usePasswordChange = (onLogout) => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleChangePassword = () => setIsPasswordDialogOpen(true);

  const handlePasswordSubmit = async (passwordData) => {
    try {
      const response = await apiClient.post('/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.confirm_password
      });
      
      if (response.success) {
        toast.success(response.message || 'Kata laluan berjaya dikemaskini');
        setIsPasswordDialogOpen(false);
        
        if (window.confirm('Kata laluan telah dikemaskini! Adakah anda ingin log keluar dan log masuk semula dengan kata laluan baharu?')) {
          onLogout();
        }
      } else {
        throw new Error(response.message || 'Gagal menukar kata laluan');
      }
      
    } catch (error) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Gagal menukar kata laluan';
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorList = [];
          Object.keys(errors).forEach(field => {
            const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            errorList.push(...fieldErrors);
          });
          errorMessage = errorList.join('\n');
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Anda tidak mempunyai kebenaran untuk menukar kata laluan.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Terlalu banyak cubaan. Sila cuba lagi sebentar.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    handleChangePassword,
    handlePasswordSubmit
  };
};
