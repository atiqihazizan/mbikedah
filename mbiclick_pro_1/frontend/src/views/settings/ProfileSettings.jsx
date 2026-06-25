import { useState, useEffect } from "react";
import apiClient from "../../utils/axios";

/**
 * Profile Settings Component - For User/Owner Self Profile Update Only
 */
const ProfileSettings = ({ userDisplayInfo, userRoles, currentUser, isDark, onUnsavedChanges, refreshUserData }) => {
  const [formData, setFormData] = useState({
    name: userDisplayInfo.name || '',
    email: currentUser.email || '',
    username: currentUser.username || '',
    phone: currentUser.phone || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Helper function to format phone for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    
    // Remove + prefix for processing
    const cleaned = phone.replace(/[^0-9]/g, '');
    
    // Malaysian phone number formatting
    if (cleaned.startsWith('60')) {
      // Format: +60 12-345 6789
      const countryCode = cleaned.substr(0, 2);
      const operatorCode = cleaned.substr(2, 2);
      const firstPart = cleaned.substr(4, 3);
      const secondPart = cleaned.substr(7);
      
      return `+${countryCode} ${operatorCode}-${firstPart} ${secondPart}`;
    } else if (cleaned.startsWith('0')) {
      // Format: 012-345 6789
      return `${cleaned.substr(0, 3)}-${cleaned.substr(3, 3)} ${cleaned.substr(6)}`;
    }
    
    return phone;
  };

  // Reset form when userDisplayInfo changes
  useEffect(() => {
    setFormData({
      name: userDisplayInfo.name || '',
      email: currentUser.email || '',
      username: currentUser.username || '',
      phone: currentUser.phone || '',
    });
  }, [userDisplayInfo, currentUser]);

  const handleInputChange = (field, value) => {
    // Auto-format phone number as user types
    if (field === 'phone' && value) {
      value = formatPhoneDisplay(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Nama penuh adalah wajib';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama penuh mestilah sekurang-kurangnya 2 aksara';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Nama pengguna adalah wajib';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Nama pengguna mestilah sekurang-kurangnya 3 aksara';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Alamat email adalah wajib';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format alamat email tidak sah';
    }

    // Validate phone (optional but if provided, should be valid)
    if (formData.phone.trim()) {
      // Malaysian phone number validation
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Format nombor telefon tidak sah';
      } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Nombor telefon mestilah antara 10-15 digit';
      } else {
        // Check Malaysian number patterns
        const cleanedForValidation = cleanPhone.replace(/^\+?/, '');
        const malaysianPatterns = [
          /^(60)?1[0-46-9][0-9]{7,8}$/, // Malaysian mobile
          /^(60)?[2-9][0-9]{7,8}$/,     // Malaysian landline
        ];
        
        const isValidMalaysian = malaysianPatterns.some(pattern => 
          pattern.test(cleanedForValidation)
        );
        
        if (!isValidMalaysian && !cleanPhone.startsWith('+')) {
          newErrors.phone = 'Format nombor telefon Malaysia tidak sah. Contoh: 012-3456789 atau +60123456789';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare data for API call - User updating own profile (basic fields only)
      const updateData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
      };

      // Call API to update user profile
      const response = await apiClient.put(`/users/${currentUser.id}`, updateData);

      if (response.success) {
        setSuccessMessage('Profil berjaya dikemaskini');
        onUnsavedChanges(false);
        
        // Refresh user data untuk get latest information
        if (refreshUserData) {
          await refreshUserData();
        }

        // Note: refreshUserData dari SettingsLayout akan automatically
        // update currentUser context melalui setCurrentUser

      } else {
        throw new Error(response.message || 'Gagal mengemaskini profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 422) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);
      } else if (error.response?.status === 409) {
        // Handle conflict errors (e.g., email/phone already exists)
        setErrors({
          email: 'Alamat email ini telah digunakan oleh pengguna lain'
        });
      } else if (error.response?.status === 403) {
        // Handle authorization errors
        setErrors({
          general: 'Anda tidak mempunyai kebenaran untuk mengemaskini profil ini'
        });
      } else if (error.response?.data?.message) {
        // Handle other API errors
        setErrors({
          general: error.response.data.message
        });
      } else {
        // Handle network or other errors
        setErrors({
          general: 'Ralat rangkaian. Sila cuba lagi sebentar.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: userDisplayInfo.name || '',
      email: currentUser.email || '',
      username: currentUser.username || '',
      phone: currentUser.phone || '',
    });
    setErrors({});
    setSuccessMessage('');
    onUnsavedChanges(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Maklumat Profil
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Kemaskini maklumat peribadi anda
        </p>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nama Penuh *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Masukkan nama penuh"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nama Pengguna *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.username
                ? 'border-red-500 focus:ring-red-500'
                : isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Masukkan nama pengguna"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Alamat Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Masukkan alamat email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nombor Telefon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone
                ? 'border-red-500 focus:ring-red-500'
                : isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="012-3456789 atau +60123456789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Department Field - Read Only */}
        {/* <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Jabatan
          </label>
          <input
            type="text"
            value={userDisplayInfo.department || 'Tiada jabatan'}
            disabled={true}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-400'
                : 'bg-gray-100 border-gray-300 text-gray-500'
            } opacity-75 cursor-not-allowed`}
          />
          <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Hubungi pentadbir untuk mengemas kini jabatan
          </p>
        </div> */}

        {/* User Roles Display - Read Only */}
        {/* <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Peranan
          </label>
          <div className="flex flex-wrap gap-2">
            {userRoles && userRoles.length > 0 ? (
              userRoles.map((role, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isDark
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {role.name || role}
                </span>
              ))
            ) : (
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Tiada peranan ditetapkan
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Hubungi pentadbir untuk mengemas kini peranan anda
          </p>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tetap Semula
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;