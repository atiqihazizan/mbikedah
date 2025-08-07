import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import statementData from '../assets/data/incomeExpenditureStatement.json';

const useIncomeExpediturreStatment = () => {
  const [statementDataState, setStatementDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // 'api' or 'json'

  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try API first
        try {
          const response = await apiClient.get('/budgets/reports/income-expenditure-statement');
          if (response.success && response.data) {
            setStatementDataState(response.data);
            setDataSource('api');
            console.log('Income expenditure statement data loaded from API');
            return;
          }
        } catch (apiError) {
          console.warn('API failed, falling back to JSON:', apiError.message);
        }

        // Fallback to JSON file
        setStatementDataState(statementData);
        setDataSource('json');
        console.log('Income expenditure statement data loaded from JSON fallback');

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
    
    // If using API data, transform it to match JSON structure
    if (dataSource === 'api') {
      return {
        operatingRevenue: statementDataState.income?.items || [],
        otherRevenue: [],
        fundSources: [],
        extraordinaryRevenue: [],
        operatingTotal: statementDataState.income?.total || 0,
        otherTotal: 0,
        fundTotal: 0,
        extraordinaryTotal: 0,
        grandTotal: statementDataState.income?.total || 0
      };
    }
    
    // Return JSON data as is
    return statementDataState.income;
  };

  // Helper function to get expenditure data with proper structure
  const getExpenditureData = () => {
    if (!statementDataState) return null;
    
    // If using API data, transform it to match JSON structure
    if (dataSource === 'api') {
      return {
        nonCurrentAssets: statementDataState.expenditure?.items || [],
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
        grandTotal: statementDataState.expenditure?.total || 0
      };
    }
    
    // Return JSON data as is
    return statementDataState.expenditure;
  };

  // Helper function to get summary data with proper structure
  const getSummaryData = () => {
    if (!statementDataState) return null;
    
    // If using API data, transform it to match JSON structure
    if (dataSource === 'api') {
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
    }
    
    // Return JSON data as is
    return statementDataState.summary;
  };

  return {
    statementData: statementDataState,
    incomeData: getIncomeData(),
    expenditureData: getExpenditureData(),
    summaryData: getSummaryData(),
    loading,
    error,
    dataSource,
    refetch: () => {
      setLoading(true);
      setError(null);
      setStatementDataState(null);
    }
  };
};

export default useIncomeExpediturreStatment;