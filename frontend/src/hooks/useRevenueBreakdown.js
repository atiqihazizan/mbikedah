import { useState, useEffect, useMemo } from 'react';
import apiClient from '../utils/axios';

const useRevenueBreakdown = () => {
  const [revenueDataState, setRevenueDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/budgets/reports/revenue-breakdown');
      if (response.success && response.data) {
        setRevenueDataState(response.data);
      } else {
        throw new Error('Failed to load revenue breakdown data');
      }

    } catch (err) {
      console.error('Error loading revenue breakdown data:', err);
      setError(err.message || 'Ralat memuatkan data pecahan hasil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
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

  // Calculate revenue totals from new API structure
  const revenueTotal = useMemo(() => {
    if (!revenueDataState?.categorySections) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    // Initialize totals for each category
    const categoryTotals = {};
    
    revenueDataState.categorySections.forEach(section => {
      const categoryName = section.title;
      categoryTotals[categoryName] = getCategoryTotal(section.data);
      
      months.forEach(month => {
        grandTotal[month] = (grandTotal[month] || 0) + (categoryTotals[categoryName][month] || 0);
      });
      grandTotal.total += categoryTotals[categoryName].total;
    });
    
    return {
      ...categoryTotals,
      grand: grandTotal
    };
  }, [revenueDataState, getCategoryTotal]);

  // Calculate budget totals from new API structure
  const budgetTotal = useMemo(() => {
    if (!revenueDataState?.categorySections) return null;
    
    const categoryTotals = {};
    let grandTotal = 0;
    
    revenueDataState.categorySections.forEach(section => {
      const categoryName = section.title;
      const budget = section.data.budget2025 || 0;
      categoryTotals[categoryName] = budget;
      grandTotal += budget;
    });
    
    return {
      ...categoryTotals,
      grand: grandTotal
    };
  }, [revenueDataState]);

  // Calculate actual totals from new API structure
  const actualTotal = useMemo(() => {
    if (!revenueDataState?.categorySections) return null;
    
    const categoryTotals = {};
    let grandTotal = 0;
    
    revenueDataState.categorySections.forEach(section => {
      const categoryName = section.title;
      const actual = section.data.actual2024 || 0;
      categoryTotals[categoryName] = actual;
      grandTotal += actual;
    });
    
    return {
      ...categoryTotals,
      grand: grandTotal
    };
  }, [revenueDataState]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Build category sections from new API structure
  const categorySections = useMemo(() => {
    if (!revenueDataState?.categorySections) {
      return [];
    }
    
    // Map the API response directly to the expected format
    return revenueDataState.categorySections.map(section => ({
      title: section.title,
      bgColor: section.bgColor,
      data: {
        code: section.data.code,
        description: section.data.description,
        actual2024: section.data.actual2024,
        budget2024: section.data.budget2024,
        budget2025: section.data.budget2025,
        monthly: section.data.monthly || {}
      },
      subCategories: section.subCategories || []
    }));
  }, [revenueDataState]);

  return {
    revenueData: revenueDataState,
    revenueTotal,
    budgetTotal,
    actualTotal,
    categorySections,
    formatCurrency,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      setRevenueDataState(null);
      // Call the fetch function again
      fetchRevenueData();
    }
  };
};

export default useRevenueBreakdown;
