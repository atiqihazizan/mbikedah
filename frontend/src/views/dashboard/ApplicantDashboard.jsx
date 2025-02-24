import { useState, useEffect } from "react";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import ActiveItemsTable from "./components/ActiveItemsTable";
import axiosClient from "../../axios";
import { useStateContext } from "../../contexts/ContextProvider";

function ApplicantDashboard() {
  const { countActive, setCountActive, showToast } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    draft_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  });
  const [activeItems, setActiveItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { success, data } = await axiosClient.get("/dashboard");
      if (success) {
        const { stats, tables } = data;
        setStatsData(stats.status_counts);
        setActiveItems(tables.active_items);
        setCountActive(tables.active_items.length);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Adakah anda pasti untuk padam permohonan ini?")) {
      return;
    }

    try {
      const { data } = await axiosClient.delete(`/billing/${id}`);
      if (data.success) {
        showToast("success", "Permohonan berjaya dipadam");
        fetchDashboardData(); // Refresh data
      } else {
        showToast("error", data.message || "Gagal memadam permohonan");
      }
    } catch (error) {
      console.error("Error deleting billing:", error);
      showToast("error", "Gagal memadam permohonan");
    }
  };

  return (
    <PageComponent title="Dashboard Pemohon">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <DashboardStats statsData={statsData} />
        <ActiveItemsTable 
          items={activeItems} 
          isLoading={isLoading} 
          onDelete={handleDelete}
        />
      </div>
    </PageComponent>
  );
}

export default ApplicantDashboard;
