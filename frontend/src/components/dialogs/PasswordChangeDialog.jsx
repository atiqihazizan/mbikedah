// components/dialogs/PasswordChangeDialog.jsx
import { useState } from 'react';
import { FaKey } from 'react-icons/fa';

/**
 * Password Change Dialog Component
 * @param {boolean} isOpen - Whether dialog is open
 * @param {Function} onClose - Function to close dialog
 * @param {Function} onSubmit - Function to handle form submission
 */
const PasswordChangeDialog = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form validation rules
  const VALIDATION_RULES = {
    MIN_PASSWORD_LENGTH: 8,
    REQUIRED_FIELDS: ['current_password', 'new_password', 'confirm_password']
  };

  /**
   * Handle input field changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Validate form data
   * @returns {Object} Validation errors object
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!formData.current_password) {
      newErrors.current_password = 'Kata laluan semasa diperlukan';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'Kata laluan baru diperlukan';
    } else if (formData.new_password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      newErrors.new_password = `Kata laluan baru minimum ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} aksara`;
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Pengesahan kata laluan diperlukan';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Kata laluan tidak sepadan';
    }
    
    // Additional validation: new password shouldn't be same as current
    if (formData.current_password && formData.new_password && 
        formData.current_password === formData.new_password) {
      newErrors.new_password = 'Kata laluan baru mestilah berbeza dari kata laluan semasa';
    }
    
    return newErrors;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Gagal menukar kata laluan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setErrors({});
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Don't render if dialog is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader onClose={handleClose} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <PasswordInput
            id="current_password"
            name="current_password"
            label="Kata Laluan Semasa"
            placeholder="Masukkan kata laluan semasa"
            value={formData.current_password}
            onChange={handleInputChange}
            error={errors.current_password}
          />

          <PasswordInput
            id="new_password"
            name="new_password"
            label="Kata Laluan Baru"
            placeholder="Masukkan kata laluan baru"
            value={formData.new_password}
            onChange={handleInputChange}
            error={errors.new_password}
            helpText={`Minimum ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} aksara`}
          />

          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            label="Sahkan Kata Laluan Baru"
            placeholder="Sahkan kata laluan baru"
            value={formData.confirm_password}
            onChange={handleInputChange}
            error={errors.confirm_password}
          />

          {/* Submit Error */}
          {errors.submit && <ErrorMessage message={errors.submit} />}

          {/* Security Tips */}
          <SecurityTips />
        </form>

        {/* Footer */}
        <DialogFooter
          onClose={handleClose}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

/**
 * Dialog Header Component
 */
const DialogHeader = ({ onClose }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <FaKey className="w-5 h-5 mr-2 text-blue-600" />
        Tukar Kata Laluan
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

/**
 * Password Input Component
 */
const PasswordInput = ({ id, name, label, placeholder, value, onChange, error, helpText }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type="password"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
    {helpText && !error && (
      <p className="mt-1 text-xs text-gray-500">{helpText}</p>
    )}
  </div>
);

/**
 * Error Message Component
 */
const ErrorMessage = ({ message }) => (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

/**
 * Security Tips Component
 */
const SecurityTips = () => (
  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-start space-x-2">
      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="text-sm text-blue-800 font-medium">Tips Keselamatan:</p>
        <ul className="text-xs text-blue-700 mt-1 space-y-1">
          <li>• Gunakan kombinasi huruf besar, kecil, nombor dan simbol</li>
          <li>• Jangan gunakan maklumat peribadi</li>
          <li>• Pastikan berbeza dari kata laluan lama</li>
          <li>• Simpan kata laluan di tempat yang selamat</li>
        </ul>
      </div>
    </div>
  </div>
);

/**
 * Dialog Footer Component
 */
const DialogFooter = ({ onClose, onSubmit, isSubmitting }) => (
  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      disabled={isSubmitting}
    >
      Batal
    </button>
    <button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memproses...
        </>
      ) : (
        <>
          <FaKey className="w-4 h-4 mr-2" />
          Tukar Kata Laluan
        </>
      )}
    </button>
  </div>
);

export default PasswordChangeDialog;