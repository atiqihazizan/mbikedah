import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';
import budgetData from '../assets/data/budgetSummary.json';

export const useBudgetSummary = (dashboardData, refetch) => {
  const [budgetDataState, setBudgetDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Configuration for calculations
  const SPECIAL_SAVINGS_RATE = 0.03; // 3%
  const FIXED_DEPOSIT_AMOUNT = 1000000.00; // RM 1,000,000

  // Simulate API call for budget data
  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use data from JSON file
      setBudgetDataState(budgetData);
      
    } catch (error) {
      console.error('Error fetching budget data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount and when refetch is called
  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  // Memoized revenue and expenditure data
  const revenueData = useMemo(() => {
    return budgetDataState?.revenueData || [];
  }, [budgetDataState]);

  const expenditureData = useMemo(() => {
    return budgetDataState?.expenditureData || [];
  }, [budgetDataState]);

  // Calculate totals
  const revenueTotal = useMemo(() => {
    if (!revenueData.length) return null;
    
    return {
      actual2023: revenueData.reduce((sum, item) => sum + (item.actual2023 || 0), 0),
      actual2024: revenueData.reduce((sum, item) => sum + (item.actual2024 || 0), 0),
      budget2023: revenueData.reduce((sum, item) => sum + (item.budget2023 || 0), 0),
      budget2024: revenueData.reduce((sum, item) => sum + (item.budget2024 || 0), 0),
      budget2025: revenueData.reduce((sum, item) => sum + (item.budget2025 || 0), 0)
    };
  }, [revenueData]);

  const expenditureTotal = useMemo(() => {
    if (!expenditureData.length) return null;
    
    return {
      actual2023: expenditureData.reduce((sum, item) => sum + (item.actual2023 || 0), 0),
      actual2024: expenditureData.reduce((sum, item) => sum + (item.actual2024 || 0), 0),
      budget2023: expenditureData.reduce((sum, item) => sum + (item.budget2023 || 0), 0),
      budget2024: expenditureData.reduce((sum, item) => sum + (item.budget2024 || 0), 0),
      budget2025: expenditureData.reduce((sum, item) => sum + (item.budget2025 || 0), 0)
    };
  }, [expenditureData]);

  // Calculate net position (revenue - expenditure)
  const netPosition = useMemo(() => {
    if (!revenueTotal || !expenditureTotal) return null;
    
    return {
      actual2023: revenueTotal.actual2023 - expenditureTotal.actual2023,
      actual2024: revenueTotal.actual2024 - expenditureTotal.actual2024,
      budget2023: revenueTotal.budget2023 - expenditureTotal.budget2023,
      budget2024: revenueTotal.budget2024 - expenditureTotal.budget2024,
      budget2025: revenueTotal.budget2025 - expenditureTotal.budget2025
    };
  }, [revenueTotal, expenditureTotal]);

  // Calculate special savings (3% of total revenue)
  const specialSavings = useMemo(() => {
    if (!revenueTotal || !budgetDataState?.config) return null;

    const rate = budgetDataState.config.specialSavingsRate || SPECIAL_SAVINGS_RATE;
    
    return {
      actual2023: revenueTotal.actual2023 * rate,
      actual2024: revenueTotal.actual2024 * rate,
      budget2023: revenueTotal.budget2023 * rate,
      budget2024: revenueTotal.budget2024 * rate,
      budget2025: revenueTotal.budget2025 * rate
    };
  }, [revenueTotal, budgetDataState]);

  // Get opening balances
  const openingBalances = useMemo(() => {
    return budgetDataState?.openingBalances || null;
  }, [budgetDataState]);

  // Get fixed deposit amounts
  const fixedDepositAmounts = useMemo(() => {
    return budgetDataState?.config?.fixedDepositAmounts || null;
  }, [budgetDataState]);

  // Calculate surplus/deficit after opening balance
  const surplusAfterOpening = useMemo(() => {
    if (!netPosition || !openingBalances) return null;
    
    return {
      actual2023: netPosition.actual2023 + openingBalances.actual2023,
      actual2024: netPosition.actual2024 + openingBalances.actual2024,
      budget2023: netPosition.budget2023 + openingBalances.budget2023,
      budget2024: netPosition.budget2024 + openingBalances.budget2024,
      budget2025: netPosition.budget2025 + openingBalances.budget2025
    };
  }, [netPosition, openingBalances]);

  // Calculate final surplus/deficit after all deductions
  const finalSurplus = useMemo(() => {
    if (!surplusAfterOpening || !specialSavings || !fixedDepositAmounts) return null;
    
    return {
      actual2023: surplusAfterOpening.actual2023 - specialSavings.actual2023 - fixedDepositAmounts.actual2023,
      actual2024: surplusAfterOpening.actual2024 - specialSavings.actual2024 - fixedDepositAmounts.actual2024,
      budget2023: surplusAfterOpening.budget2023 - specialSavings.budget2023 - fixedDepositAmounts.budget2023,
      budget2024: surplusAfterOpening.budget2024 - specialSavings.budget2024 - fixedDepositAmounts.budget2024,
      budget2025: surplusAfterOpening.budget2025 - specialSavings.budget2025 - fixedDepositAmounts.budget2025
    };
  }, [surplusAfterOpening, specialSavings, fixedDepositAmounts]);

  // Dynamic additional budget lines with calculated values
  const additionalBudgetLines = useMemo(() => {
    if (!netPosition || !openingBalances || !specialSavings || !fixedDepositAmounts || !surplusAfterOpening || !finalSurplus) {
      return [];
    }

    return [
      // Net Position (Revenue - Expenditure)
      {
        id: "net_position",
        description: "LEBIHAN /(KURANGAN)",
        type: "net_calculation",
        actual2023: netPosition.actual2023,
        actual2024: netPosition.actual2024,
        budget2023: netPosition.budget2023,
        budget2024: netPosition.budget2024,
        budget2025: netPosition.budget2025,
        className: `font-bold ${netPosition.budget2025 >= 0 ? 'bg-green-200 print:bg-green-200' : 'bg-red-200 print:bg-red-200'}`,
        formula: "Jumlah Pendapatan - Jumlah Perbelanjaan"
      },
      // Opening Balance
      {
        id: "opening_balance",
        description: "BAKI AWAL",
        type: "opening_balance",
        actual2023: openingBalances.actual2023,
        actual2024: openingBalances.actual2024,
        budget2023: openingBalances.budget2023,
        budget2024: openingBalances.budget2024,
        budget2025: openingBalances.budget2025,
        className: "bg-gray-100 print:bg-gray-100 font-medium",
        formula: "Baki akhir tahun sebelumnya"
      },
      // Surplus after adding opening balance
      {
        id: "surplus_after_opening",
        description: "LEBIHAN /(KURANGAN) SELEPAS BAKI AWAL",
        type: "interim_calculation",
        actual2023: surplusAfterOpening.actual2023,
        actual2024: surplusAfterOpening.actual2024,
        budget2023: surplusAfterOpening.budget2023,
        budget2024: surplusAfterOpening.budget2024,
        budget2025: surplusAfterOpening.budget2025,
        className: "bg-blue-100 print:bg-blue-100 font-medium",
        formula: "Lebihan/(Kurangan) + Baki Awal"
      },
      // Special Savings (3%)
      {
        id: "special_savings",
        description: `(-)TABUNGAN KHAS (${(SPECIAL_SAVINGS_RATE * 100)}%)`,
        type: "deduction",
        actual2023: specialSavings.actual2023,
        actual2024: specialSavings.actual2024,
        budget2023: specialSavings.budget2023,
        budget2024: specialSavings.budget2024,
        budget2025: specialSavings.budget2025,
        className: "bg-yellow-100 print:bg-yellow-100 font-medium",
        formula: `${(SPECIAL_SAVINGS_RATE * 100)}% dari Jumlah Pendapatan`
      },
      // Fixed Deposit
      {
        id: "fixed_deposit",
        description: "DEPOSIT SIMPANAN TETAP",
        type: "fixed_amount",
        actual2023: fixedDepositAmounts.actual2023,
        actual2024: fixedDepositAmounts.actual2024,
        budget2023: fixedDepositAmounts.budget2023,
        budget2024: fixedDepositAmounts.budget2024,
        budget2025: fixedDepositAmounts.budget2025,
        className: "bg-purple-100 print:bg-purple-100 font-medium",
        formula: "Jumlah tetap untuk simpanan"
      },
      // Final Surplus/Deficit
      {
        id: "final_surplus",
        description: "LEBIHAN /(KURANGAN) SELEPAS TABUNGAN",
        type: "final_calculation",
        actual2023: finalSurplus.actual2023,
        actual2024: finalSurplus.actual2024,
        budget2023: finalSurplus.budget2023,
        budget2024: finalSurplus.budget2024,
        budget2025: finalSurplus.budget2025,
        className: `bg-indigo-200 font-bold print:bg-indigo-200 ${finalSurplus.budget2025 >= 0 ? 'text-green-800' : 'text-red-800'}`,
        formula: "Lebihan Selepas Baki Awal - Tabungan Khas - Deposit Simpanan"
      }
    ];
  }, [netPosition, openingBalances, specialSavings, fixedDepositAmounts, surplusAfterOpening, finalSurplus]);

  // Helper function to format currency
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }, []);

  // Get budget year
  const getBudgetYear = useCallback(() => {
    return budgetDataState?.config?.year?.toString() || new Date().getFullYear().toString();
  }, [budgetDataState]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    await fetchBudgetData();
    if (refetch) {
      refetch();
    }
  }, [fetchBudgetData, refetch]);

  // Use the hook at the top level of your custom hook
  const { printElement } = usePrintout({
    title: `Ringkasan Bajet ${getBudgetYear() || '2025'}`, // Add fallback
    orientation: 'landscape',
    paperSize: 'a4', 
    margins: { top: 0.5, right: 0.6, bottom: 0.2, left: 0.6 },
    customPrintStyles: `
    table * { font-size: 10px !important; }
    `
  });

  // Then use the printElement function in your callback
  const handlePrint = useCallback(() => {
    printElement('.overflow-x-auto');
  }, [printElement, getBudgetYear]); // Add any dependencies that are used

  // Get calculation summary for debugging/display
  const getCalculationSummary = useCallback(() => {
    if (!revenueTotal || !expenditureTotal) return null;

    return {
      revenue: revenueTotal,
      expenditure: expenditureTotal,
      netPosition,
      openingBalances,
      specialSavings: {
        ...specialSavings,
        rate: SPECIAL_SAVINGS_RATE,
        ratePercentage: SPECIAL_SAVINGS_RATE * 100
      },
      fixedDepositAmounts,
      surplusAfterOpening,
      finalSurplus,
      formulas: {
        netPosition: "Jumlah Pendapatan - Jumlah Perbelanjaan",
        surplusAfterOpening: "Lebihan/(Kurangan) + Baki Awal",
        specialSavings: `${SPECIAL_SAVINGS_RATE * 100}% × Jumlah Pendapatan`,
        finalSurplus: "Lebihan Selepas Baki Awal - Tabungan Khas - Deposit Simpanan"
      }
    };
  }, [revenueTotal, expenditureTotal, netPosition, openingBalances, specialSavings, fixedDepositAmounts, surplusAfterOpening, finalSurplus]);

  // Return all the data and functions needed by the component
  return {
    // Data values
    revenueData,
    expenditureData,
    revenueTotal,
    expenditureTotal,
    netPosition,
    additionalBudgetLines,
    
    // Calculated values
    openingBalances,
    specialSavings,
    fixedDepositAmounts,
    surplusAfterOpening,
    finalSurplus,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // Helper functions
    formatCurrency,
    getBudgetYear,
    getCalculationSummary,
    
    // Loading states
    isLoading,
    hasError,
    
    // Configuration
    config: {
      specialSavingsRate: SPECIAL_SAVINGS_RATE,
      fixedDepositAmount: FIXED_DEPOSIT_AMOUNT
    },
    
    // Raw data (for debugging)
    rawBudgetData: budgetDataState
  };
};