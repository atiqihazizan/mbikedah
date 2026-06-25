import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

/**
 * Financial Account Dialog Component for Add/Edit Account (Bank/Petty Cash/Cash)
 */
const BankDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  bank = null, 
  isDark = false, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account: '',
    account_type: null,
    swift_code: null,
    branch_name: '',
    amount: '',
    budget_id: null
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (bank) {
      setFormData({
        bank_name: bank.bank_name || '',
        bank_account: bank.bank_account || '',
        account_type: null,
        swift_code: null,
        branch_name: bank.branch_name || '',
        amount: bank.amount || bank.balance || '',
        budget_id: bank.budget_id || null
      });
    } else {
      // Reset form for new account
      setFormData({
        bank_name: '',
        bank_account: '',
        account_type: null,
        swift_code: null,
        branch_name: '',
        amount: '',
        budget_id: null
      });
    }
    setErrors({});
  }, [bank, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Nama akaun/bank/wang diperlukan';
    }

    if (!formData.amount || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Baki semasa mesti nilai positif';
    }

    // Check if this looks like a bank account (not panjar/tunai)
    const name = formData.bank_name.toLowerCase();
    const isPettyCashOrCash = name.includes('panjar') || name.includes('wang runcit') || name.includes('tunai');
    
    // Only require bank account for actual banks
    if (!isPettyCashOrCash && !formData.bank_account.trim()) {
      newErrors.bank_account = 'Nombor akaun diperlukan untuk akaun bank';
    }

    // Validate account number format only if provided
    if (formData.bank_account && formData.bank_account.trim() && !/^[\d\-\s]+$/.test(formData.bank_account)) {
      newErrors.bank_account = 'Format nombor akaun tidak sah';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if this is petty cash or cash (no bank account needed)
    const name = formData.bank_name.toLowerCase();
    const isPettyCashOrCash = name.includes('panjar') || name.includes('wang runcit') || name.includes('tunai');

    // Format data before sending
    const bankData = {
      ...formData,
      amount: parseFloat(formData.amount || 0).toFixed(2),
      account_type: null,
      swift_code: null,
      // For petty cash/cash, explicitly set bank_account to empty string or null
      // For banks, use the provided account number or empty string
      bank_account: isPettyCashOrCash ? '' : (formData.bank_account.trim() || '')
    };

    // Remove empty fields to avoid backend validation issues
    if (!bankData.bank_account) {
      delete bankData.bank_account;
    }

    onSave(bankData);
  };

  const handleClose = () => {
    setFormData({
      bank_name: '',
      bank_account: '',
      account_type: null,
      swift_code: null,
      branch_name: '',
      amount: '',
      budget_id: null
    });
    setErrors({});
    onClose();
  };

  // Handle click outside dialog
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div 
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {bank ? 'Kemaskini Akaun Kewangan' : 'Tambah Akaun Kewangan Baru'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank/Account Name */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nama Akaun/Bank *
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                placeholder="Contoh: Bank Islam Malaysia / PANJAR WANG RUNCIT / TUNAI"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.bank_name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                disabled={isLoading}
                required
              />
              {errors.bank_name && (
                <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>
              )}
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                💡 Sistem akan auto-detect jenis: 🏦 Akaun Bank | 💰 Wang Panjar | 💵 Tunai
              </p>
              
              {/* Quick Examples */}
              <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <details className="cursor-pointer">
                  <summary className="hover:text-blue-500">📝 Contoh nama akaun...</summary>
                  <div className="mt-1 pl-3 space-y-1">
                    <p>🏦 <strong>Akaun Bank:</strong> "BANK ISLAM", "MAYBANK ALOR SETAR", "RHB"</p>
                    <p>💰 <strong>Wang Panjar:</strong> "PANJAR WANG RUNCIT", "PANJAR KHAS - KENDERAAN"</p>
                    <p>💵 <strong>Wang Tunai:</strong> "TUNAI", "WANG TUNAI PEJABAT"</p>
                  </div>
                </details>
              </div>
            </div>

            {/* Account Number (Conditionally Required) */}
            <div>
              {(() => {
                const name = formData.bank_name.toLowerCase();
                const isPettyCashOrCash = name.includes('panjar') || name.includes('wang runcit') || name.includes('tunai');
                const isRequired = !isPettyCashOrCash && formData.bank_name.trim();
                
                return (
                  <>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Nombor Akaun 
                      {isRequired ? (
                        <span className="text-red-500 ml-1">*</span>
                      ) : (
                        <span className="text-xs text-gray-500 ml-1">(optional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account}
                      onChange={(e) => handleInputChange('bank_account', e.target.value)}
                      placeholder={
                        isPettyCashOrCash 
                          ? "Tidak diperlukan untuk wang panjar/tunai" 
                          : "1234-5678-9012"
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.bank_account 
                          ? 'border-red-500 focus:ring-red-500' 
                          : isPettyCashOrCash
                            ? (isDark 
                              ? 'bg-gray-800 border-gray-700 text-gray-500 placeholder-gray-600' 
                              : 'bg-gray-100 border-gray-200 text-gray-500 placeholder-gray-400')
                            : (isDark
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500')
                      }`}
                      disabled={isLoading || isPettyCashOrCash}
                      required={isRequired}
                    />
                    {errors.bank_account && (
                      <p className="mt-1 text-sm text-red-500">{errors.bank_account}</p>
                    )}
                    <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isPettyCashOrCash ? (
                        <span className="text-green-600">
                          ✓ Auto-disabled untuk wang panjar/tunai
                        </span>
                      ) : isRequired ? (
                        <span className="text-orange-600">
                          ⚠️ Diperlukan untuk akaun bank
                        </span>
                      ) : (
                        "💰 Kosongkan untuk wang panjar atau tunai"
                      )}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Current Balance */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Baki Semasa (RM) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.amount 
                    ? 'border-red-500 focus:ring-red-500' 
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                disabled={isLoading}
                required
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Branch/Location Name */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nama Cawangan/Lokasi <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.branch_name}
                onChange={(e) => handleInputChange('branch_name', e.target.value)}
                placeholder="Contoh: Cawangan Utama / Pejabat Utama / Kaunter Utama"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                disabled={isLoading}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 Untuk identify lokasi akaun atau wang (optional)
              </p>
            </div>
          </div>

          {/* Enhanced Preview Section with Auto-Detection */}
          {(formData.bank_name || formData.bank_account || formData.amount) && (
            <div className={`mt-6 p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                🔍 Pratonton & Auto-Detection:
              </h4>
              <div className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center">
                  <strong className="mr-2">Nama:</strong> 
                  <span>{formData.bank_name || '-'}</span>
                </div>
                
                {formData.bank_account && (
                  <div className="flex items-center">
                    <strong className="mr-2">Akaun:</strong> 
                    <span>{formData.bank_account}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <strong className="mr-2">Baki:</strong> 
                  <span className="font-bold text-green-600">RM {parseFloat(formData.amount || 0).toFixed(2)}</span>
                </div>
                
                {formData.branch_name && (
                  <div className="flex items-center">
                    <strong className="mr-2">Lokasi:</strong> 
                    <span>{formData.branch_name}</span>
                  </div>
                )}
                
                {/* Auto-detect category preview */}
                {formData.bank_name && (
                  <div className={`mt-3 p-2 rounded border-l-4 ${
                    formData.bank_name.toLowerCase().includes('tunai') 
                      ? 'border-green-500 bg-green-50' :
                    formData.bank_name.toLowerCase().includes('panjar') || formData.bank_name.toLowerCase().includes('wang runcit') 
                      ? 'border-yellow-500 bg-yellow-50' :
                    formData.bank_account 
                      ? 'border-blue-500 bg-blue-50' : 'border-gray-500 bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {formData.bank_name.toLowerCase().includes('tunai') ? '💵' :
                         formData.bank_name.toLowerCase().includes('panjar') || formData.bank_name.toLowerCase().includes('wang runcit') ? '💰' :
                         formData.bank_account ? '🏦' : '📝'}
                      </span>
                      <div>
                        <p className="font-medium text-sm">
                          Jenis Auto-Detected: {
                            formData.bank_name.toLowerCase().includes('tunai') ? 'Wang Tunai' :
                            formData.bank_name.toLowerCase().includes('panjar') || formData.bank_name.toLowerCase().includes('wang runcit') ? 'Wang Panjar' :
                            formData.bank_account ? 'Akaun Bank' : 'Lain-lain'
                          }
                        </p>
                        <p className="text-xs text-gray-600">
                          {formData.bank_name.toLowerCase().includes('tunai') ? 'Wang tunai di tangan' :
                           formData.bank_name.toLowerCase().includes('panjar') || formData.bank_name.toLowerCase().includes('wang runcit') ? 'Wang panjar untuk perbelanjaan kecil' :
                           formData.bank_account ? 'Akaun bank dengan nombor akaun' : 'Akaun kewangan lain'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.bank_name.trim() || !formData.amount}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isLoading || !formData.bank_name.trim() || !formData.amount
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  {bank ? 'Kemaskini Akaun' : 'Simpan Akaun'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankDialog;