import { useState, useEffect } from "react";
import { FaChartLine, FaPiggyBank, FaSave, FaTimes, FaBuilding } from "react-icons/fa";
import TInput from "../Core/TInput"; // Adjust path as needed
import TSelect from "../Core/TSelect"; // Adjust path as needed

/**
 * Budget Form Dialog Component
 */
const BudgetFormDialog = ({ 
  isOpen, 
  onClose, 
  selectedBudget, 
  departments, 
  isDark, 
  onSave,
  onUnsavedChanges 
}) => {
  const [budgetData, setBudgetData] = useState({
    name: '',
    code: '',
    department_id: '',
    type: 0,
    bdg1: 0, bdg2: 0, bdg3: 0, bdg4: 0, bdg5: 0, bdg6: 0,
    bdg7: 0, bdg8: 0, bdg9: 0, bdg10: 0, bdg11: 0, bdg12: 0,
    bdgtotal: 0
  });
  const [errors, setErrors] = useState({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (selectedBudget) {
        setBudgetData({ 
          ...selectedBudget,
          department_id: selectedBudget.department_id || '',
          bdgtotal: selectedBudget.bdgtotal || 0
        });
      } else {
        setBudgetData({
          name: '',
          code: '',
          department_id: '',
          type: 0,
          bdg1: 0, bdg2: 0, bdg3: 0, bdg4: 0, bdg5: 0, bdg6: 0,
          bdg7: 0, bdg8: 0, bdg9: 0, bdg10: 0, bdg11: 0, bdg12: 0,
          bdgtotal: 0
        });
      }
      setErrors({});
      setNotification({ type: '', message: '' });
    }
  }, [isOpen, selectedBudget]);

  // Auto calculate total budget
  useEffect(() => {
    if (isOpen) {
      const total = Object.keys(budgetData)
        .filter(key => key.startsWith('bdg') && key !== 'bdgtotal' && key.length <= 5)
        .reduce((sum, key) => sum + (parseFloat(budgetData[key]) || 0), 0);
      
      setBudgetData(prev => ({ ...prev, bdgtotal: total }));
    }
  }, [budgetData.bdg1, budgetData.bdg2, budgetData.bdg3, budgetData.bdg4, 
      budgetData.bdg5, budgetData.bdg6, budgetData.bdg7, budgetData.bdg8,
      budgetData.bdg9, budgetData.bdg10, budgetData.bdg11, budgetData.bdg12, isOpen]);

  // Custom onChange handler untuk TInput
  const handleTInputChange = (newData) => {
    setBudgetData(newData);
    onUnsavedChanges(true);
  };

  // Clear errors when field changes
  const handleFieldChange = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!budgetData.name.trim()) {
      newErrors.name = 'Nama budget diperlukan';
    }
    
    if (!budgetData.code.trim()) {
      newErrors.code = 'Kod budget diperlukan';
    } else if (budgetData.code.length < 3) {
      newErrors.code = 'Kod budget minimum 3 aksara';
    }

    if (budgetData.bdgtotal <= 0) {
      newErrors.budget = 'Jumlah budget mesti lebih dari RM 0.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Sila betulkan ralat pada borang' });
      return;
    }

    setIsFormLoading(true);
    try {
      // Ensure data types are correct before sending
      const cleanedData = {
        ...budgetData,
        type: parseInt(budgetData.type) || 0,
        department_id: budgetData.department_id ? parseInt(budgetData.department_id) : null,
        // Ensure monthly budgets are numbers
        bdg1: parseFloat(budgetData.bdg1) || 0,
        bdg2: parseFloat(budgetData.bdg2) || 0,
        bdg3: parseFloat(budgetData.bdg3) || 0,
        bdg4: parseFloat(budgetData.bdg4) || 0,
        bdg5: parseFloat(budgetData.bdg5) || 0,
        bdg6: parseFloat(budgetData.bdg6) || 0,
        bdg7: parseFloat(budgetData.bdg7) || 0,
        bdg8: parseFloat(budgetData.bdg8) || 0,
        bdg9: parseFloat(budgetData.bdg9) || 0,
        bdg10: parseFloat(budgetData.bdg10) || 0,
        bdg11: parseFloat(budgetData.bdg11) || 0,
        bdg12: parseFloat(budgetData.bdg12) || 0,
      };

      await onSave(cleanedData, selectedBudget);
      setNotification({ type: 'success', message: `Budget ${selectedBudget ? 'dikemaskini' : 'disimpan'} berjaya!` });
      
      setTimeout(() => {
        onClose();
        onUnsavedChanges(false);
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      let errorMessage = 'Ralat menyimpan budget';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleQuickFill = () => {
    const monthlyAmount = budgetData.bdgtotal / 12;
    const updatedData = { ...budgetData };
    for (let i = 1; i <= 12; i++) {
      updatedData[`bdg${i}`] = parseFloat(monthlyAmount.toFixed(2));
    }
    setBudgetData(updatedData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-5xl w-full max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Dialog Header */}
        <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
            }`}>
              <FaChartLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedBudget ? 'Kemaskini Budget' : 'Tambah Budget Baru'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedBudget ? 'Ubah maklumat budget sedia ada' : 'Cipta budget baharu untuk organisasi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Notification */}
        {notification.message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            notification.type === 'success' 
              ? isDark ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-green-100 text-green-700 border border-green-200'
              : isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Dialog Body */}
        <div className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div>
            <h4 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaBuilding className="w-5 h-5 mr-2" />
              Maklumat Asas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nama Budget *
                </label>
                <TInput
                  field="name"
                  setValue={handleTInputChange}
                  data={budgetData}
                  holder="cth: Budget Operasi 2025"
                  error={errors}
                  type="text"
                  inputCss={`${errors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } px-4 py-3`}
                  onChange={() => handleFieldChange('name')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Kod Budget *
                </label>
                <TInput
                  field="code"
                  setValue={handleTInputChange}
                  data={budgetData}
                  holder="cth: BGT001"
                  error={errors}
                  type="text"
                  inputCss={`${errors.code ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } px-4 py-3 uppercase`}
                  onChange={() => handleFieldChange('code')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jabatan
                </label>
                <TSelect
                  field="department_id"
                  setValue={handleTInputChange}
                  data={budgetData}
                  list={departments}
                  keyval="id,name"
                  error={errors}
                  placeholder="Pilih Jabatan"
                  className={`${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jenis Budget
                </label>
                <TSelect
                  field="type"
                  setValue={handleTInputChange}
                  data={budgetData}
                  list={[
                    { id: 0, name: 'Operasi' },
                    { id: 1, name: 'Debit' },
                    { id: 2, name: 'Kredit' }
                  ]}
                  keyval="id,name"
                  error={errors}
                  placeholder="Pilih Jenis Budget"
                  className={`${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>

          {/* Monthly Budget Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-medium flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaPiggyBank className="w-5 h-5 mr-2" />
                Peruntukan Bulanan
              </h4>
              <button
                type="button"
                onClick={handleQuickFill}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Agih Sama Rata
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {monthNames[i]}
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm z-10 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      RM
                    </span>
                    <TInput
                      field={`bdg${i + 1}`}
                      setValue={handleTInputChange}
                      data={budgetData}
                      error={errors}
                      type="number"
                      option={{ step: 0.01, min: 0 }}
                      inputCss={`${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } pl-10 pr-3 py-3 text-right`}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {errors.budget && <p className="text-red-500 text-sm mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.budget}
            </p>}
          </div>

          {/* Total Budget Display */}
          <div className={`p-6 rounded-xl border-2 border-dashed ${
            isDark 
              ? budgetData.bdgtotal > 0 ? 'bg-green-900 border-green-700' : 'bg-gray-700 border-gray-600'
              : budgetData.bdgtotal > 0 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jumlah Budget Tahunan
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Hasil daripada semua peruntukan bulanan
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  budgetData.bdgtotal > 0 
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatCurrency(budgetData.bdgtotal)}
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Purata bulanan: {formatCurrency(budgetData.bdgtotal / 12)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        {/* <div className={`sticky bottom-0 flex justify-end space-x-3 p-6 border-t ${ */}
        <div className={`flex justify-end space-x-3 p-6 border-t ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={onClose}
            disabled={isFormLoading}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50' 
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
            }`}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isFormLoading}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isFormLoading
                ? 'bg-gray-400 text-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isFormLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center">
                <FaSave className="w-4 h-4 mr-2" />
                {selectedBudget ? 'Kemaskini Budget' : 'Simpan Budget'}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetFormDialog;