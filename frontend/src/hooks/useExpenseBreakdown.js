import { useState, useEffect, useMemo } from 'react';
import apiClient from '../utils/axios';

const useExpenseBreakdown = () => {
  const [expenseDataState, setExpenseDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/budgets/reports/expense-breakdown');
      if (response.success && response.data) {
        setExpenseDataState(response.data);
      } else {
        console.error('Response validation failed:', { success: response.success, hasData: !!response.data });
        throw new Error('Failed to load expense breakdown data');
      }

    } catch (err) {
      console.error('Error loading expense breakdown data:', err);
      setError(err.message || 'Ralat memuatkan data pecahan perbelanjaan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, []);

  // Helper function to get category total
  const getCategoryTotal = useMemo(() => {
    return (categoryData) => {
      if (!categoryData) return { total: 0 };
      
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const total = { total: 0 };
      
      months.forEach(month => {
        total[month] = categoryData.monthly?.[month] || 0;
        total.total += total[month];
      });
      
      return total;
    };
  }, []);

  // Calculate expense totals
  const expenseTotal = useMemo(() => {
    if (!expenseDataState?.categorySections) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    const categoryTotals = {};
    
    expenseDataState.categorySections.forEach((section, index) => {
      const categoryName = section.title || `category_${index}`;
      const categoryTotal = getCategoryTotal(section.data);
      categoryTotals[categoryName] = categoryTotal;
      
      months.forEach(month => {
        grandTotal[month] = (grandTotal[month] || 0) + (categoryTotal[month] || 0);
      });
      grandTotal.total += categoryTotal.total;
    });
    
    return {
      ...categoryTotals,
      grand: grandTotal
    };
  }, [expenseDataState, getCategoryTotal]);

  // Calculate budget totals
  const budgetTotal = useMemo(() => {
    if (!expenseDataState?.categorySections) return null;
    
    const categoryBudgets = {};
    let grandTotal = 0;
    
    expenseDataState.categorySections.forEach((section, index) => {
      const categoryName = section.title || `category_${index}`;
      const categoryBudget = section.data?.budget2025 || 0;
      categoryBudgets[categoryName] = categoryBudget;
      grandTotal += categoryBudget;
    });
    
    return {
      ...categoryBudgets,
      grand: grandTotal
    };
  }, [expenseDataState]);

  // Calculate actual totals
  const actualTotal = useMemo(() => {
    if (!expenseDataState?.categorySections) return null;
    
    const categoryActuals = {};
    let grandTotal = 0;
    
    expenseDataState.categorySections.forEach((section, index) => {
      const categoryName = section.title || `category_${index}`;
      const categoryActual = section.data?.actual2024 || 0;
      categoryActuals[categoryName] = categoryActual;
      grandTotal += categoryActual;
    });
    
    return {
      ...categoryActuals,
      grand: grandTotal
    };
  }, [expenseDataState]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const renderCategorySection = (title, data, subCategories = [], bgColor = 'bg-gray-200') => {
    if (!data) return null;
    
    // Recursive function to preserve nested structure
    const processSubCategories = (subs) => {
      if (!subs || subs.length === 0) return [];
      
      return subs.map(sub => ({
        code: sub.code,
        description: sub.description,
        actual2024: sub.actual2024,
        budget2024: sub.budget2024,
        budget2025: sub.budget2025,
        monthly: sub.monthly || {},
        subCategories: processSubCategories(sub.subCategories || [])
      }));
    };
    
    return {
      title,
      bgColor,
      data: {
        code: data.code,
        description: data.description,
        actual2024: data.actual2024,
        budget2024: data.budget2024,
        budget2025: data.budget2025,
        monthly: data.monthly || {}
      },
      subCategories: processSubCategories(subCategories)
    };
  };

  // Build category sections
  const categorySections = useMemo(() => {
    if (!expenseDataState?.categorySections) return [];
    
    const sections = expenseDataState.categorySections.map((section, index) => {
      const bgColors = ['bg-red-200', 'bg-blue-200', 'bg-yellow-200', 'bg-purple-200', 'bg-green-200', 'bg-indigo-200'];
      const bgColor = bgColors[index % bgColors.length];
      
      const processedSection = renderCategorySection(
        section.title || `Category ${index + 1}`,
        section.data,
        section.subCategories || [],
        section.bgColor || bgColor
      );
      
      return processedSection;
    });
    
    return sections;
  }, [expenseDataState]);

  return {
    expenseData: expenseDataState,
    expenseTotal,
    budgetTotal,
    actualTotal,
    categorySections,
    formatCurrency,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      setExpenseDataState(null);
      // Actually fetch new data
      fetchExpenseData();
    }
  };
};

export default useExpenseBreakdown;
