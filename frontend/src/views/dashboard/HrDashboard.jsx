import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";

function HrDashboard() {
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
      title: "Permohonan HR",
      count: 6,
      amount: "RM 23,400.00",
      status: "Perlu Tindakan",
      department: "Jabatan HR"
    },
    {
      id: 2,
      title: "Permohonan Diproses",
      count: 4,
      amount: "RM 15,600.00",
      status: "Dalam Proses",
      department: "Jabatan HR"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "document",
      description: "Permohonan cuti sakit",
      status: "Perlu Tindakan",
      timestamp: "15 minit yang lalu"
    },
    {
      id: 2,
      type: "document",
      description: "Permohonan latihan",
      status: "Diluluskan",
      timestamp: "3 jam yang lalu"
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
    <PageComponent title="Dashboard HR">
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

export default HrDashboard;
