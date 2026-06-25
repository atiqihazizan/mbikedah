import { useState, useEffect } from 'react';
import axios from '../utils/axios';

const useBudgetSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/budgets/reports/summary');
      
      if (response && response.success) {
        setData(response.data);
      } else {
        setError(response?.message || 'Ralat mendapatkan data');
      }
    } catch (err) {
      console.error('Error fetching budget summary data:', err);
      console.error('Error response:', err.response);
      setError('Ralat mendapatkan data dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
};

export default useBudgetSummary;