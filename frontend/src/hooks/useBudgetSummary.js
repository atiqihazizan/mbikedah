import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';

export const useBudgetSummary = (dashboardData, refetch) => {
  const [budgetData, setBudgetData] = useState(null);
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
      
      // Sample API response structure (only base data, calculations will be done dynamically)
      const apiResponse = {
        revenue: [
          {
            id: 1,
            code: "5000/000",
            description: "PENDAPATAN (HASIL MBI)",
            category: "revenue",
            actual2023: 5667217.60,
            actual2024: 3445439.22,
            budget2023: 18247472.24,
            budget2024: 9228879.13,
            budget2025: 15581992.95,
          },
          {
            id: 2,
            code: "5100/000", 
            description: "PENDAPATAN LAIN-LAIN (BUKAN HASIL MBI)",
            category: "revenue",
            actual2023: 17089117.83,
            actual2024: 6148232.66,
            budget2023: 19095500.14,
            budget2024: 12582644.69,
            budget2025: 18634028.01,
          },
          {
            id: 3,
            code: "5200/000",
            description: "PENDAPATAN SUMBER DANA", 
            category: "revenue",
            actual2023: 530111.15,
            actual2024: 2030111.15,
            budget2023: 530115.15,
            budget2024: 2030111.15,
            budget2025: 530111.15,
          },
          {
            id: 4,
            code: "5300/000",
            description: "PENDAPATAN LUAR JANGKA",
            category: "revenue", 
            actual2023: 0,
            actual2024: 1950000.00,
            budget2023: 0,
            budget2024: 4277347.50,
            budget2025: 1440540.00,
          }
        ],
        expenditure: [
          {
            id: 5,
            code: "2000/000",
            description: "ASET BUKAN SEMASA",
            category: "expenditure",
            actual2023: 1508163.00,
            actual2024: 8430.00,
            budget2023: 2525377.40,
            budget2024: 682881.10,
            budget2025: 1247391.30,
          },
          {
            id: 6,
            code: "3000/000",
            description: "ASET SEMASA",
            category: "expenditure",
            actual2023: 5055990.17,
            actual2024: 2451116.34,
            budget2023: 2395821.08,
            budget2024: 3325000.00,
            budget2025: 4042372.28,
          },
          {
            id: 7,
            code: "4000/000",
            description: "BAYARAN HUTANG DAN FAEDAH",
            category: "expenditure",
            actual2023: 4945565.35,
            actual2024: 2468524.79,
            budget2023: 11514164.72,
            budget2024: 5224439.39,
            budget2025: 10423443.09,
          },
          {
            id: 8,
            code: "9000/000",
            description: "BELANJA OPERASI",
            category: "expenditure",
            actual2023: 1510853.20,
            actual2024: 1121676.20,
            budget2023: 3103346.10,
            budget2024: 2742213.00,
            budget2025: 4997518.00,
          },
          {
            id: 9,
            code: "9100/000",
            description: "EMOLUMEN & FAEDAH KAKITANGAN",
            category: "expenditure",
            actual2023: 5399426.21,
            actual2024: 4809352.80,
            budget2023: 6963512.55,
            budget2024: 7878772.00,
            budget2025: 7280924.00,
          },
          {
            id: 10,
            code: "9200/000",
            description: "PERKHIDMATAN DAN PERBELANJAAN PEJABAT",
            category: "expenditure",
            actual2023: 507134.46,
            actual2024: 393070.77,
            budget2023: 2986279.04,
            budget2024: 1414798.00,
            budget2025: 1270618.00,
          },
          {
            id: 11,
            code: "9300/000",
            description: "SUMBANGAN DAN TAJAAN",
            category: "expenditure",
            actual2023: 602037.50,
            actual2024: 553446.20,
            budget2023: 402000.00,
            budget2024: 586000.00,
            budget2025: 1016000.00,
          },
          {
            id: 12,
            code: "9400/000",
            description: "PERBELANJAAN KHAS",
            category: "expenditure",
            actual2023: 3002978.90,
            actual2024: 1947496.43,
            budget2023: 7282111.15,
            budget2024: 2415055.58,
            budget2025: 2639639.15,
          },
          {
            id: 13,
            code: "9500/000",
            description: "PERBELANJAAN LUAR JANGKA",
            category: "expenditure",
            actual2023: 0,
            actual2024: 900000.00,
            budget2023: 0,
            budget2024: 2681838.04,
            budget2025: 1238156.60,
          },
          {
            id: 14,
            code: "9600/000",
            description: "PERBELANJAAN AM",
            category: "expenditure",
            actual2023: 0,
            actual2024: 0,
            budget2023: 0,
            budget2024: 0,
            budget2025: 0,
          }
        ],
        // Opening balances - these could come from previous year calculations or database
        openingBalances: {
          actual2023: 1720760.17,
          actual2024: 2101260.38, // This should be calculated from previous year's final balance
          budget2023: 602617.95,
          budget2024: 2475057.96,
          budget2025: 1021929.88
        },
        // Configuration for special calculations
        config: {
          specialSavingsRate: SPECIAL_SAVINGS_RATE,
          fixedDepositAmounts: {
            actual2023: 400000.00,
            actual2024: 1000000.00,
            budget2023: 1000000.00,
            budget2024: 1000000.00,
            budget2025: FIXED_DEPOSIT_AMOUNT
          }
        },
        meta: {
          year: 2025,
          currency: "RM",
          lastUpdated: "2024-12-01T00:00:00Z",
          fiscalYear: "2025"
        }
      };

      setBudgetData(apiResponse);
      
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
    return budgetData?.revenue || [];
  }, [budgetData]);

  const expenditureData = useMemo(() => {
    return budgetData?.expenditure || [];
  }, [budgetData]);

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
    if (!revenueTotal || !budgetData?.config) return null;

    const rate = budgetData.config.specialSavingsRate;
    
    return {
      actual2023: revenueTotal.actual2023 * rate,
      actual2024: revenueTotal.actual2024 * rate,
      budget2023: revenueTotal.budget2023 * rate,
      budget2024: revenueTotal.budget2024 * rate,
      budget2025: revenueTotal.budget2025 * rate
    };
  }, [revenueTotal, budgetData]);

  // Get opening balances
  const openingBalances = useMemo(() => {
    return budgetData?.openingBalances || null;
  }, [budgetData]);

  // Get fixed deposit amounts
  const fixedDepositAmounts = useMemo(() => {
    return budgetData?.config?.fixedDepositAmounts || null;
  }, [budgetData]);

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
    return budgetData?.meta?.year?.toString() || new Date().getFullYear().toString();
  }, [budgetData]);

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
    rawBudgetData: budgetData
  };
};