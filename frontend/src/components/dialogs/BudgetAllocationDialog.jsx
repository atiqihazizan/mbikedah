import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaBan, FaLayerGroup, FaBuilding, FaHashtag, FaFont, FaCalculator } from "react-icons/fa";
import { apiClient, formatUtils } from "../../utils";
import { toast } from "react-toastify";
import TButton from "../Core/TButton";

/**
 * BudgetAllocationDialog - Dialog untuk menguruskan agihan bajet bulanan
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Status buka/tutup dialog
 * @param {Function} props.onClose - Callback untuk menutup dialog
 * @param {Object} props.selectedBudget - Budget yang dipilih untuk diedit
 * @param {Function} [props.onSuccess] - Callback yang dipanggil setelah berjaya simpan (untuk reload data)
 * 
 * @example
 * // Penggunaan dengan onSuccess callback
 * <BudgetAllocationDialog 
 *   isOpen={showDialog} 
 *   onClose={() => setShowDialog(false)} 
 *   selectedBudget={budget}
 *   onSuccess={() => loadBudgets()} // Reload data setelah berjaya
 * />
 */
const BudgetAllocationDialog = ({ 
  isOpen, 
  onClose, 
  selectedBudget, 
  onSuccess, // Callback untuk reload data atau custom logic
  selectedYear
}) => {
  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({
    totalAmount: 0,
    acttotal: 0,
    selectedMonths: [],
    bdg1: 0, bdg2: 0, bdg3: 0, bdg4: 0, bdg5: 0, bdg6: 0,
    bdg7: 0, bdg8: 0, bdg9: 0, bdg10: 0, bdg11: 0, bdg12: 0
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [monthlyInputMode, setMonthlyInputMode] = useState(false);

  // Month names for display
  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  // ===== UTILITY FUNCTIONS =====
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      const val1 = String(obj1[key] || '');
      const val2 = String(obj2[key] || '');
      if (val1 !== val2) return false;
    }
    
    return true;
  };

  // Helper function to ensure totalAmount is always a number
  const getTotalAmount = () => {
    const amount = formData.totalAmount;
    if (amount === null || amount === undefined || amount === '') return 0;
    return parseFloat(amount) || 0;
  };

  const canSave = () => {
    if (!selectedBudget) return false;
    return getTotalAmount() > 0;
  };

  const getSaveButtonText = () => {
    if (isLoading) {
      return 'Mengemaskini...';
    }
    return 'Kemaskini';
  };

  // Calculate budget per month based on total amount and selected months
  const calculateMonthlyBudget = () => {
    if (getTotalAmount() <= 0 || formData.selectedMonths.length === 0) {
      return 0;
    }
    return getTotalAmount() / formData.selectedMonths.length;
  };

  // Check if amount is too small to be logically divided
  const isAmountTooSmall = () => {
    const amount = getTotalAmount();
    // If amount is less than RM 1.00, it's too small to divide
    if (amount < 12000) {
      return true;
    }
    
    // If amount is less than RM 0.50 per month for 12 months, it's too small
    if (amount < 6000) {
      return true;
    }
    
    return false;
  };

  // Check if months should be disabled
  const areMonthsDisabled = () => {
    const amount = getTotalAmount();
    return amount <= 0 || isAmountTooSmall();
  };

  // Calculate total from monthly inputs
  const calculateTotalFromMonthly = () => {
    let total = 0;
    for (let i = 1; i <= 12; i++) {
      total += parseFloat(formData[`bdg${i}`] || 0);
    }
    return total;
  };

  // Update monthly budget fields when total amount or selected months change
  useEffect(() => {
    if (!isInitialized || monthlyInputMode) return;
    
    const amount = getTotalAmount();
    
    // Only update if there are actual changes to avoid infinite loops
    const currentMonthlyData = {};
    for (let i = 1; i <= 12; i++) {
      currentMonthlyData[`bdg${i}`] = formData[`bdg${i}`];
    }
    
    let shouldUpdate = false;
    let newFormData = { ...formData };
    
    if (amount > 0 && formData.selectedMonths.length > 0 && !areMonthsDisabled()) {
      const monthlyAmount = calculateMonthlyBudget();
      
              // Check if update is needed - only update months that were originally 0
        for (let i = 1; i <= 12; i++) {
          const originalValue = parseFloat(originalData[`bdg${i}`] || 0);
          const expectedValue = formData.selectedMonths.includes(i) ? monthlyAmount : 0;
          
          // If original value was 0, use calculated value; otherwise preserve original
          const finalValue = originalValue > 0 ? originalValue : expectedValue;
        
        if (currentMonthlyData[`bdg${i}`] !== finalValue) {
          shouldUpdate = true;
          newFormData[`bdg${i}`] = finalValue;
        }
      }
    } else if (amount > 0 && formData.selectedMonths.length === 0) {
      // Check if all months are already 0
      for (let i = 1; i <= 12; i++) {
        if (currentMonthlyData[`bdg${i}`] !== 0) {
          shouldUpdate = true;
          newFormData[`bdg${i}`] = 0;
        }
      }
    } else if (amount <= 0 || areMonthsDisabled()) {
      // Check if reset is needed
      if (formData.selectedMonths.length > 0) {
        shouldUpdate = true;
        newFormData.selectedMonths = [];
      }
      
      for (let i = 1; i <= 12; i++) {
        if (currentMonthlyData[`bdg${i}`] !== 0) {
          shouldUpdate = true;
          newFormData[`bdg${i}`] = 0;
        }
      }
    }
    
    // Only update if necessary
    if (shouldUpdate) {
      setFormData(newFormData);
    }
  }, [formData.totalAmount, formData.selectedMonths.length, isInitialized, monthlyInputMode, originalData]);

  // ===== FORM INITIALIZATION =====
  useEffect(() => {
    if (isOpen && selectedBudget) {
      // Initialize with existing budget data
      const existingData = {
        totalAmount: selectedBudget.bdgtotal || 0,
        acttotal: selectedBudget.acttotal || 0,
        selectedMonths: [],
        bdg1: selectedBudget.bdg1 || 0,
        bdg2: selectedBudget.bdg2 || 0,
        bdg3: selectedBudget.bdg3 || 0,
        bdg4: selectedBudget.bdg4 || 0,
        bdg5: selectedBudget.bdg5 || 0,
        bdg6: selectedBudget.bdg6 || 0,
        bdg7: selectedBudget.bdg7 || 0,
        bdg8: selectedBudget.bdg8 || 0,
        bdg9: selectedBudget.bdg9 || 0,
        bdg10: selectedBudget.bdg10 || 0,
        bdg11: selectedBudget.bdg11 || 0,
        bdg12: selectedBudget.bdg12 || 0
      };

      // Determine which months have budget allocation
      const monthsWithBudget = [];
      for (let i = 1; i <= 12; i++) {
        if (existingData[`bdg${i}`] > 0) {
          monthsWithBudget.push(i);
        }
      }
      existingData.selectedMonths = monthsWithBudget;
      
      setFormData(existingData);
      setOriginalData({ ...existingData });
      setErrors({});
      setIsInitialized(true);
      
      // Check if we should enable monthly input mode (if there are existing monthly values)
      const hasExistingMonthlyValues = monthsWithBudget.length > 0;
      setMonthlyInputMode(hasExistingMonthlyValues);
    } else if (isOpen) {
      // Reset form for new budget
      const resetData = {
        totalAmount: 0,
        acttotal: 0,
        selectedMonths: [],
        bdg1: 0, bdg2: 0, bdg3: 0, bdg4: 0, bdg5: 0, bdg6: 0,
        bdg7: 0, bdg8: 0, bdg9: 0, bdg10: 0, bdg11: 0, bdg12: 0
      };
      setFormData(resetData);
      setOriginalData({ ...resetData });
      setErrors({});
      setIsInitialized(true);
      setMonthlyInputMode(false);
    } else {
      setIsInitialized(false);
    }
  }, [isOpen, selectedBudget]);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (canSave() && !isLoading) {
          const form = document.getElementById('budget-form');
          if (form) form.requestSubmit();
        }
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, canSave, isLoading, onClose]);

  // ===== EVENT HANDLERS =====
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'totalAmount') {
      processedValue = parseFloat(value) || 0;
    } else if (field.startsWith('bdg')) {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleMonthToggle = (month) => {
    setFormData(prev => {
      const newSelectedMonths = prev.selectedMonths.includes(month)
        ? prev.selectedMonths.filter(m => m !== month)
        : [...prev.selectedMonths, month].sort((a, b) => a - b);
      
      return {
        ...prev,
        selectedMonths: newSelectedMonths
      };
    });
  };

  const handleMonthlyInputToggle = () => {
    setMonthlyInputMode(!monthlyInputMode);
    
    if (!monthlyInputMode) {
      // Switching to manual input mode - preserve current values
      // No need to change anything
    } else {
      // Switching back to auto mode - recalculate based on total and selected months
      const amount = getTotalAmount();
      if (amount > 0 && formData.selectedMonths.length > 0) {
        const monthlyAmount = calculateMonthlyBudget();
        const newFormData = { ...formData };
        
        for (let i = 1; i <= 12; i++) {
          const originalValue = parseFloat(originalData[`bdg${i}`] || 0);
          newFormData[`bdg${i}`] = formData.selectedMonths.includes(i) ? monthlyAmount : 0;
        }
        
        setFormData(newFormData);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    const newErrors = {};

    if (getTotalAmount() <= 0) {
      newErrors.totalAmount = 'Jumlah bajet mesti lebih daripada 0';
    }

    // Validate monthly inputs if in manual mode
    if (monthlyInputMode) {
      const monthlyTotal = calculateTotalFromMonthly();
      if (Math.abs(monthlyTotal - getTotalAmount()) > 0.01) {
        newErrors.monthlyTotal = `Jumlah bulanan (RM ${monthlyTotal.toFixed(2)}) tidak sama dengan jumlah bajet (RM ${getTotalAmount().toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== FORM SUBMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare data for API call
      const submitData = {
        bdg1: formData.bdg1,
        bdg2: formData.bdg2,
        bdg3: formData.bdg3,
        bdg4: formData.bdg4,
        bdg5: formData.bdg5,
        bdg6: formData.bdg6,
        bdg7: formData.bdg7,
        bdg8: formData.bdg8,
        bdg9: formData.bdg9,
        bdg10: formData.bdg10,
        bdg11: formData.bdg11,
        bdg12: formData.bdg12,
        bdgtotal: getTotalAmount(), // Use helper function
        acttotal: formData.acttotal || 0, // Add actual total
        year: selectedYear
      };

      // Make API call directly
      if (!selectedBudget) {
        throw new Error('Tiada budget dipilih');
      }

      const response = await apiClient.put(`/budgets/${selectedBudget.id}/budget-allocation`, submitData);
      console.log(response);
      toast.success('Agihan bajet bulanan berjaya dikemaskini');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      setOriginalData({ ...formData });
      onClose();
    } catch (error) {
      console.error('Error saving budget allocation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ralat mengemaskini agihan bajet';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER =====
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white text-gray-900`}>
        
        {/* ===== HEADER ===== */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200`}>
          <div className="flex items-center">
            <FaLayerGroup className={`w-5 h-5 mr-3 text-blue-600`} />
            <div>
              <h2 className="text-xl font-bold">Kemaskini Agihan Bajet Bulanan</h2>
              {selectedBudget && (
                <p className={`text-sm text-gray-600`}>
                  {selectedBudget.code} - {selectedBudget.name}
                </p>
              )}
            </div>
          </div>
          <TButton
            variant="subtle"
            color="ghost"
            size="sm"
            circle
            onClick={handleClose}
          >
            <FaTimes className="w-4 h-4" />
          </TButton>
        </div>

        {/* ===== FORM ===== */}
        <form id="budget-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Budget Amount Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold flex items-center text-gray-800`}>
              <FaCalculator className="w-4 h-4 mr-2" />
              Jumlah Bajet
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className={`block text-sm font-medium mb-2 text-gray-700`}>
                  Jumlah Bajet (RM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount || ''}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${errors.totalAmount ? 'border-red-500' : ''}`}
                  placeholder="Masukkan jumlah bajet"
                />
                {errors.totalAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>
                )}
              </div>
              
              <div className="md:col-span-1">
                <label className={`block text-sm font-medium mb-2 text-gray-700`}>
                  Jumlah Sebenar (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.acttotal || 0}
                  onChange={(e) => handleInputChange('acttotal', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900 placeholder-gray-500`}
                  placeholder="Masukkan jumlah sebenar"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Jumlah sebenar yang telah dibelanjakan (tidak wajib diisi)
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Input Mode Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold flex items-center text-gray-800`}>
                <FaLayerGroup className="w-4 h-4 mr-2" />
                Agihan Bulanan
              </h3>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Mod Input:</span>
                <button
                  type="button"
                  onClick={handleMonthlyInputToggle}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    monthlyInputMode
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                  }`}
                >
                  {monthlyInputMode ? 'Manual' : 'Auto'}
                </button>
              </div>
            </div>
            
            {monthlyInputMode ? (
              // Manual Monthly Input Mode
              <div className="space-y-4">
                <div className="grid grid-cols-6 md:grid-cols-6 gap-3">
                  {monthNames.map((monthName, index) => {
                                         const monthNumber = index + 1;
                     const originalValue = parseFloat(originalData[`bdg${monthNumber}`] || 0);
                     const hasOriginalValue = originalValue > 0;
                     
                     return (
                       <div key={monthNumber} className="flex flex-col">
                         <label className={`block text-sm font-medium mb-2 text-gray-700`}>
                           {monthName}
                           {hasOriginalValue && (
                             <span className="ml-1 text-xs text-blue-600">(Asal: RM {originalValue.toFixed(2)})</span>
                           )}
                         </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData[`bdg${monthNumber}`] || ''}
                          onChange={(e) => handleInputChange(`bdg${monthNumber}`, e.target.value)}
                          className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${
                            hasOriginalValue ? 'border-blue-300 bg-blue-50' : ''
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                    );
                  })}
                </div>
                
                {errors.monthlyTotal && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{errors.monthlyTotal}</p>
                  </div>
                )}
                
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Anda boleh mengubahsuai nilai bulanan secara manual. 
                    Nilai asal yang sedia ada akan dipelihara. Pastikan jumlah bulanan sama dengan jumlah bajet.
                  </p>
                </div>
              </div>
            ) : (
              // Auto Monthly Selection Mode
              <div className="space-y-4">
                <div className="grid grid-cols-6 md:grid-cols-6 gap-3">
                  {monthNames.map((monthName, index) => {
                                         const monthNumber = index + 1;
                     const isSelected = formData.selectedMonths.includes(monthNumber);
                     const monthlyAmount = isSelected ? calculateMonthlyBudget() : 0;
                     const isDisabled = areMonthsDisabled();
                     const originalValue = parseFloat(originalData[`bdg${monthNumber}`] || 0);
                     const hasOriginalValue = originalValue > 0;
                    
                    return (
                      <div key={monthNumber} className="flex flex-col">
                        <label className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                          isDisabled 
                            ? 'border-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                            : isSelected 
                            ? 'border-blue-500 bg-blue-50 cursor-pointer'
                            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMonthToggle(monthNumber)}
                            disabled={isDisabled}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 ${
                            isDisabled
                              ? 'border-gray-400 bg-gray-400'
                              : isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          } flex items-center justify-center`}>
                            {isSelected && !isDisabled && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            isDisabled
                              ? 'text-gray-400'
                              : isSelected 
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}>
                            {monthName}
                          </span>
                        </label>
                        {isSelected && !isDisabled && (
                          <div className={`mt-2 text-xs text-center ${
                            hasOriginalValue ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {hasOriginalValue ? (
                              <span>RM {originalValue.toFixed(2)} (Asal)</span>
                            ) : (
                              <span>RM {monthlyAmount.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {areMonthsDisabled() && (
                  <p className={`mt-2 text-sm text-center text-gray-500`}>
                    {formData.totalAmount <= 0 
                      ? 'Masukkan jumlah bajet untuk memilih bulan'
                      : formData.totalAmount < 1.00
                      ? 'Jumlah bajet terlalu kecil (minimum RM 1.00) untuk agihan bulanan'
                      : 'Jumlah bajet terlalu kecil untuk agihan bulanan yang praktikal (minimum RM 6.00 untuk 12 bulan)'
                    }
                  </p>
                )}
                
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                     <p className="text-sm text-green-700">
                     <strong>Nota:</strong> 
                     {parseFloat(originalData.bdg1 || 0) > 0 || parseFloat(originalData.bdg2 || 0) > 0 || parseFloat(originalData.bdg3 || 0) > 0 || 
                      parseFloat(originalData.bdg4 || 0) > 0 || parseFloat(originalData.bdg5 || 0) > 0 || parseFloat(originalData.bdg6 || 0) > 0 ||
                      parseFloat(originalData.bdg7 || 0) > 0 || parseFloat(originalData.bdg8 || 0) > 0 || parseFloat(originalData.bdg9 || 0) > 0 || 
                      parseFloat(originalData.bdg10 || 0) > 0 || parseFloat(originalData.bdg11 || 0) > 0 || parseFloat(originalData.bdg12 || 0) > 0
                       ? 'Nilai bulanan asal akan dipelihara. Bulan yang dipilih akan menggunakan nilai asal jika ada, atau nilai baharu jika asalnya 0.'
                       : 'Pilih bulan untuk agihan bajet bulanan secara automatik.'
                     }
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section */}
          {getTotalAmount() > 0 && (
            <div className={`p-4 rounded-lg ${
              formData.selectedMonths.length > 0 || monthlyInputMode
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                formData.selectedMonths.length > 0 || monthlyInputMode
                  ? 'text-blue-700'
                  : 'text-yellow-700'
              }`}>
                {monthlyInputMode || formData.selectedMonths.length > 0 ? 'Ringkasan Agihan' : 'Status Bajet'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Jumlah Bajet:</span>
                  <div className="font-semibold text-gray-900">
                    {formatUtils.formatCurrency(getTotalAmount())}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah Sebenar:</span>
                  <div className="font-semibold text-gray-900">
                    RM {formatUtils.formatCurrency(formData.acttotal || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Mod Input:</span>
                  <div className="font-semibold text-gray-900">
                    {monthlyInputMode ? 'Manual' : 'Auto'}
                  </div>
                </div>
                {monthlyInputMode ? (
                  <div>
                    <span className="text-gray-600">Jumlah Bulanan:</span>
                    <div className="font-semibold text-gray-900">
                      RM {calculateTotalFromMonthly().toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-gray-600">Bulan Dipilih:</span>
                    <div className="font-semibold text-gray-900">
                      {formData.selectedMonths.length > 0 ? `${formData.selectedMonths.length} bulan` : 'Tiada bulan dipilih'}
                    </div>
                  </div>
                )}
                {!monthlyInputMode && formData.selectedMonths.length > 0 && (
                  <div>
                    <span className="text-gray-600">Bajet Sebulan:</span>
                    <div className="font-semibold text-gray-900">
                      RM {(calculateMonthlyBudget() || 0).toFixed(2)}
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <span className="text-gray-600">Bulan:</span>
                  <div className="font-semibold text-gray-900">
                    {monthlyInputMode 
                      ? 'Input manual untuk semua bulan'
                      : formData.selectedMonths.length > 0 
                      ? formData.selectedMonths.map(m => monthNames[m-1].substring(0, 3)).join(', ')
                      : 'Tiada agihan bulanan'
                    }
                  </div>
                </div>
              </div>
              {!monthlyInputMode && formData.selectedMonths.length === 0 && (
                <div className={`mt-3 p-3 rounded bg-yellow-100 border border-yellow-300`}>
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> 
                    {areMonthsDisabled() && getTotalAmount() > 0
                      ? 'Jumlah bajet terlalu kecil untuk agihan bulanan yang praktikal. Bajet akan disimpan tanpa agihan bulanan.'
                      : 'Bajet akan disimpan tanpa agihan bulanan. Anda boleh mengagihkan bulanan pada masa akan datang.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ===== ACTION BUTTONS ===== */}
          <div className={`flex justify-end space-x-3 pt-6 border-t border-gray-200`}>
            <TButton
              variant="outline"
              color="ghost"
              onClick={handleClose}
              isDisable={isLoading}
              className="group"
            >
              <FaBan className="w-4 h-4" />
              <span>Batal</span>
              <span className="ml-2 text-xs opacity-50 group-hover:opacity-75 transition-opacity text-gray-500">
                ESC
              </span>
            </TButton>
            
            <TButton
              variant="solid"
              color="blue"
              type="submit"
              onChecking={isLoading}
              isDisable={!canSave()}
              className="group"
            >
              <FaSave className="w-4 h-4" />
              <span>{getSaveButtonText()}</span>
              {!isLoading && (
                <span className="ml-2 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                  Ctrl+S
                </span>
              )}
            </TButton>
          </div>
        </form>
      </div>
    </div>
  );
  };
  
export default BudgetAllocationDialog;