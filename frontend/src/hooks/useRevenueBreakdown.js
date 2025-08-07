import { useState, useEffect, useMemo } from 'react';
import apiClient from '../utils/axios';
import revenueData from '../assets/data/revenueBreakdown.json';

const useRevenueBreakdown = () => {
  const [revenueDataState, setRevenueDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // 'api' or 'json'

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try API first
        try {
          const response = await apiClient.get('/budgets/reports/revenue-breakdown');
          if (response.success && response.data) {
            setRevenueDataState(response.data);
            setDataSource('api');
            console.log('Revenue breakdown data loaded from API');
            return;
          }
        } catch (apiError) {
          console.warn('API failed, falling back to JSON:', apiError.message);
        }

        // Fallback to JSON file
        setRevenueDataState(revenueData);
        setDataSource('json');
        console.log('Revenue breakdown data loaded from JSON fallback');

      } catch (err) {
        console.error('Error loading revenue breakdown data:', err);
        setError(err.message || 'Ralat memuatkan data pecahan hasil');
      } finally {
        setLoading(false);
      }
    };

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

  // Calculate revenue totals
  const revenueTotal = useMemo(() => {
    if (!revenueDataState) return null;
    
    const pendapatanHasilTotal = getCategoryTotal(revenueDataState.pendapatanHasil);
    const pendapatanLainLainTotal = getCategoryTotal(revenueDataState.pendapatanLainLain);
    const pendapatanSumberDanaTotal = getCategoryTotal(revenueDataState.pendapatanSumberDana);
    const pendapatanLuarJangkaTotal = getCategoryTotal(revenueDataState.pendapatanLuarJangka);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (pendapatanHasilTotal[month] || 0) + (pendapatanLainLainTotal[month] || 0) + 
                         (pendapatanSumberDanaTotal[month] || 0) + (pendapatanLuarJangkaTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      pendapatanHasil: pendapatanHasilTotal,
      pendapatanLainLain: pendapatanLainLainTotal,
      pendapatanSumberDana: pendapatanSumberDanaTotal,
      pendapatanLuarJangka: pendapatanLuarJangkaTotal,
      grand: grandTotal
    };
  }, [revenueDataState, getCategoryTotal]);

  // Calculate budget totals
  const budgetTotal = useMemo(() => {
    if (!revenueDataState) return null;
    
    const pendapatanHasilBudget = revenueDataState.pendapatanHasil?.budget2025 || 0;
    const pendapatanLainLainBudget = revenueDataState.pendapatanLainLain?.budget2025 || 0;
    const pendapatanSumberDanaBudget = revenueDataState.pendapatanSumberDana?.budget2025 || 0;
    const pendapatanLuarJangkaBudget = revenueDataState.pendapatanLuarJangka?.budget2025 || 0;
    
    return {
      pendapatanHasil: pendapatanHasilBudget,
      pendapatanLainLain: pendapatanLainLainBudget,
      pendapatanSumberDana: pendapatanSumberDanaBudget,
      pendapatanLuarJangka: pendapatanLuarJangkaBudget,
      grand: pendapatanHasilBudget + pendapatanLainLainBudget + pendapatanSumberDanaBudget + pendapatanLuarJangkaBudget
    };
  }, [revenueDataState]);

  // Calculate actual totals
  const actualTotal = useMemo(() => {
    if (!revenueDataState) return null;
    
    const pendapatanHasilActual = revenueDataState.pendapatanHasil?.actual2024 || 0;
    const pendapatanLainLainActual = revenueDataState.pendapatanLainLain?.actual2024 || 0;
    const pendapatanSumberDanaActual = revenueDataState.pendapatanSumberDana?.actual2024 || 0;
    const pendapatanLuarJangkaActual = revenueDataState.pendapatanLuarJangka?.actual2024 || 0;
    
    return {
      pendapatanHasil: pendapatanHasilActual,
      pendapatanLainLain: pendapatanLainLainActual,
      pendapatanSumberDana: pendapatanSumberDanaActual,
      pendapatanLuarJangka: pendapatanLuarJangkaActual,
      grand: pendapatanHasilActual + pendapatanLainLainActual + pendapatanSumberDanaActual + pendapatanLuarJangkaActual
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
    if (!revenueDataState) return [];
    
    return [
      renderCategorySection(
        "PENDAPATAN HASIL", 
        revenueDataState.pendapatanHasil, 
        revenueDataState.pendapatanHasil?.subCategories || [],
        "bg-green-200"
      ),
      renderCategorySection(
        "PENDAPATAN LAIN-LAIN (BUKAN HASIL)", 
        revenueDataState.pendapatanLainLain, 
        revenueDataState.pendapatanLainLain?.subCategories || [],
        "bg-blue-200"
      ),
      renderCategorySection(
        "PENDAPATAN SUMBER DANA", 
        revenueDataState.pendapatanSumberDana, 
        revenueDataState.pendapatanSumberDana?.subCategories || [],
        "bg-yellow-200"
      ),
      renderCategorySection(
        "PENDAPATAN LUAR JANGKA", 
        revenueDataState.pendapatanLuarJangka, 
        revenueDataState.pendapatanLuarJangka?.subCategories || [],
        "bg-purple-200"
      )
    ].filter(Boolean);
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
    dataSource,
    refetch: () => {
      setLoading(true);
      setError(null);
      setRevenueDataState(null);
    }
  };
};

export default useRevenueBreakdown;
