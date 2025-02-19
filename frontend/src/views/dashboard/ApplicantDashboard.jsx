import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import PendingItems from "./components/PendingItems";
import RecentActivities from "./components/RecentActivities";

function ApplicantDashboard() {
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
      title: "Permohonan Dalam Proses",
      count: 5,
      amount: "RM 12,500.00",
      status: "Menunggu Pengesahan HOD",
      department: "Jabatan Kejuruteraan"
    },
    {
      id: 2,
      title: "Permohonan Diluluskan",
      count: 3,
      amount: "RM 8,200.00",
      status: "Menunggu Pembayaran",
      department: "Jabatan Kewangan"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "payment",
      description: "Permohonan bayaran telah diluluskan",
      amount: "RM 1,200.00",
      status: "Diluluskan oleh HOD",
      timestamp: "2 minit yang lalu"
    },
    {
      id: 2,
      type: "document",
      description: "Permohonan baru dibuat",
      amount: "RM 850.00",
      status: "Menunggu HOD",
      timestamp: "30 minit yang lalu"
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
    <PageComponent title="Dashboard Pemohon">
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

export default ApplicantDashboard;
