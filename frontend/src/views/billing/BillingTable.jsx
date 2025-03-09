import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";

function BillingTable() {
  const { countActive, setCountActive, showToast } = useStateContext();
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
      showToast('error', error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
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
            ...stats.stcatus_counts
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
        
        showToast('error', errorMessage);
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

      showToast("success", "Permohonan berjaya dipadam");
      await fetchDashboardData(); // Refresh data
      
    } catch (error) {
      console.error('Ralat semasa memadam permohonan:', error);
      
      if (error.response?.status === 404) {
        showToast("error", "Permohonan tidak dijumpai");
      } else if (error.message === 'Tiada response dari server') {
        showToast("error", "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.");
      } else {
        showToast("error", error.message || "Ralat semasa memadam permohonan. Sila cuba lagi.");
      }
    }
  };

  return (
    <PageComponent title="Permohonan Sedang Aktif">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* <h2 className="text-xl font-semibold mb-4">Permohonan Aktif</h2> */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarikh Permohonan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Projek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perkara
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah (RM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarikh Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeItems?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(parseISO(item.issued_at), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {item.no_project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.total_amount).toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      item.status === "Draft"
                        ? "bg-gray-100 text-gray-800"
                        : item.status === "Diluluskan"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Ditolak"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          to={`/billing/${item.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Tiada permohonan aktif
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTable;
