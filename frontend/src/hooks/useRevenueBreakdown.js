import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';
import revenueData from '../assets/data/revenueBreakdown.json';

export const useRevenueBreakdown = (dashboardData, refetch) => {
  const [revenueDataState, setRevenueDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simulate API call for revenue breakdown data
  const fetchRevenueData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use data from JSON file
      setRevenueDataState(revenueData);
      
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

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

  // Calculate totals for all revenue categories
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
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }, []);

  const getBudgetYear = useCallback(() => {
    return revenueDataState?.config?.year?.toString() || new Date().getFullYear().toString();
  }, [revenueDataState]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    await fetchRevenueData();
    if (refetch) {
      refetch();
    }
  }, [fetchRevenueData, refetch]);

  // Print functionality
  const { printElement } = usePrintout({
    title: `BUTIRAN ANGGARAN PENERIMAAN HASIL ${getBudgetYear() || '2025'}`,
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
  const renderCategorySection = useCallback((title, data, subCategories = [], bgColor = "bg-green-100") => {
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
  }, [revenueDataState, renderCategorySection]);

  return {
    // Data
    revenueData: revenueDataState,
    revenueTotal,
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
    config: revenueDataState?.config
  };
};
