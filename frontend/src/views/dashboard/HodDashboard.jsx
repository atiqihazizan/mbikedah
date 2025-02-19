import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";

function HodDashboard() {
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
      title: "Permohonan Baru",
      count: 12,
      amount: "RM 45,600.00",
      status: "Menunggu Pengesahan",
      department: "Jabatan Kejuruteraan"
    },
    {
      id: 2,
      title: "Permohonan Disemak",
      count: 8,
      amount: "RM 23,450.00",
      status: "Telah Disahkan",
      department: "Jabatan Kejuruteraan"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "payment",
      description: "Permohonan dari Jabatan Kejuruteraan",
      amount: "RM 2,500.00",
      status: "Perlu Pengesahan",
      timestamp: "5 minit yang lalu"
    },
    {
      id: 2,
      type: "payment",
      description: "Permohonan dari Jabatan IT",
      amount: "RM 1,800.00",
      status: "Telah Disahkan",
      timestamp: "1 jam yang lalu"
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
    <PageComponent title="Dashboard Ketua Jabatan">
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

export default HodDashboard;
