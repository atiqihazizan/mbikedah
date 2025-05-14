import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { EyeIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import Table from "../../components/TableRow";
import PulseTable from "../../components/Core/PulseTable";

function BillingTableFinance() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [activeItems, setActiveItems] = useState([]);

  const loadData = async () => {
    if(isLoading) return;
    try {
      setIsLoading(true);
      const { success, message, data } = await apiClient.get(
        "/billings/pending-finance"
      );
      if (!success) {
        throw new Error(message || "Gagal mendapatkan data");
      }
      setActiveItems(data || []);
      setCountActive(data.length);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message === "Tiada response dari server") {
      return "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
    } else if (error.response?.status === 401) {
      return "Sesi anda telah tamat. Sila log masuk semula.";
    }
    return error.message || "Ralat mendapatkan data. Sila cuba sebentar lagi.";
  };

  const columns = [
    {
      name: "Tarikh Permohonan",
      field: "issued_at",
      render: (item) => item.issued_at ? format(parseISO(item.issued_at), "dd/MM/yyyy") : "-"
    },
    {
      name: "Pemohon",
      field: "created_by",
      nClassRow: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
    },
    {
      name: "No. Projek",
      field: "no_project",
      nClassRow: "px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600"
    },
    {
      name: "Perkara",
      field: "description",
      nClassRow: "px-6 py-4 whitespace-nowrap text-sm text-gray-900"
    },
    {
      name: "Jumlah (RM)",
      render: (item) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {parseFloat(item.total_amount).toLocaleString("en-MY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      )
    },
    {
      name: "Status",
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${item.status_name === "Draft" ? "bg-gray-100 text-gray-800"
          : item.status_name === "Diluluskan" ? "bg-green-100 text-green-800"
          : item.status_name === "Ditolak" ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"}`}>
          {item.status_name.replace(' Kewangan', '')}
        </span>
      )
    },
    {
      name: "Tarikh Dibuat",
      render: (item) => item.created_at ? format(parseISO(item.created_at), "dd/MM/yyyy HH:mm") : "-"
    },
    {
      name: "Tindakan",
      render: (item) => {
        const path = item.status_id < 6 ? `/billing/${item.id}/finance/show` : `/billing/${item.id}/finance/payment`;
        
        return (
        <div className="flex space-x-2">
          <Link
            to={path}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <EyeIcon size={16} className="mr-1" /> Papar
          </Link>
        </div>
      )}
    }
  ];

  return (
    <PageComponent title="Permohonan Untuk Pengesahan">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {isLoading ? (
            <PulseTable/>
          ) : (
          <Table 
            columns={columns}
            data={activeItems}
            loading={isLoading}
            tOption={{
              checkable: false,
              oClassTable: "min-w-full divide-y divide-gray-200"
            }}
          />
          )}
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableFinance;
