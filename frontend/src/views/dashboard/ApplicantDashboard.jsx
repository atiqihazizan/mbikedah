import { useState, useEffect } from "react";
import PageComponent from "../../components/PageComponent";
import DashboardStats from "./components/DashboardStats";
import ActiveItemsTable from "./components/ActiveItemsTable";
import apiClient from "../../axios";
import { useStateContext } from "../../contexts/ContextProvider";
import { toast } from 'react-toastify';

function ApplicantDashboard() {
  const { countActive, setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  // Nilai awal untuk stats
  const defaultStats = {
    status_counts: {
      draft_count: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
    }
  };
  
  const [statsData, setStatsData] = useState(defaultStats.status_counts);
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
      const {success, message, data} = await apiClient.get("/dashboard");
      
      if (!success) {
        throw new Error(message || 'Gagal mendapatkan data dashboard');
      }

      const { stats, tables } = data;
      
      // Pastikan data stats ada dan lengkap
      if (!stats?.status_counts) {
        // console.warn('Data stats tidak lengkap, menggunakan nilai default');
        setStatsData(defaultStats.status_counts);
      } else {
        // Gabungkan dengan nilai default untuk elakkan undefined
        setStatsData({
          ...defaultStats.status_counts,
          ...stats.status_counts
        });
      }

      // Pastikan tables.active_items wujud
      const activeItems = tables?.active_items || [];
      setActiveItems(activeItems);
      setCountActive(activeItems.length);
      
    } catch (error) {
      console.error('Ralat mendapatkan data dashboard:', error);
      toast.error(error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const {success, message, data} = await apiClient.get("/dashboard");
        
        // Pastikan component masih mounted
        if (!isSubscribed) return;

        if (!success) {
          throw new Error(message || 'Gagal mendapatkan data dashboard');
        }

        const { stats, tables } = data;
        
        // Pastikan data stats ada dan lengkap
        if (!stats?.status_counts) {
          setStatsData(defaultStats.status_counts);
        } else {
          // Gabungkan dengan nilai default untuk elakkan undefined
          setStatsData({
            ...defaultStats.status_counts,
            ...stats.status_counts
          });
        }

        // Pastikan tables.active_items wujud
        const activeItems = tables?.active_items || [];
        setActiveItems(activeItems);
        setCountActive(activeItems.length);
        
      } catch (error) {
        // Pastikan component masih mounted
        if (!isSubscribed) return;

        console.error('Ralat mendapatkan data dashboard:', error);
        
        let errorMessage;
        if (error.message === 'Tiada response dari server') {
          errorMessage = 'Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi anda telah tamat. Sila log masuk semula.';
        } else {
          errorMessage = error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.';
        }
        
        toast.error(errorMessage);
      } finally {
        // Pastikan component masih mounted
        if (!isSubscribed) return;
        setIsLoading(false);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, []); // Dependency array kosong kerana hanya perlu load sekali

  const handleDelete = async (id) => {
    if (!window.confirm("Adakah anda pasti untuk padam permohonan ini?")) {
      return;
    }

    try {
      const { success, message } = await apiClient.delete(`/billing/${id}`);
      
      if (!success) {
        throw new Error(message || 'Gagal memadam permohonan');
      }

      toast.success("Permohonan berjaya dipadam");
      await fetchDashboardData(); // Refresh data
      
    } catch (error) {
      console.error('Ralat semasa memadam permohonan:', error);
      
      if (error.response?.status === 404) {
        toast.error("Permohonan tidak dijumpai");
      } else if (error.message === 'Tiada response dari server') {
        toast.error("Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.");
      } else {
        toast.error(error.message || "Ralat semasa memadam permohonan. Sila cuba lagi.");
      }
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
