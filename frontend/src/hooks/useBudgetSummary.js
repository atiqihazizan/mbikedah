import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import budgetData from '../assets/data/budgetSummary.json';

const useBudgetSummary = () => {
  const [budgetDataState, setBudgetDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // 'api' or 'json'

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try API first
        try {
          const response = await apiClient.get('/budgets/reports/summary');
          if (response.success && response.data) {
            setBudgetDataState(response.data);
            setDataSource('api');
            console.log('Budget summary data loaded from API');
            return;
          }
        } catch (apiError) {
          console.warn('API failed, falling back to JSON:', apiError.message);
        }

        // Fallback to JSON file
        setBudgetDataState(budgetData);
        setDataSource('json');
        console.log('Budget summary data loaded from JSON fallback');

      } catch (err) {
        console.error('Error loading budget summary data:', err);
        setError(err.message || 'Ralat memuatkan data ringkasan budget');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // Helper function to get revenue data
  const getRevenueData = () => {
    if (!budgetDataState) return null;
    return budgetDataState.revenueData || budgetDataState.revenue;
  };

  // Helper function to get expenditure data
  const getExpenditureData = () => {
    if (!budgetDataState) return null;
    return budgetDataState.expenditureData || budgetDataState.expenditure;
  };

  // Helper function to get summary data
  const getSummaryData = () => {
    if (!budgetDataState) return null;
    return budgetDataState.summary;
  };

  return {
    budgetData: budgetDataState,
    revenueData: getRevenueData(),
    expenditureData: getExpenditureData(),
    summaryData: getSummaryData(),
    loading,
    error,
    dataSource,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Trigger re-fetch by updating state
      setBudgetDataState(null);
    }
  };
};

export default useBudgetSummary;