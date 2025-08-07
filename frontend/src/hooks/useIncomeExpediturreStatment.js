import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';

const useIncomeExpediturreStatment = () => {
  const [statementDataState, setStatementDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/budgets/reports/income-expenditure-statement');
        if (response.success && response.data) {
          setStatementDataState(response.data);
        } else {
          throw new Error('Failed to load income expenditure statement data');
        }

      } catch (err) {
        console.error('Error loading income expenditure statement data:', err);
        setError(err.message || 'Ralat memuatkan data penyata pendapatan dan perbelanjaan');
    } finally {
        setLoading(false);
    }
    };

    fetchStatementData();
  }, []);

  // Helper function to get income data with proper structure
  const getIncomeData = () => {
    if (!statementDataState) return null;
    
    // Flatten hierarchical structure for display
    const flattenedItems = [];
    const totals = {};
    
    if (statementDataState.income?.items) {
      statementDataState.income.items.forEach(parent => {
        // Add parent item
        flattenedItems.push({
          code: parent.code,
          description: parent.description,
          monthly: parent.monthly || {},
          level: parent.level,
          isParent: true
        });
        
        // Add children items
        if (parent.children && parent.children.length > 0) {
          parent.children.forEach(child => {
            flattenedItems.push({
              code: child.code,
              description: child.description,
              monthly: child.monthly || {},
              level: child.level,
              parent_id: child.parent_id,
              isChild: true
            });
          });
        }
      });
    }
    
    return {
      operatingRevenue: flattenedItems,
      otherRevenue: [],
      fundSources: [],
      extraordinaryRevenue: [],
      operatingTotal: statementDataState.income?.total || 0,
      otherTotal: 0,
      fundTotal: 0,
      extraordinaryTotal: 0,
      grandTotal: statementDataState.income?.monthly || {}
    };
  };

  // Helper function to get expenditure data with proper structure
  const getExpenditureData = () => {
    if (!statementDataState) return null;
    
    // Flatten hierarchical structure for display
    const flattenedItems = [];
    const totals = {};
    
    if (statementDataState.expenditure?.items) {
      statementDataState.expenditure.items.forEach(parent => {
        // Add parent item
        flattenedItems.push({
          code: parent.code,
          description: parent.description,
          monthly: parent.monthly || {},
          level: parent.level,
          isParent: true
        });
        
        // Add children items
        if (parent.children && parent.children.length > 0) {
          parent.children.forEach(child => {
            flattenedItems.push({
              code: child.code,
              description: child.description,
              monthly: child.monthly || {},
              level: child.level,
              parent_id: child.parent_id,
              isChild: true
            });
          });
        }
      });
    }
    
    return {
      nonCurrentAssets: flattenedItems,
      currentAssets: [],
      debtPayments: [],
      operatingExpenses: [],
      staffCosts: [],
      officeExpenses: [],
      contributions: [],
      specialExpenses: [],
      extraordinaryExpenses: [],
      nonCurrentTotal: statementDataState.expenditure?.total || 0,
      currentTotal: 0,
      debtTotal: 0,
      operatingTotal: 0,
      staffTotal: 0,
      officeTotal: 0,
      contributionsTotal: 0,
      specialTotal: 0,
      extraordinaryTotal: 0,
      grandTotal: statementDataState.expenditure?.monthly || {}
    };
  };

  // Helper function to get summary data with proper structure
  const getSummaryData = () => {
    if (!statementDataState) return null;
    
    return {
      budgetYear: new Date().getFullYear(),
      netIncome: statementDataState.summary?.netIncome || 0,
      netActual: statementDataState.summary?.netActual || 0,
      openingBalance: 0,
      fixedDepositAmounts: {},
      specialSavings: {},
      runningBalance: {},
      netPosition: {}
    };
  };

  return {
    statementData: statementDataState,
    incomeData: getIncomeData(),
    expenditureData: getExpenditureData(),
    summaryData: getSummaryData(),
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      setStatementDataState(null);
    }
  };
};

export default useIncomeExpediturreStatment;