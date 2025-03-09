import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";
import apiClient from "../../axios";

function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalPayments: "0",
    pendingPayments: "0",
    totalUsers: "0",
    monthlyGrowth: "0"
  });
  const [pendingItems, setPendingItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Dapatkan semua data secara serentak
      const responses = await Promise.all([
        apiClient.get('/billing/stats'),
        apiClient.get('/billing/pending'),
        apiClient.get('/billing/recent-activities')
      ]);

      // Semak response untuk setiap panggilan
      responses.forEach(response => {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Gagal mendapatkan data dashboard');
        }
      });

      const [statsResponse, pendingResponse, recentResponse] = responses;
      const stats = statsResponse.data;
      const pending = pendingResponse.data;
      const recent = recentResponse.data;

      // Kemaskini statistik
      setStatsData({
        totalPayments: stats.totalAmount || "0",
        pendingPayments: stats.pendingCount || "0",
        totalUsers: stats.userCount || "0",
        monthlyGrowth: stats.growthRate || "0"
      });

      // Kemaskini senarai menunggu
      setPendingItems(pending.items?.map(item => ({
        id: item.id,
        title: item.status,
        count: item.count,
        amount: formatCurrency(item.amount),
        status: item.statusDescription,
        department: item.department
      })) || []);

      // Kemaskini aktiviti terkini
      setRecentActivities(recent.activities?.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        amount: formatCurrency(activity.amount),
        status: activity.status,
        timestamp: formatTimestamp(activity.createdAt)
      })) || []);

    } catch (error) {
      console.error('Ralat mendapatkan data dashboard:', error);
      
      let errorMessage;
      if (error.message === 'Tiada response dari server') {
        errorMessage = 'Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi anda telah tamat. Sila log masuk semula.';
      } else {
        errorMessage = error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.';
      }
      
      // Paparkan mesej ralat menggunakan komponen Toast atau Alert yang sedia ada
      alert(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `RM ${Number(amount).toLocaleString('en-MY', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 1000 / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minit yang lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else {
      return date.toLocaleDateString('ms-MY');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <PageComponent title="Dashboard Kewangan">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <DashboardStats statsData={statsData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DashboardChart />
          <PendingItems isLoading={isLoading} items={pendingItems} />
        </div>

        <RecentActivities isLoading={isLoading} activities={recentActivities} />
      </div>
    </PageComponent>
  );
}

export default FinanceDashboard;
