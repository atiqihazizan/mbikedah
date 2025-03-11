import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import { toast } from 'react-toastify';

function BillingTable() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [activeItems, setActiveItems] = useState([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const {success, message, data} = await apiClient.get("/billings/incomplete");
      if (!success) {
        throw new Error(message || 'Gagal mendapatkan data');
      }

      // Pastikan data.items wujud
      const items = data?.items || [];
      setActiveItems(items);
      setCountActive(items.length);
      
    } catch (error) {
      let errorMessage = error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.';

      // Jika ada mesej dari server, guna itu
      if(error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Jika tiada response dari server
      else if (error.message === 'Tiada response dari server') {
        errorMessage = 'Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.';
      }
      // Jika sesi tamat
      else if (error.response?.status === 401) {
        errorMessage = 'Sesi anda telah tamat. Sila log masuk semula.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Guna useEffect untuk load data pada permulaan
  useEffect(() => {
    loadData();
  }, []); // Dependency array kosong kerana hanya perlu load sekali

  const handleDelete = async (id) => {
    if (!window.confirm("Adakah anda pasti untuk padam permohonan ini?")) {
      return;
    }

    try {
      const { success, message } = await apiClient.delete(`/billings/${id}`);
      
      if (!success) {
        throw new Error(message || 'Gagal memadam permohonan');
      }

      toast.success("Permohonan berjaya dipadam");
      await loadData(); // Refresh data
      
    } catch (error) {
      let errorMessage;
      
      // Jika ada mesej dari server, guna itu
      if(error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Jika permohonan tidak dijumpai
      else if (error.response?.status === 404) {
        errorMessage = "Permohonan tidak dijumpai";
      }
      // Jika tiada response dari server
      else if (error.message === 'Tiada response dari server') {
        errorMessage = "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      }
      // Jika sesi tamat
      else if (error.response?.status === 401) {
        errorMessage = 'Sesi anda telah tamat. Sila log masuk semula.';
      }
      else {
        errorMessage = error.message || "Ralat semasa memadam permohonan. Sila cuba lagi.";
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <PageComponent title="Permohonan Aktif">
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
                        {item.status_id === 1 && (
                          <>
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
                          </>
                        )}
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
