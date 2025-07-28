import { useState, useEffect } from "react";
import { FaChartLine, FaSave, FaTimes, FaBuilding, FaSitemap, FaLayerGroup } from "react-icons/fa";
import TInput from "../Core/TInput"; // Adjust path as needed
import TSelect from "../Core/TSelect"; // Adjust path as needed

/**
 * Budget Form Dialog Component - Infrastructure Setup Only (Simplified)
 */
const BudgetFormDialog = ({ 
  isOpen, 
  onClose, 
  selectedBudget, 
  departments = [], 
  budgets = [],
  isDark, 
  onSave,
  onUnsavedChanges 
}) => {
  console.log('BudgetFormDialog render:', { isOpen, selectedBudget, departments: departments.length, budgets: budgets.length });

  const [budgetData, setBudgetData] = useState({
    name: '',
    code: '',
    department_id: '',
    type: 0,
    level: 0,
    is_group: false,
    group_type: 'detail',
    sort_order: 1,
    parent_id: ''
  });
  const [errors, setErrors] = useState({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Reset form when dialog opens/closes
  useEffect(() => {
    console.log('useEffect triggered:', { isOpen, selectedBudget });
    if (isOpen) {
      if (selectedBudget) {
        console.log('Loading selected budget:', selectedBudget);
        setBudgetData({ 
          name: selectedBudget.name || '',
          code: selectedBudget.code || '',
          department_id: selectedBudget.department_id || '',
          type: selectedBudget.type || 0,
          level: selectedBudget.level || 0,
          is_group: selectedBudget.is_group || false,
          group_type: selectedBudget.group_type || 'detail',
          sort_order: selectedBudget.sort_order || 1,
          parent_id: selectedBudget.parent_id || ''
        });
      } else {
        console.log('Setting default budget data');
        setBudgetData({
          name: '',
          code: '',
          department_id: '',
          type: 0,
          level: 0,
          is_group: false,
          group_type: 'detail',
          sort_order: 1,
          parent_id: ''
        });
      }
      setErrors({});
      setNotification({ type: '', message: '' });
    }
  }, [isOpen, selectedBudget]);

  // Auto-set group_type based on level and is_group, and clear parent_id for level 0
  useEffect(() => {
    if (budgetData.is_group) {
      let groupType = 'detail';
      if (budgetData.level === 1) groupType = 'main';
      else if (budgetData.level === 2) groupType = 'sub';
      else if (budgetData.level >= 3) groupType = 'detail';
      
      if (budgetData.group_type !== groupType) {
        setBudgetData(prev => ({ ...prev, group_type: groupType }));
      }
    }

    // Clear parent_id when level is 0
    if (budgetData.level === 0 && budgetData.parent_id) {
      setBudgetData(prev => ({ ...prev, parent_id: '' }));
    }
  }, [budgetData.level, budgetData.is_group]);

  // Custom onChange handler untuk TInput
  const handleTInputChange = (newData) => {
    console.log('TInput change:', newData);
    setBudgetData(newData);
    if (onUnsavedChanges) onUnsavedChanges(true);
  };

  // Handle direct field changes
  const handleDirectChange = (field, value) => {
    console.log('Direct change:', field, value);
    const newData = { ...budgetData, [field]: value };
    setBudgetData(newData);
    if (onUnsavedChanges) onUnsavedChanges(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
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

    if (budgetData.level < 0) {
      newErrors.level = 'Level tidak boleh kurang dari 0';
    }

    // Parent validation rules
    if (budgetData.level > 1 && !budgetData.parent_id) {
      newErrors.parent_id = `Parent diperlukan untuk level ${budgetData.level}`;
    }
    
    if (budgetData.parent_id) {
      const parent = budgets.find(b => b.id === parseInt(budgetData.parent_id));
      if (parent && parent.level !== (budgetData.level - 1)) {
        newErrors.parent_id = `Parent mesti Level ${budgetData.level - 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('Save clicked, data:', budgetData);
    
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
        level: parseInt(budgetData.level) || 0,
        sort_order: parseInt(budgetData.sort_order) || 1,
        department_id: budgetData.department_id ? parseInt(budgetData.department_id) : null,
        parent_id: budgetData.parent_id ? parseInt(budgetData.parent_id) : null,
        is_group: Boolean(budgetData.is_group)
      };

      console.log('Sending cleaned data:', cleanedData);
      await onSave(cleanedData, selectedBudget);
      setNotification({ type: 'success', message: `Budget ${selectedBudget ? 'dikemaskini' : 'disimpan'} berjaya!` });
      
      setTimeout(() => {
        onClose();
        if (onUnsavedChanges) onUnsavedChanges(false);
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

  // Get potential parent budgets (exclude self and children)
  const getParentOptions = () => {
    if (budgetData.level === 0) return []; // Level 0 has no parent
    
    console.log('Getting parent options for level:', budgetData.level);
    console.log('Available budgets:', budgets);
    
    const options = budgets.filter(budget => {
      // Don't include self as parent
      if (selectedBudget && budget.id === selectedBudget.id) return false;
      
      // Only show budgets with level exactly one less than current level
      const requiredParentLevel = budgetData.level - 1;
      if (budget.level !== requiredParentLevel) return false;
      
      return true;
    }).map(budget => ({
      id: budget.id,
      name: `${budget.code} - ${budget.name} (L${budget.level})`
    }));
    
    console.log('Parent options:', options);
    return options;
  };

  if (!isOpen) {
    console.log('Dialog not open, returning null');
    return null;
  }

  console.log('Rendering dialog with data:', budgetData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl ${
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
                {selectedBudget ? 'Kemaskini Struktur Budget' : 'Tambah Struktur Budget'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedBudget ? 'Ubah maklumat struktur budget' : 'Cipta struktur budget baharu'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
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
          {/* Debug Info */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
            <strong>Debug:</strong> Level {budgetData.level}, Parent: {budgetData.parent_id || 'none'}, 
            Budgets available: {budgets.length}, Departments: {departments.length}
          </div>

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
                <input
                  type="text"
                  value={budgetData.name}
                  onChange={(e) => handleDirectChange('name', e.target.value)}
                  placeholder="cth: Budget Operasi Utama"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Kod Budget *
                </label>
                <input
                  type="text"
                  value={budgetData.code}
                  onChange={(e) => handleDirectChange('code', e.target.value.toUpperCase())}
                  placeholder="cth: BGT-OPR-001"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.code ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jabatan (Pilihan)
                </label>
                <select
                  value={budgetData.department_id}
                  onChange={(e) => handleDirectChange('department_id', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Pilih Jabatan</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jenis Budget
                </label>
                <select
                  value={budgetData.type}
                  onChange={(e) => handleDirectChange('type', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={0}>Operasi</option>
                  <option value={1}>Debit</option>
                  <option value={2}>Kredit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hierarchy Section */}
          <div>
            <h4 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaSitemap className="w-5 h-5 mr-2" />
              Struktur Hierarki
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Level Hierarki
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={budgetData.level}
                  onChange={(e) => handleDirectChange('level', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.level ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.level && (
                  <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                )}
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  0 = Root, 1 = Utama, 2 = Sub, 3+ = Detail
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Susunan Dalam Level
                </label>
                <input
                  type="number"
                  min="1"
                  value={budgetData.sort_order}
                  onChange={(e) => handleDirectChange('sort_order', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nombor untuk menyusun item dalam level yang sama
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Jenis Item
                </label>
                <div className="flex items-center space-x-4 pt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={budgetData.is_group}
                      onChange={(e) => handleDirectChange('is_group', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaLayerGroup className="inline w-4 h-4 mr-1" />
                      Kumpulan/Header
                    </span>
                  </label>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Centang jika ini adalah header/kumpulan
                </p>
              </div>
            </div>

            {/* Parent Selection */}
            {budgetData.level > 0 && (
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Parent Budget {budgetData.level > 1 && '*'}
                </label>
                <select
                  value={budgetData.parent_id}
                  onChange={(e) => handleDirectChange('parent_id', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.parent_id ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${
                    isDark
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="">Pilih Parent Level {budgetData.level - 1}</option>
                  {getParentOptions().map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
                {errors.parent_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>
                )}
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {budgetData.level === 1 
                    ? 'Pilihan: Boleh pilih Level 0 sebagai parent atau biarkan kosong'
                    : `Diperlukan: Mesti pilih satu Level ${budgetData.level - 1} sebagai parent`
                  }
                </p>
              </div>
            )}

            {budgetData.level === 0 && (
              <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center">
                  <FaSitemap className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      Level Root (0)
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Item ini adalah root level dan tidak memerlukan parent
                    </p>
                  </div>
                </div>
              </div>
            )}

            {budgetData.is_group && (
              <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700">
                <div className="flex items-center">
                  <FaLayerGroup className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                      Jenis Kumpulan: {budgetData.group_type === 'main' ? 'Utama' : budgetData.group_type === 'sub' ? 'Sub' : 'Detail'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      Jenis kumpulan ditetapkan automatik berdasarkan level hierarki
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Footer */}
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
                {selectedBudget ? 'Kemaskini Struktur' : 'Simpan Struktur'}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetFormDialog;