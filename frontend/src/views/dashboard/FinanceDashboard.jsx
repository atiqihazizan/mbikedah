import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";
import axiosClient from "../../axios";

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
    try {
      const [stats, pending, recent] = await Promise.all([
        axiosClient.get('/billing/stats'),
        axiosClient.get('/billing/pending'),
        axiosClient.get('/billing/recent-activities')
      ]);

      // Update stats
      setStatsData({
        totalPayments: stats.totalAmount || "0",
        pendingPayments: stats.pendingCount || "0",
        totalUsers: stats.userCount || "0",
        monthlyGrowth: stats.growthRate || "0"
      });

      // Update pending items
      setPendingItems(pending.items?.map(item => ({
        id: item.id,
        title: item.status,
        count: item.count,
        amount: formatCurrency(item.amount),
        status: item.statusDescription,
        department: item.department
      })) || []);

      // Update recent activities
      setRecentActivities(recent.activities?.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        amount: formatCurrency(activity.amount),
        status: activity.status,
        timestamp: formatTimestamp(activity.createdAt)
      })) || []);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
      // You might want to show an error message to the user here
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
