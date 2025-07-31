import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaBan, FaLayerGroup, FaBuilding, FaHashtag, FaFont } from "react-icons/fa";
import TButton from "../Core/TButton";

const BudgetFormDialog = ({ 
  isOpen, 
  onClose, 
  selectedBudget, 
  initialFormData, // New prop for pre-setting form data
  departments, 
  budgets, 
  isDark, 
  onSave, 
  onUnsavedChanges 
}) => {
  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    yearly: new Date().getFullYear(),
    type: 0,
    level: 0,
    parent_id: '',
    sort_order: 1
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

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

  const canSave = () => {
    if (!selectedBudget) {
      return formData.name.trim() && formData.code.trim();
    }
    return hasUnsavedChanges;
  };

  const getSaveButtonText = () => {
    if (isLoading) {
      return selectedBudget ? 'Mengemaskini...' : 'Menyimpan...';
    }
    return selectedBudget ? 'Kemaskini' : 'Simpan';
  };

  const getPotentialParents = () => {
    const currentLevel = parseInt(formData.level) || 0;
    
    // Level 0 tidak ada parent
    if (currentLevel === 0) return [];
    
    return budgets.filter(budget => 
      budget.level === (currentLevel - 1) &&
      budget.id !== selectedBudget?.id
    );
  };

  // Get dialog title based on context
  const getDialogTitle = () => {
    if (selectedBudget) {
      return 'Kemaskini Budget';
    } else if (initialFormData?._insertParentFor) {
      return `Insert Parent untuk ${initialFormData._childBudgetCode}`;
    } else if (initialFormData?.parent_id) {
      const parent = budgets.find(b => b.id === parseInt(initialFormData.parent_id));
      return parent ? `Tambah Child Budget untuk ${parent.code}` : 'Tambah Budget Baru';
    } else {
      return 'Tambah Budget Baru';
    }
  };

  // ===== FORM INITIALIZATION =====
  useEffect(() => {
    if (isOpen) {
      let data;
      
      if (selectedBudget) {
        // Edit mode
        data = {
          name: selectedBudget.name || '',
          code: selectedBudget.code || '',
          department_id: selectedBudget.department_id ? String(selectedBudget.department_id) : '',
          yearly: selectedBudget.yearly || new Date().getFullYear(),
          type: selectedBudget.type || 0,
          level: selectedBudget.level || 0,
          parent_id: selectedBudget.parent_id ? String(selectedBudget.parent_id) : '',
          sort_order: selectedBudget.sort_order || 1,
        };
      } else {
        // Create mode - start with defaults
        data = {
          name: '',
          code: '',
          department_id: '',
          yearly: new Date().getFullYear(),
          type: 0,
          level: 0,
          parent_id: '',
          sort_order: 1,
        };

        // Override with initial form data if provided (for Add Child functionality)
        if (initialFormData) {
          data = {
            ...data,
            ...initialFormData
          };
        }
      }
      
      setFormData(data);
      setOriginalData({ ...data });
      setErrors({});
      setHasUnsavedChanges(false);
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [isOpen, selectedBudget, initialFormData]);

  // ===== UNSAVED CHANGES DETECTION =====
  useEffect(() => {
    if (!isInitialized) return;
    
    const hasChanges = !deepEqual(formData, originalData);
    setHasUnsavedChanges(hasChanges);
    
    if (onUnsavedChanges) {
      onUnsavedChanges(hasChanges);
    }
  }, [formData, originalData, isInitialized, onUnsavedChanges]);

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
        if (hasUnsavedChanges) {
          const action = selectedBudget ? 'kemaskini' : 'tambah';
          const message = `Terdapat perubahan yang belum disimpan untuk ${action} budget. Adakah anda pasti untuk menutup tanpa menyimpan?`;
          if (confirm(message)) onClose();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, canSave, isLoading, hasUnsavedChanges, selectedBudget, onClose]);

  // ===== EVENT HANDLERS =====
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (value === null || value === undefined) {
      processedValue = '';
    }
    
    if (field === 'code') {
      processedValue = String(value).toUpperCase();
    }
    
    if (['department_id', 'parent_id'].includes(field)) {
      processedValue = value ? String(value) : '';
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

    // Auto-calculate sort_order based on level
    if (field === 'level') {
      const newSortOrder = (parseInt(value) || 1);
      setFormData(prev => ({
        ...prev,
        level: parseInt(value) || 1,
        sort_order: newSortOrder
      }));
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const action = selectedBudget ? 'kemaskini' : 'tambah';
      const message = `Terdapat perubahan yang belum disimpan untuk ${action} budget. Adakah anda pasti untuk menutup tanpa menyimpan?`;
      
      if (confirm(message)) {
        setHasUnsavedChanges(false);
        setErrors({});
        onClose();
      }
    } else {
      onClose();
    }
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Nama budget wajib diisi';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Kod budget wajib diisi';
    } else if (formData.code.length > 50) {
      newErrors.code = 'Kod budget tidak boleh melebihi 50 aksara';
    }

    // Check duplicate code
    const existingBudget = budgets.find(b => 
      b.code.toLowerCase() === formData.code.toLowerCase() && 
      b.id !== selectedBudget?.id
    );
    if (existingBudget) {
      newErrors.code = 'Kod budget ini telah digunakan';
    }

    // Type validation
    if (![0, 1, 2].includes(parseInt(formData.type))) {
      newErrors.type = 'Jenis budget tidak sah';
    }

    // Level validation
    const level = parseInt(formData.level);
    if (level < 0 || level > 10) {
      newErrors.level = 'Level mesti antara 0 hingga 10';
    }

    // Parent validation
    if (formData.parent_id) {
      const parent = budgets.find(b => b.id === parseInt(formData.parent_id));
      if (!parent) {
        newErrors.parent_id = 'Parent budget tidak dijumpai';
      } else if (parent.level >= level) {
        newErrors.parent_id = 'Parent mesti mempunyai level yang lebih rendah';
      } else if (parent.id === selectedBudget?.id) {
        newErrors.parent_id = 'Budget tidak boleh menjadi parent kepada dirinya sendiri';
      }
    }

    // Level 0 tidak boleh ada parent
    if (level === 0 && formData.parent_id) {
      newErrors.parent_id = 'Budget level 0 tidak boleh mempunyai parent';
    }

    // Department validation
    if (formData.department_id && !departments.find(d => d.id === parseInt(formData.department_id))) {
      newErrors.department_id = 'Jabatan yang dipilih tidak wujud';
    }

    // Year validation
    const year = parseInt(formData.yearly);
    if (year < 2020 || year > 2050) {
      newErrors.yearly = 'Tahun budget mesti antara 2020 hingga 2050';
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
      const submitData = {
        name: (formData.name || '').trim(),
        code: (formData.code || '').trim().toUpperCase(),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        yearly: parseInt(formData.yearly || new Date().getFullYear()),
        type: parseInt(formData.type || '0'),
        level: parseInt(formData.level || '0'),
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : 1,
      };

      await onSave(submitData, selectedBudget);
      
      setOriginalData({ ...formData });
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PARENT CONTEXT INFO =====
  const getParentInfo = () => {
    if (formData.parent_id) {
      const parent = budgets.find(b => b.id === parseInt(formData.parent_id));
      if (parent) {
        return (
          <div className={`mt-2 p-3 rounded-lg border ${
            isDark ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center text-sm">
              <FaLayerGroup className="w-4 h-4 mr-2" />
              <span className="font-medium">Parent: </span>
              <code className="ml-1 px-2 py-1 bg-blue-800 text-blue-100 rounded text-xs">
                {parent.code}
              </code>
              <span className="ml-2">{parent.name}</span>
              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'
              }`}>
                Level {parent.level}
              </span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // ===== INSERT PARENT CONTEXT INFO =====
  const getInsertParentInfo = () => {
    if (initialFormData?._insertParentFor) {
      return (
        <div className={`mt-2 p-3 rounded-lg border ${
          isDark ? 'bg-purple-900 border-purple-700 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'
        }`}>
          <div className="flex items-center text-sm">
            <FaLayerGroup className="w-4 h-4 mr-2" />
            <span className="font-medium">Insert Parent untuk: </span>
            <code className="ml-1 px-2 py-1 bg-purple-800 text-purple-100 rounded text-xs">
              {initialFormData._childBudgetCode}
            </code>
            <span className="ml-2">{initialFormData._childBudgetName}</span>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
            💡 Parent baru ini akan disisipkan di antara struktur hierarki sedia ada. 
            Budget {initialFormData._childBudgetCode} dan semua descendant akan naik satu level.
          </div>
        </div>
      );
    }
    return null;
  };

  // ===== RENDER =====
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        
        {/* ===== HEADER ===== */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <FaLayerGroup className={`w-5 h-5 mr-3 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <h2 className="text-xl font-bold">
                {getDialogTitle()}
              </h2>
              {hasUnsavedChanges && (
                <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  • Perubahan belum disimpan
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
          
          {/* Context Info Display */}
          {getInsertParentInfo()}
          {getParentInfo()}
          
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold flex items-center ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <FaFont className="w-4 h-4 mr-2" />
              Maklumat Asas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nama Budget <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Masukkan nama budget"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Code Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kod Budget <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.code ? 'border-red-500' : ''}`}
                  placeholder="Contoh: BDG001"
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              {/* Year Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tahun Budget
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2050"
                  value={formData.yearly || ''}
                  onChange={(e) => handleInputChange('yearly', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.yearly ? 'border-red-500' : ''}`}
                  disabled={!!initialFormData?.yearly} // Disable if set by parent or insert parent mode
                />
                {errors.yearly && (
                  <p className="mt-1 text-sm text-red-500">{errors.yearly}</p>
                )}
              </div>
            </div>
          </div>

          {/* Structure Information Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold flex items-center ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <FaHashtag className="w-4 h-4 mr-2" />
              Struktur & Klasifikasi
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              {/* Type Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Jenis Budget <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type || '0'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.type ? 'border-red-500' : ''}`}
                  disabled={!!(initialFormData?.type || initialFormData?._insertParentFor)} // Disable if inherited from parent or insert parent mode
                >
                  <option value={0}>Operasi</option>
                  <option value={1}>Pendapatan</option>
                  <option value={2}>Perbelanjaan</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
              </div>

              {/* Level Field */}
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
                  value={formData.level || '0'}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.level ? 'border-red-500' : ''}`}
                  disabled={!!(initialFormData?.level || initialFormData?._insertParentFor)} // Disable if set by Add Child or Insert Parent
                />
                {errors.level && (
                  <p className="mt-1 text-sm text-red-500">{errors.level}</p>
                )}
              </div>

              {/* Sort Order Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Urutan
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order || ''}
                  onChange={(e) => handleInputChange('sort_order', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Auto-calculated"
                />
              </div>
            </div>

            {/* Parent Budget Field - Only show if not adding child or level > 0, and not in insert parent mode */}
            {(parseInt(formData.level || '0') > 0 && !initialFormData?.parent_id && !initialFormData?._insertParentFor) && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Parent Budget
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => handleInputChange('parent_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.parent_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Pilih Parent Budget</option>
                  {getPotentialParents().map(parent => (
                    <option key={parent.id} value={parent.id}>
                      [{parent.code}] {parent.name}
                    </option>
                  ))}
                </select>
                {errors.parent_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.parent_id}</p>
                )}
                {getPotentialParents().length === 0 && parseInt(formData.level || '0') > 0 && (
                  <p className={`mt-1 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Tiada parent budget tersedia untuk level {formData.level}. 
                    Sila buat budget level {parseInt(formData.level || '0') - 1} terlebih dahulu.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Organization Information Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold flex items-center ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              <FaBuilding className="w-4 h-4 mr-2" />
              Maklumat Organisasi
            </h3>

            {/* Department Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Jabatan
              </label>
              <select
                value={formData.department_id || ''}
                onChange={(e) => handleInputChange('department_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${errors.department_id ? 'border-red-500' : ''}`}
              >
                <option value="">Pilih Jabatan</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>
              )}
            </div>

          </div>

          {/* ===== ACTION BUTTONS ===== */}
          <div className={`flex justify-end space-x-3 pt-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <TButton
              variant="outline"
              color="ghost"
              onClick={handleClose}
              isDisable={isLoading}
              className="group"
            >
              <FaBan className="w-4 h-4" />
              <span>Batal</span>
              <span className={`ml-2 text-xs opacity-50 group-hover:opacity-75 transition-opacity ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
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

export default BudgetFormDialog;