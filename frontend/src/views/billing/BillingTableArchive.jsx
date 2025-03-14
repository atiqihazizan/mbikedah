import { useState, useEffect, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import PageComponent from "../../components/PageComponent";
import Table from "../../components/TableRow";
import apiClient from "../../axios";
import { toast } from "react-toastify";

function BillingTableArchive() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [activeItems, setActiveItems] = useState([]);

  const columns = useMemo(() => [
    { 
      name: "Tarikh Permohonan",
      render: (item) => format(parseISO(item.issued_at), "dd/MM/yyyy")
    },
    { 
      name: "No. Projek",
      field: "no_project",
      nClassRow: "px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600"
    },
    { 
      name: "Perkara",
      field: "description"
    },
    { 
      name: "Jumlah (RM)",
      render: (item) => parseFloat(item.total_amount).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },
    { 
      name: "Status",
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === "Draft" ? "bg-gray-100 text-gray-800"
          : item.status === "Diluluskan" ? "bg-green-100 text-green-800"
          : item.status === "Ditolak" ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
        }`}>
          {item.status}
        </span>
      )
    },
    { 
      name: "Tarikh Dibuat",
      render: (item) => format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")
    },
    {
      name: "Tindakan",
      render: (item) => item.status_id === 1 && (
        <div className="flex space-x-2">
          <Link
            to={`/billing/${item.id}/edit`}
            className={`text-indigo-600 hover:text-indigo-900 ${isDeletingId ? "pointer-events-none opacity-50" : ""}`}>
            <Pencil size={18} />
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={isDeletingId === item.id}
            className={`text-red-600 hover:text-red-900 ${isDeletingId === item.id ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isDeletingId === item.id ? (
              <div className="w-4 h-4 border-2 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      )
    }
  ], [isDeletingId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { success, message, data } = await apiClient.get(
        "/billings/incomplete"
      );
      if (!success) {
        throw new Error(message || "Gagal mendapatkan data");
      }

      // Pastikan data.items wujud
      const items = data?.items || [];
      setActiveItems(items);
      setCountActive(items.length);
    } catch (error) {
      let errorMessage =
        error.message || "Ralat mendapatkan data. Sila cuba sebentar lagi.";

      // Jika ada mesej dari server, guna itu
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Jika tiada response dari server
      else if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      }
      // Jika sesi tamat
      else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
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

    setIsDeletingId(id); // Set deleting state
    try {
      const { success, message } = await apiClient.delete(`/billings/${id}`);

      if (!success) {
        throw new Error(message || "Gagal memadam permohonan");
      }

      toast.success("Permohonan berjaya dipadam");
      await loadData(); // Refresh data
    } catch (error) {
      let errorMessage;

      // Jika ada mesej dari server, guna itu
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Jika permohonan tidak dijumpai
      else if (error.response?.status === 404) {
        errorMessage = "Permohonan tidak dijumpai";
      }
      // Jika tiada response dari server
      else if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      }
      // Jika sesi tamat
      else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      } else {
        errorMessage =
          error.message || "Ralat semasa memadam permohonan. Sila cuba lagi.";
      }

      toast.error(errorMessage);
    } finally {
      setIsDeletingId(null); // Clear deleting state
    }
  };

  return (
    <PageComponent title="Permohonan Arkib" icon="archive">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {isLoading ? (
            <div className="text-center text-gray-500">Sedang memuat...</div>
          ) : (
            <Table
              columns={columns}
              data={activeItems}
              tOption={{ checkable: false }}
            />
          )}
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableArchive;
