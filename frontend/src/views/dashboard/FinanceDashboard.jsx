import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";

function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalPayments: "0",
    pendingPayments: "0",
    totalUsers: "0",
    monthlyGrowth: "0"
  });

  const pendingItems = [
    {
      id: 1,
      title: "Perlu Semakan",
      count: 15,
      amount: "RM 78,900.00",
      status: "Belum Disemak",
      department: "Jabatan Kewangan"
    },
    {
      id: 2,
      title: "Perlu Kelulusan",
      count: 8,
      amount: "RM 34,500.00",
      status: "Menunggu Kelulusan",
      department: "Jabatan Kewangan"
    },
    {
      id: 3,
      title: "Proses Bayaran",
      count: 12,
      amount: "RM 56,700.00",
      status: "Menunggu Pembayaran",
      department: "Jabatan Kewangan"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "payment",
      description: "Permohonan bayaran projek",
      amount: "RM 45,000.00",
      status: "Perlu Semakan",
      timestamp: "10 minit yang lalu"
    },
    {
      id: 2,
      type: "payment",
      description: "Bayaran utiliti",
      amount: "RM 12,500.00",
      status: "Dalam Proses Bayaran",
      timestamp: "2 jam yang lalu"
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setStatsData({
        totalPayments: "1,234,567",
        pendingPayments: "45",
        totalUsers: "890",
        monthlyGrowth: "12.5"
      });
      setIsLoading(false);
    }, 1000);
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
