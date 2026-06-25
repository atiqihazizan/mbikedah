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

        // First, test if the API is accessible
        try {
          const testResponse = await apiClient.get('/budgets');
        } catch (testErr) {
          console.warn('Test API call failed:', testErr);
        }

        // Now call the actual endpoint
        const response = await apiClient.get('/budgets/reports/income-expenditure-statement');
        
        // Since apiClient.get returns response.data directly, we access the data directly
        if (response) {
          // Check if it's a successful response
          if (response.success && response.data) {
            setStatementDataState(response.data);
          } else if (response.success === false) {
            // Handle explicit failure response
            throw new Error(response.message || 'API returned failure status');
          } else if (response.data) {
            // Handle case where success field might be missing but data exists
            setStatementDataState(response.data);
          } else {
            // Handle case where response structure is unexpected
            console.warn('Unexpected response structure:', response);
            console.log('Response keys:', Object.keys(response));
            throw new Error('Unexpected response structure from API');
          }
        } else {
          throw new Error('No response data received from API');
        }

      } catch (err) {
        console.error('Error loading income expenditure statement data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        
        // Provide more specific error messages
        let errorMessage = 'Ralat memuatkan data penyata pendapatan dan perbelanjaan';
        
        if (err.response?.status === 404) {
          errorMessage = 'API endpoint tidak dijumpai';
        } else if (err.response?.status === 500) {
          errorMessage = 'Ralat server - sila cuba lagi';
        } else if (err.response?.status === 401) {
          errorMessage = 'Tidak dibenarkan - sila log masuk semula';
        } else if (err.response?.status === 403) {
          errorMessage = 'Akses ditolak';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
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
    
    if (statementDataState.income?.items) {
      statementDataState.income.items.forEach(parent => {
        // Add parent item
        flattenedItems.push({
          code: parent.code,
          description: parent.description,
          monthly: parent.monthly || {},
          level: parent.level,
          isParent: true,
          isChild: false
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
              isParent: false,
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
      operatingTotal: statementDataState.income?.monthly || {},
      otherTotal: {},
      fundTotal: {},
      extraordinaryTotal: {},
      grandTotal: statementDataState.income?.monthly || {}
    };
  };

  // Helper function to get expenditure data with proper structure
  const getExpenditureData = () => {
    if (!statementDataState) return null;
    
    // Flatten hierarchical structure for display
    const flattenedItems = [];
    
    if (statementDataState.expenditure?.items) {
      statementDataState.expenditure.items.forEach(parent => {
        // Add parent item
        flattenedItems.push({
          code: parent.code,
          description: parent.description,
          monthly: parent.monthly || {},
          level: parent.level,
          isParent: true,
          isChild: false
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
              isParent: false,
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
      nonCurrentTotal: statementDataState.expenditure?.monthly || {},
      currentTotal: {},
      debtTotal: {},
      operatingTotal: {},
      staffTotal: {},
      officeTotal: {},
      contributionsTotal: {},
      specialTotal: {},
      extraordinaryTotal: {},
      grandTotal: statementDataState.expenditure?.monthly || {}
    };
  };

  // Helper function to get summary data with proper structure
  const getSummaryData = () => {
    if (!statementDataState) return null;
    
    return {
      budgetYear: statementDataState.summary?.year || new Date().getFullYear(),
      netIncome: statementDataState.summary?.netIncome || 0,
      netActual: statementDataState.summary?.netActual || 0,
      netPosition: statementDataState.summary?.netPosition || {},
      openingBalance: statementDataState.summary?.openingBalance || {},
      fixedDepositAmounts: statementDataState.summary?.fixedDepositAmounts || {},
      specialSavings: statementDataState.summary?.specialSavings || {},
      runningBalance: statementDataState.summary?.runningBalance || {}
    };
  };

  return {
    statementData: statementDataState,
    incomeData: getIncomeData(),
    expenditureData: getExpenditureData(),
    summaryData: getSummaryData(),
    loading,
    error,
    dataSource: statementDataState ? 'database' : null,
    refetch: () => {
      setLoading(true);
      setError(null);
      setStatementDataState(null);
      // Trigger a re-fetch by calling the effect again
      setTimeout(() => {
        const fetchStatementData = async () => {
          try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get('/budgets/reports/income-expenditure-statement');
            
            // Since apiClient.get returns response.data directly, we access the data directly
            if (response) {
              if (response.success && response.data) {
                setStatementDataState(response.data);
              } else if (response.success === false) {
                throw new Error(response.message || 'API returned failure status');
              } else if (response.data) {
                setStatementDataState(response.data);
              } else {
                throw new Error('Unexpected response structure from API');
              }
            } else {
              throw new Error('No response data received from API');
            }

          } catch (err) {
            console.error('Error loading income expenditure statement data:', err);
            setError(err.message || 'Ralat memuatkan data penyata pendapatan dan perbelanjaan');
          } finally {
            setLoading(false);
          }
        };

        fetchStatementData();
      }, 100);
    }
  };
};

export default useIncomeExpediturreStatment;