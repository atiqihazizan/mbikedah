import { useState, useEffect } from "react";
import { FaChartLine, FaPlus, FaEdit, FaTrash, FaLayerGroup, FaSitemap, FaBaby } from "react-icons/fa";
import { toast } from "react-toastify";
import apiClient from "../../utils/axios"; // Adjust path as needed
import BudgetFormDialog from "../../components/dialogs/BudgetFormDialog"; // Import the separated dialog
import TButton from "../../components/Core/TButton"; // Import TButton component

/**
 * Main Budget Settings Component (Finance Role Only) - Infrastructure Setup
 */
const BudgetSettings = ({ isDark, currentUser, onUnsavedChanges }) => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null); // New state for initial form data
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Load data awal
  useEffect(() => {
    loadBudgets();
    loadDepartments();
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/budgets');
      setBudgets(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Ralat memuat senarai budget');
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSaveBudget = async (budgetData, isEdit) => {
    try {
      let newBudget;
      
      if (isEdit) {
        await apiClient.put(`/budgets/${isEdit.id}/name-level`, budgetData);
        toast.success('Budget berjaya dikemaskini');
        newBudget = { ...isEdit, ...budgetData };
      } else {
        const response = await apiClient.post('/budgets', budgetData);
        toast.success('Budget baru berjaya disimpan');
        newBudget = response.data.data || response.data;
      }

      // Handle Insert Parent special case
      if (initialFormData?._insertParentFor && newBudget) {
        try {
          // Update the child budget to point to new parent
          const childBudgetId = initialFormData._insertParentFor;
          const childBudget = budgets.find(b => b.id === childBudgetId);
          
          if (childBudget) {
            // Update child budget's parent_id and increment its level and all descendants
            await updateBudgetHierarchy(childBudgetId, newBudget.id);
            toast.success(`${initialFormData._childBudgetCode} telah diassign kepada parent baru`);
          }
        } catch (hierarchyError) {
          console.error('Error updating hierarchy:', hierarchyError);
          toast.warning('Parent berjaya disimpan, tetapi terdapat masalah mengemas kini hierarki. Sila refresh page.');
        }
      }
      
      await loadBudgets();
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || 'Ralat menyimpan budget';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Helper function to update budget hierarchy after inserting parent
  const updateBudgetHierarchy = async (childBudgetId, newParentId) => {
    const childBudget = budgets.find(b => b.id === childBudgetId);
    if (!childBudget) return;

    // Update child budget to point to new parent and increment level
    await apiClient.put(`/budgets/${childBudgetId}/name-level`, {
      ...childBudget,
      parent_id: newParentId,
      level: childBudget.level + 1
    });

    // Recursively update all descendants
    const updateDescendants = async (parentId, levelIncrement) => {
      const children = budgets.filter(b => b.parent_id === parentId);
      for (const child of children) {
        await apiClient.put(`/budgets/${child.id}/name-level`, {
          ...child,
          level: child.level + levelIncrement
        });
        // Recursively update grandchildren
        await updateDescendants(child.id, levelIncrement);
      }
    };

    await updateDescendants(childBudgetId, 1);
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setInitialFormData(null); // Clear any initial form data
    setShowDialog(true);
  };

  const handleNewBudget = () => {
    setSelectedBudget(null);
    setInitialFormData(null); // Clear any initial form data
    setShowDialog(true);
  };

  // New function to handle adding child budget
  const handleAddChild = (parentBudget) => {
    setSelectedBudget(null); // This is create mode
    setInitialFormData({
      parent_id: parentBudget.id.toString(),
      level: (parentBudget.level + 1),
      type: parentBudget.type, // Inherit parent's type
      department_id: parentBudget.department_id ? parentBudget.department_id.toString() : '',
      yearly: parentBudget.yearly || new Date().getFullYear(),
      sort_order: 1
    });
    setShowDialog(true);
  };

  // New function to handle inserting parent above existing budget
  const handleInsertParent = (childBudget) => {
    // Check if this will cause level overflow
    const maxChildLevel = getMaxChildLevel(childBudget.id);
    if (maxChildLevel >= 10) {
      toast.error('Tidak dapat insert parent kerana akan melebihi had level maksimum (10)');
      return;
    }

    // Calculate new level for the parent
    const newParentLevel = Math.max(0, childBudget.level);
    
    setSelectedBudget(null); // This is create mode
    setInitialFormData({
      parent_id: childBudget.parent_id ? childBudget.parent_id.toString() : '',
      level: newParentLevel,
      type: childBudget.type, // Inherit child's type
      department_id: childBudget.department_id ? childBudget.department_id.toString() : '',
      yearly: childBudget.yearly || new Date().getFullYear(),
      sort_order: 1,
      _insertParentFor: childBudget.id, // Special flag to indicate this is insert parent mode
      _childBudgetName: childBudget.name,
      _childBudgetCode: childBudget.code
    });
    setShowDialog(true);
  };

  const handleDeleteBudget = async (budgetId, budgetName) => {
    if (!confirm(`Adakah anda pasti untuk memadam budget "${budgetName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await apiClient.delete(`/budgets/${budgetId}`);
      toast.success('Budget berjaya dipadam');
      await loadBudgets();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ralat memadam budget';
      toast.error(errorMessage);
    }
  };

  const handleQuickSetParent = async (childBudget, parentBudget) => {
    try {
      await apiClient.put(`/budgets/${childBudget.id}/name-level`, {
        ...childBudget,
        parent_id: parentBudget.id
      });
      toast.success(`${childBudget.code} telah diset sebagai child kepada ${parentBudget.code}`);
      await loadBudgets();
    } catch (error) {
      toast.error('Ralat mengemas kini parent-child relationship');
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setSelectedBudget(null);
    setInitialFormData(null); // Clear initial form data when closing
  };

  const getOrphanedBudgets = () => {
    return budgets.filter(budget => 
      budget.level > 0 && 
      !budget.parent_id && 
      budget.level > 1 // Level 1 boleh tiada parent, tapi level 2+ perlu parent
    );
  };

  const getPotentialParents = (childBudget) => {
    return budgets.filter(budget => 
      budget.level === (childBudget.level - 1) &&
      budget.id !== childBudget.id
    );
  };

  const getBudgetTypeLabel = (type) => {
    return type === 2 ? 'Perbelanjaan' : type === 1 ? 'Pendapatan' : 'Operasi';
  };

  const getGroupTypeLabel = (groupType) => {
    switch (groupType) {
      case 'main': return 'Utama';
      case 'sub': return 'Sub';
      case 'detail': return 'Terperinci';
      default: return 'Item';
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Tiada Jabatan';
  };

  // Check if budget can have children (max level check)
  const canHaveChildren = (budget) => {
    return (budget.level || 0) < 10; // Assuming max level is 10
  };

  // Get children count for display
  const getChildrenCount = (budgetId) => {
    return budgets.filter(b => b.parent_id === budgetId).length;
  };

  // Get maximum level of all descendants (for insert parent validation)
  const getMaxChildLevel = (budgetId) => {
    const getChildrenRecursive = (parentId) => {
      const directChildren = budgets.filter(b => b.parent_id === parentId);
      if (directChildren.length === 0) return 0;
      
      let maxLevel = 0;
      directChildren.forEach(child => {
        const childMaxLevel = Math.max(child.level, getChildrenRecursive(child.id));
        maxLevel = Math.max(maxLevel, childMaxLevel);
      });
      return maxLevel;
    };
    
    const budget = budgets.find(b => b.id === budgetId);
    return budget ? Math.max(budget.level, getChildrenRecursive(budgetId)) : 0;
  };

  // Filter budgets based on search and filters
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || budget.type.toString() === filterType;
    const matchesLevel = filterLevel === '' || budget.level.toString() === filterLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  // Get unique levels for filter
  const availableLevels = [...new Set(budgets.map(b => b.level || 0))].sort((a, b) => a - b);

  // Build hierarchical display with proper indentation
  const buildHierarchicalDisplay = (budgets) => {
    const budgetMap = {};
    const rootBudgets = [];
    
    // Create map for quick lookup
    budgets.forEach(budget => {budgetMap[budget.id] = { ...budget, children: [] }});
    
    // Build parent-child relationships
    budgets.forEach(budget => {
      if (budget.parent_id && budgetMap[budget.parent_id]) {
        budgetMap[budget.parent_id].children.push(budgetMap[budget.id]);
      } else {
        rootBudgets.push(budgetMap[budget.id]);
      }
    });
    
    // Flatten with proper hierarchy indication
    const flattenWithHierarchy = (items, level = 0, result = []) => {
      items.forEach(item => {
        result.push({
          ...item,
          displayLevel: level,
          indentation: '  '.repeat(level)
        });
        if (item.children.length > 0) flattenWithHierarchy(item.children, level + 1, result);
      });
      return result;
    };
    
    return flattenWithHierarchy(rootBudgets);
  };

  // Get hierarchical display data
  const hierarchicalBudgets = buildHierarchicalDisplay(filteredBudgets);

  const getParentBreadcrumb = (budget) => {
    const breadcrumb = [];
    let current = budget;
    
    while (current && current.parent_id) {
      const parent = budgets.find(b => b.id === current.parent_id);
      if (parent) {
        breadcrumb.unshift(parent.code);
        current = parent;
      } else {
        break;
      }
    }
    
    return breadcrumb.length > 0 ? breadcrumb.join(' → ') + ' → ' : '';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Struktur Budget
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Urus struktur hierarki dan kategori budget organisasi
            </p>
          </div>
          <TButton
            variant="solid"
            color="blue"
            size="lg"
            onClick={handleNewBudget}
            className="shadow-lg hover:shadow-xl px-4 py-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Tambah Budget</span>
          </TButton>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-4">
            <input
              type="text"
              placeholder="Cari nama atau kod budget..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Semua Jenis</option>
            <option value="0">Operasi</option>
            <option value="1">Pendapatan</option>
            <option value="2">Perbelanjaan</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Semua Level</option>
            {availableLevels.map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orphaned Budgets Alert */}
      {getOrphanedBudgets().length > 0 && (
        <div className={`mb-4 p-4 rounded-lg border ${
          isDark ? 'bg-orange-900 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-700 border-orange-200'
        }`}>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3"></div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Budget Tanpa Parent Dijumpai</h4>
              <p className="text-sm mb-3">
                Terdapat {getOrphanedBudgets().length} budget yang memerlukan parent assignment:
              </p>
              <div className="space-y-2">
                {getOrphanedBudgets().slice(0, 3).map(orphan => {
                  const potentialParents = getPotentialParents(orphan);
                  return (
                    <div key={orphan.id} className={`p-3 rounded border ${
                      isDark ? 'bg-orange-800 border-orange-600' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-sm">{orphan.code}</span>
                          <span className="mx-2">-</span>
                          <span className="text-sm">{orphan.name}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${
                            isDark ? 'bg-orange-700 text-orange-200' : 'bg-orange-200 text-orange-800'
                          }`}>
                            Level {orphan.level}
                          </span>
                        </div>
                        {potentialParents.length > 0 && (
                          <select
                            onChange={(e) => {
                              const parentId = e.target.value;
                              const parent = budgets.find(b => b.id === parseInt(parentId));
                              if (parent) {
                                handleQuickSetParent(orphan, parent);
                              }
                            }}
                            className={`text-xs px-2 py-1 rounded border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Set Parent...</option>
                            {potentialParents.map(parent => (
                              <option key={parent.id} value={parent.id}>
                                {parent.code} - {parent.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {getOrphanedBudgets().length > 3 && (
                <p className="text-xs mt-2 opacity-75">
                  ... dan {getOrphanedBudgets().length - 3} lagi
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className={`rounded-xl border shadow-lg ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Senarai Budget ({filteredBudgets.length})
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <FaSitemap className="w-4 h-4 mr-1" />
              Hierarki Budget
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Memuat data budget...
              </p>
            </div>
          ) : hierarchicalBudgets.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <FaChartLine className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h4 className="text-lg font-medium mb-2">
                {budgets.length === 0 ? 'Tiada Budget Dijumpai' : 'Tiada Hasil Carian'}
              </h4>
              <p className="mb-4">
                {budgets.length === 0 
                  ? 'Belum ada struktur budget yang dibuat untuk organisasi ini.'
                  : 'Tiada budget yang sepadan dengan kriteria carian anda.'
                }
              </p>
              {budgets.length === 0 && (
                <TButton
                  variant="link"
                  color="blue"
                  onClick={handleNewBudget}
                >
                  Tambah struktur budget pertama
                </TButton>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-28rem)] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Kod Budget
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Budget
                    </th>
                    {/* <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Susunan
                    </th> */}
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Jenis
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Jabatan
                    </th>
                    <th className={`text-center py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Children
                    </th>
                    <th className={`text-center py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hierarchicalBudgets.map((budget, index) => (
                    <tr key={budget.id} className={`border-b transition-colors ${
                      isDark 
                        ? 'border-gray-700 hover:bg-gray-750' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                      <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {/* <code className={`px-2 py-1 rounded text-sm font-mono ${
                          isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'
                        }`}>
                          {budget.code}
                        </code>
                        {budget.displayLevel > 0 && (
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getParentBreadcrumb(budget)}{budget.code}
                          </div>
                        )} */}
                        <div className="flex items-center">
                          <div className="flex items-center" style={{ marginLeft: `${budget.displayLevel * 20}px` }}>
                            {budget.displayLevel > 0 && (
                              <div className="flex items-center mr-2">
                                <div className="w-2 h-2 border-l border-b border-gray-400 mr-2"></div>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs py-1 rounded`}>
                            <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'}`}>
                              {budget.code}
                            </code>
                            {/* {budget.displayLevel > 0 && (
                              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {getParentBreadcrumb(budget)}{budget.code}
                              </div>
                            )} */}
                          </span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {/* <div className="flex items-center">
                          <div className="flex items-center" style={{ marginLeft: `${budget.displayLevel * 20}px` }}>
                            {budget.displayLevel > 0 && (
                              <div className="flex items-center mr-2">
                                <div className="w-2 h-2 border-l border-b border-gray-400 mr-2"></div>
                              </div>
                            )}
                          </div>
                          </div> */}
                        <span className={`text-xs py-1 rounded`}>
                          {budget.name}
                        </span>
                      </td>
                      {/* <td className={`py-4 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {budget.sort_order}
                      </td> */}
                      <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          budget.type === 2
                            ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                            : budget.type === 1 
                            ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                            : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getBudgetTypeLabel(budget.type)}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getDepartmentName(budget.department_id)}
                      </td>
                      <td className={`py-4 px-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          getChildrenCount(budget.id) > 0
                            ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {getChildrenCount(budget.id)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-1">
                          {/* Add Child Button */}
                          {canHaveChildren(budget) && (
                            <TButton
                              variant="subtle"
                              color="green"
                              size="sm"
                              circle
                              onClick={() => handleAddChild(budget)}
                              className="transition-all duration-200"
                              title={`Tambah child budget untuk ${budget.name}`}
                            >
                              <FaBaby className="w-3 h-3" />
                            </TButton>
                          )}

                          {/* Insert Parent Button - only show if budget can have a parent inserted */}
                          {/* {budget.level < 10 && (
                            <TButton
                              variant="subtle"
                              color="purple"
                              size="sm"
                              circle
                              onClick={() => handleInsertParent(budget)}
                              className="transition-all duration-200"
                              title={`Insert parent baru untuk ${budget.name}`}
                            >
                              <FaLayerGroup className="w-3 h-3" />
                            </TButton>
                          )} */}
                          
                          {/* Edit Button */}
                          <TButton
                            variant="subtle"
                            color="blue"
                            size="sm"
                            circle
                            onClick={() => handleEditBudget(budget)}
                            className="transition-all duration-200"
                            title={`Edit ${budget.name}`}
                          >
                            <FaEdit className="w-4 h-4" />
                          </TButton>
                          
                          {/* Delete Button */}
                          <TButton
                            variant="subtle"
                            color="red"
                            size="sm"
                            circle
                            onClick={() => handleDeleteBudget(budget.id, budget.name)}
                            className="transition-all duration-200"
                            title={`Padam ${budget.name}`}
                          >
                            <FaTrash className="w-4 h-4" />
                          </TButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Budget Form Dialog */}
      <BudgetFormDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        selectedBudget={selectedBudget}
        initialFormData={initialFormData}
        departments={departments}
        budgets={budgets}
        isDark={isDark}
        onSave={handleSaveBudget}
        onUnsavedChanges={onUnsavedChanges}
      />
    </div>
  );
};

export default BudgetSettings;