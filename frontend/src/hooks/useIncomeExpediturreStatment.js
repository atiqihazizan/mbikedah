import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';
import statementData from '../assets/data/incomeExpenditureStatement.json';

export const useIncomeExpenditureStatement = (dashboardData, refetch) => {
  const [statementDataState, setStatementDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Configuration
  const SPECIAL_SAVINGS_RATE = 0.03; // 3%
  const OPENING_BALANCE = 1021929.88;

  // Simulate API call for statement data
  const fetchStatementData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use data from JSON file
      setStatementDataState(statementData);
      
    } catch (error) {
      console.error('Error fetching statement data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchStatementData();
  }, [fetchStatementData]);

  // Helper function to get total for a category
  const getCategoryTotal = useCallback((category) => {
    if (!category || !category.length) return {};
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const totals = { total: 0 };
    
    months.forEach(month => {
      totals[month] = category.reduce((sum, item) => sum + (item.monthly?.[month] || 0), 0);
      totals.total += totals[month];
    });
    
    return totals;
  }, []);

  // Calculate totals for all revenue categories
  const revenueTotal = useMemo(() => {
    if (!statementDataState) return null;
    
    const operatingTotal = getCategoryTotal(statementDataState.operatingRevenue);
    const otherTotal = getCategoryTotal(statementDataState.otherRevenue);
    const fundTotal = getCategoryTotal(statementDataState.fundSources);
    const extraordinaryTotal = getCategoryTotal(statementDataState.extraordinaryRevenue);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (operatingTotal[month] || 0) + (otherTotal[month] || 0) + 
                         (fundTotal[month] || 0) + (extraordinaryTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      operating: operatingTotal,
      other: otherTotal,
      fund: fundTotal,
      extraordinary: extraordinaryTotal,
      grand: grandTotal
    };
  }, [statementDataState, getCategoryTotal]);

  // Calculate totals for all expenditure categories
  const expenditureTotal = useMemo(() => {
    if (!statementDataState) return null;
    
    const nonCurrentTotal = getCategoryTotal(statementDataState.nonCurrentAssets);
    const currentTotal = getCategoryTotal(statementDataState.currentAssets);
    const debtTotal = getCategoryTotal(statementDataState.debtPayments);
    const operatingTotal = getCategoryTotal(statementDataState.operatingExpenses);
    const staffTotal = getCategoryTotal(statementDataState.staffCosts);
    const officeTotal = getCategoryTotal(statementDataState.officeExpenses);
    const contributionsTotal = getCategoryTotal(statementDataState.contributions);
    const specialTotal = getCategoryTotal(statementDataState.specialExpenses);
    const extraordinaryTotal = getCategoryTotal(statementDataState.extraordinaryExpenses);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (nonCurrentTotal[month] || 0) + (currentTotal[month] || 0) + 
                         (debtTotal[month] || 0) + (operatingTotal[month] || 0) +
                         (staffTotal[month] || 0) + (officeTotal[month] || 0) +
                         (contributionsTotal[month] || 0) + (specialTotal[month] || 0) +
                         (extraordinaryTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      nonCurrent: nonCurrentTotal,
      current: currentTotal,
      debt: debtTotal,
      operating: operatingTotal,
      staff: staffTotal,
      office: officeTotal,
      contributions: contributionsTotal,
      special: specialTotal,
      extraordinary: extraordinaryTotal,
      grand: grandTotal
    };
  }, [statementDataState, getCategoryTotal]);

  // Calculate net position (surplus/deficit)
  const netPosition = useMemo(() => {
    if (!revenueTotal || !expenditureTotal) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const net = { total: 0 };
    
    months.forEach(month => {
      net[month] = (revenueTotal.grand[month] || 0) - (expenditureTotal.grand[month] || 0);
      net.total += net[month];
    });
    
    return net;
  }, [revenueTotal, expenditureTotal]);

  // Calculate special savings (3% of revenue)
  const specialSavings = useMemo(() => {
    if (!revenueTotal || !statementDataState?.config) return null;
    
    const rate = statementDataState.config.specialSavingsRate;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const savings = { total: 0 };
    
    months.forEach(month => {
      savings[month] = (revenueTotal.grand[month] || 0) * rate;
      savings.total += savings[month];
    });
    
    return savings;
  }, [revenueTotal, statementDataState]);

  // Calculate running balance
  const runningBalance = useMemo(() => {
    if (!netPosition || !statementDataState?.config) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const fixedDeposits = statementDataState.config.fixedDepositAmounts;
    const balance = {};
    
    let currentBalance = statementDataState.config.openingBalance;
    
    months.forEach(month => {
      currentBalance += (netPosition[month] || 0);
      currentBalance -= (specialSavings?.[month] || 0);
      currentBalance -= (fixedDeposits[month] || 0);
      balance[month] = currentBalance;
    });
    
    return balance;
  }, [netPosition, specialSavings, statementDataState]);

  // Helper functions
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }, []);

  const getBudgetYear = useCallback(() => {
    return statementDataState?.config?.year?.toString() || new Date().getFullYear().toString();
  }, [statementDataState]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    await fetchStatementData();
    if (refetch) {
      refetch();
    }
  }, [fetchStatementData, refetch]);

  // Print functionality
  const { printElement } = usePrintout({
    title: `RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN ${getBudgetYear() || '2025'}`,
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

  return {
    // Data
    statementData: statementDataState,
    revenueTotal,
    expenditureTotal,
    netPosition,
    specialSavings,
    runningBalance,
    
    // Helpers
    formatCurrency,
    getBudgetYear,
    getCategoryTotal,
    months,
    monthNames,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // States
    isLoading,
    hasError,
    
    // Config
    config: statementDataState?.config
  };
};