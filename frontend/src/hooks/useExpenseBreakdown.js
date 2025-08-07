import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';
import expenseData from '../assets/data/ExpenseBreakdown.json';

export const useExpenseBreakdown = (dashboardData, refetch) => {
  const [expenseDataState, setExpenseDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simulate API call for expense breakdown data
  const fetchExpenseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExpenseDataState(expenseData);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  // Helper function to get total for a category
  const getCategoryTotal = useCallback((category) => {
    if (!category || !category.monthly) return {};
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const totals = { total: 0 };
    months.forEach(month => {
      totals[month] = category.monthly?.[month] || 0;
      totals.total += totals[month];
    });
    return totals;
  }, []);

  // Calculate totals for all expense categories
  const expenseTotal = useMemo(() => {
    if (!expenseDataState) return null;
    const keys = Object.keys(expenseDataState).filter(k => k !== 'config');
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    const categoryTotals = {};
    keys.forEach(key => {
      const cat = expenseDataState[key];
      if (cat && cat.monthly) {
        categoryTotals[key] = getCategoryTotal(cat);
      }
    });
    months.forEach(month => {
      grandTotal[month] = keys.reduce((sum, key) => sum + (categoryTotals[key]?.[month] || 0), 0);
      grandTotal.total += grandTotal[month];
    });
    return { ...categoryTotals, grand: grandTotal };
  }, [expenseDataState, getCategoryTotal]);

  // Calculate budget totals
  const budgetTotal = useMemo(() => {
    if (!expenseDataState) return null;
    const keys = Object.keys(expenseDataState).filter(k => k !== 'config');
    const categoryBudgets = {};
    let grand = 0;
    keys.forEach(key => {
      const cat = expenseDataState[key];
      if (cat && cat.budget2025) {
        categoryBudgets[key] = cat.budget2025;
        grand += cat.budget2025;
      }
    });
    return { ...categoryBudgets, grand };
  }, [expenseDataState]);

  // Calculate actual totals
  const actualTotal = useMemo(() => {
    if (!expenseDataState) return null;
    const keys = Object.keys(expenseDataState).filter(k => k !== 'config');
    const categoryActuals = {};
    let grand = 0;
    keys.forEach(key => {
      const cat = expenseDataState[key];
      if (cat && cat.actual2024) {
        categoryActuals[key] = cat.actual2024;
        grand += cat.actual2024;
      }
    });
    return { ...categoryActuals, grand };
  }, [expenseDataState]);

  // Helper functions
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }, []);

  const getBudgetYear = useCallback(() => {
    return expenseDataState?.config?.year?.toString() || new Date().getFullYear().toString();
  }, [expenseDataState]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    await fetchExpenseData();
    if (refetch) {
      refetch();
    }
  }, [fetchExpenseData, refetch]);

  // Print functionality
  const { printElement } = usePrintout({
    title: `BUTIRAN ANGGARAN PERBELANJAAN ${getBudgetYear() || '2025'}`,
    orientation: 'landscape',
    paperSize: 'a4',
    margins: { top: 0.3, right: 0.3, bottom: 0.3, left: 0.3 },
    customPrintStyles: 'table * { font-size: 8px !important; }'
  });

  const handlePrint = useCallback(() => {
    printElement('.overflow-x-auto');
  }, [printElement, getBudgetYear]);

  // Get all months array
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Helper function to render a category section
  const renderCategorySection = useCallback((title, data, subCategories = [], bgColor = "bg-red-100") => {
    if (!data) return null;
    return {
      title,
      data,
      subCategories,
      bgColor
    };
  }, []);

  // Get all category sections
  const categorySections = useMemo(() => {
    if (!expenseDataState) return [];
    const keys = Object.keys(expenseDataState).filter(k => k !== 'config');
    const colorList = [
      'bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-green-200',
      'bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-gray-200', 'bg-teal-200', 'bg-indigo-200'
    ];
    return keys.map((key, idx) => {
      const cat = expenseDataState[key];
      return renderCategorySection(
        cat.title || key,
        cat,
        cat.subCategories || [],
        colorList[idx % colorList.length]
      );
    });
  }, [expenseDataState, renderCategorySection]);

  return {
    // Data
    expenseData: expenseDataState,
    expenseTotal,
    budgetTotal,
    actualTotal,
    categorySections,
    
    // Helpers
    formatCurrency,
    getBudgetYear,
    getCategoryTotal,
    months,
    monthNames,
    renderCategorySection,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // States
    isLoading,
    hasError,
    
    // Config
    config: expenseDataState?.config
  };
};
