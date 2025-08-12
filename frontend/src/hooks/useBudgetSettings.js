import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import apiClient from "../utils/axios";

/**
 * Custom hook for Budget Settings functionality
 * Extracts all state management and business logic from BudgetSettings component
 */
export const useBudgetSettings = () => {
  // Core state
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  
  // Load budgets with pagination and search
  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/budgets`);
      
      if (response.success) setBudgets(response.data || []);
    } catch (error) {
      toast.error('Ralat memuat senarai budget');
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }, []);

  // Save budget (create or update)
  const handleSaveBudget = useCallback(async (budgetData, isEdit) => {
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
          const childBudgetId = initialFormData._insertParentFor;
          const childBudget = budgets.find(b => b.id === childBudgetId);
          
          if (childBudget) {
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
  }, [budgets, initialFormData, loadBudgets]);

  // Reload budgets after budget allocation update
  const handleSaveBudgetAllocation = useCallback(async () => {
    await loadBudgets();
  }, [loadBudgets]);

  // Update budget hierarchy after inserting parent
  const updateBudgetHierarchy = useCallback(async (childBudgetId, newParentId) => {
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
        await updateDescendants(child.id, levelIncrement);
      }
    };

    await updateDescendants(childBudgetId, 1);
  }, [budgets]);

  // Delete budget
  const handleDeleteBudget = useCallback(async (budgetId, budgetName) => {
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
  }, [loadBudgets]);

  // Quick set parent for orphaned budgets
  const handleQuickSetParent = useCallback(async (childBudget, parentBudget) => {
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
  }, [loadBudgets]);

  // Dialog management
  const handleEditBudget = useCallback((budget) => {
    setSelectedBudget(budget);
    setInitialFormData(null);
    setShowDialog(true);
  }, []);

  const handleNewBudget = useCallback(() => {
    setSelectedBudget(null);
    setInitialFormData(null);
    setShowDialog(true);
  }, []);

  const handleAddChild = useCallback((parentBudget) => {
    const existingChildrenCount = getChildrenCount(parentBudget.id);
    const nextSortOrder = existingChildrenCount + 1;
    
    setInitialFormData({
      parent_id: parentBudget.id.toString(),
      level: (parentBudget.level + 1),
      type: parentBudget.type,
      department_id: parentBudget.department_id ? parentBudget.department_id.toString() : '',
      yearly: parentBudget.yearly || new Date().getFullYear(),
      sort_order: nextSortOrder
    });
    setShowDialog(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
    setSelectedBudget(null);
    setInitialFormData(null);
  }, []);

  const handleAllocationDialogClose = useCallback(() => {
    setShowAllocationDialog(false);
    setSelectedBudget(null);
    setInitialFormData(null);
  }, []);

  const handleAllocationBudget = useCallback((budget) => {
    setSelectedBudget(budget);
    setInitialFormData(null);
    setShowAllocationDialog(true);
  }, []);

  // Utility functions
  const getOrphanedBudgets = useCallback(() => {
    return budgets.filter(budget => 
      budget.level > 0 && 
      !budget.parent_id && 
      budget.level > 1
    );
  }, [budgets]);

  const getPotentialParents = useCallback((childBudget) => {
    return budgets.filter(budget => 
      budget.level === (childBudget.level - 1) &&
      budget.id !== childBudget.id
    );
  }, [budgets]);

  const getBudgetTypeLabel = useCallback((type) => {
    return type === 2 ? 'Perbelanjaan' : type === 1 ? 'Pendapatan' : 'Operasi';
  }, []);

  const getDepartmentName = useCallback((departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Tiada Jabatan';
  }, [departments]);

  const canHaveChildren = useCallback((budget) => {
    return (budget.level || 0) < 10;
  }, []);

  const getChildrenCount = useCallback((budgetId) => {
    return budgets.filter(b => b.parent_id === budgetId).length;
  }, [budgets]);

  // Build hierarchical display
  const buildHierarchicalDisplay = useCallback((budgets) => {
    const budgetMap = {};
    const rootBudgets = [];
    
    budgets.forEach(budget => {
      budgetMap[budget.id] = { ...budget, children: [] };
    });
    
    budgets.forEach(budget => {
      if (budget.parent_id && budgetMap[budget.parent_id]) {
        budgetMap[budget.parent_id].children.push(budgetMap[budget.id]);
      } else {
        rootBudgets.push(budgetMap[budget.id]);
      }
    });
    
    const flattenWithHierarchy = (items, level = 0, result = []) => {
      items.forEach(item => {
        result.push({
          ...item,
          displayLevel: level,
          indentation: '  '.repeat(level)
        });
        if (item.children.length > 0) {
          flattenWithHierarchy(item.children, level + 1, result);
        }
      });
      return result;
    };
    
    return flattenWithHierarchy(rootBudgets);
  }, []);

  const hierarchicalBudgets = buildHierarchicalDisplay(budgets);

  // Effects
  useEffect(() => {
    loadBudgets();
    loadDepartments();
  }, [loadBudgets, loadDepartments]);

  // Return all necessary values and functions
  return {
    // State
    budgets,
    departments,
    selectedBudget,
    initialFormData,
    isLoading,
    showDialog,
    showAllocationDialog,
    hierarchicalBudgets,
    // Actions
    handleSaveBudget,
    handleSaveBudgetAllocation,
    handleDeleteBudget,
    handleQuickSetParent,
    handleEditBudget,
    handleNewBudget,
    handleAddChild,
    handleAllocationBudget,
    handleDialogClose,
    handleAllocationDialogClose,
    // Utility functions
    getOrphanedBudgets,
    getPotentialParents,
    getBudgetTypeLabel,
    getDepartmentName,
    canHaveChildren,
    getChildrenCount,
  };
};
