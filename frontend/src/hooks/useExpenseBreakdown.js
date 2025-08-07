import { useState, useEffect, useMemo } from 'react';
import apiClient from '../utils/axios';

const useExpenseBreakdown = () => {
  const [expenseDataState, setExpenseDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/budgets/reports/expense-breakdown');
        if (response.success && response.data) {
          setExpenseDataState(response.data);
        } else {
          throw new Error('Failed to load expense breakdown data');
        }

      } catch (err) {
        console.error('Error loading expense breakdown data:', err);
        setError(err.message || 'Ralat memuatkan data pecahan perbelanjaan');
      } finally {
        setLoading(false);
      }
    };

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
    if (!expenseDataState) return null;
    
    const perkhidmatanAmTotal = getCategoryTotal(expenseDataState.perkhidmatanAm);
    const perkhidmatanKhasTotal = getCategoryTotal(expenseDataState.perkhidmatanKhas);
    const perkhidmatanLainTotal = getCategoryTotal(expenseDataState.perkhidmatanLain);
    const perkhidmatanKewanganTotal = getCategoryTotal(expenseDataState.perkhidmatanKewangan);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (perkhidmatanAmTotal[month] || 0) + (perkhidmatanKhasTotal[month] || 0) + 
                         (perkhidmatanLainTotal[month] || 0) + (perkhidmatanKewanganTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      perkhidmatanAm: perkhidmatanAmTotal,
      perkhidmatanKhas: perkhidmatanKhasTotal,
      perkhidmatanLain: perkhidmatanLainTotal,
      perkhidmatanKewangan: perkhidmatanKewanganTotal,
      grand: grandTotal
    };
  }, [expenseDataState, getCategoryTotal]);

  // Calculate budget totals
  const budgetTotal = useMemo(() => {
    if (!expenseDataState) return null;
    
    const perkhidmatanAmBudget = expenseDataState.perkhidmatanAm?.budget2025 || 0;
    const perkhidmatanKhasBudget = expenseDataState.perkhidmatanKhas?.budget2025 || 0;
    const perkhidmatanLainBudget = expenseDataState.perkhidmatanLain?.budget2025 || 0;
    const perkhidmatanKewanganBudget = expenseDataState.perkhidmatanKewangan?.budget2025 || 0;
    
    return {
      perkhidmatanAm: perkhidmatanAmBudget,
      perkhidmatanKhas: perkhidmatanKhasBudget,
      perkhidmatanLain: perkhidmatanLainBudget,
      perkhidmatanKewangan: perkhidmatanKewanganBudget,
      grand: perkhidmatanAmBudget + perkhidmatanKhasBudget + perkhidmatanLainBudget + perkhidmatanKewanganBudget
    };
  }, [expenseDataState]);

  // Calculate actual totals
  const actualTotal = useMemo(() => {
    if (!expenseDataState) return null;
    
    const perkhidmatanAmActual = expenseDataState.perkhidmatanAm?.actual2024 || 0;
    const perkhidmatanKhasActual = expenseDataState.perkhidmatanKhas?.actual2024 || 0;
    const perkhidmatanLainActual = expenseDataState.perkhidmatanLain?.actual2024 || 0;
    const perkhidmatanKewanganActual = expenseDataState.perkhidmatanKewangan?.actual2024 || 0;
    
    return {
      perkhidmatanAm: perkhidmatanAmActual,
      perkhidmatanKhas: perkhidmatanKhasActual,
      perkhidmatanLain: perkhidmatanLainActual,
      perkhidmatanKewangan: perkhidmatanKewanganActual,
      grand: perkhidmatanAmActual + perkhidmatanKhasActual + perkhidmatanLainActual + perkhidmatanKewanganActual
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
      subCategories: subCategories.map(sub => ({
        code: sub.code,
        description: sub.description,
        actual2024: sub.actual2024,
        budget2024: sub.budget2024,
        budget2025: sub.budget2025,
        monthly: sub.monthly || {},
        details: sub.details || []
      }))
    };
  };

  // Build category sections
  const categorySections = useMemo(() => {
    if (!expenseDataState) return [];
    
    return [
      renderCategorySection(
        "PERKHIDMATAN AM", 
        expenseDataState.perkhidmatanAm, 
        expenseDataState.perkhidmatanAm?.subCategories || [],
        "bg-red-200"
      ),
      renderCategorySection(
        "PERKHIDMATAN KHAS", 
        expenseDataState.perkhidmatanKhas, 
        expenseDataState.perkhidmatanKhas?.subCategories || [],
        "bg-blue-200"
      ),
      renderCategorySection(
        "PERKHIDMATAN LAIN", 
        expenseDataState.perkhidmatanLain, 
        expenseDataState.perkhidmatanLain?.subCategories || [],
        "bg-yellow-200"
      ),
      renderCategorySection(
        "PERKHIDMATAN KEWANGAN", 
        expenseDataState.perkhidmatanKewangan, 
        expenseDataState.perkhidmatanKewangan?.subCategories || [],
        "bg-purple-200"
      )
    ].filter(Boolean);
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
    }
  };
};

export default useExpenseBreakdown;
