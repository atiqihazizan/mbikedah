import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { EyeIcon } from "lucide-react";
import PageComponent from "../../components/PageComponent";
import Table from "../../components/TableRow";
import apiClient from "../../axios";
import { toast } from "react-toastify";
import TButton from "../../components/Core/TButton";

function BillingTableArchive() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [archiveItems, setArchiveItems] = useState([]);

  const columns = [
    {
      name: "Tarikh Permohonan",
      render: (item) => format(parseISO(item.issued_at), "dd/MM/yyyy"),
    },
    {
      name: "No. Projek",
      field: "no_project",
      nClassRow:
        "px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600",
    },
    {
      name: "Perkara",
      field: "description",
    },
    {
      name: "Jumlah (RM)",
      render: (item) =>
        parseFloat(item.total_amount).toLocaleString("en-MY", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "Status",
      render: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
      ),
    },
    {
      name: "Tarikh Dibuat",
      render: (item) => format(parseISO(item.created_at), "dd/MM/yyyy HH:mm"),
    },
    {
      name: "Tindakan",
      render: (item) => (<TButton to={`/billing/${item.id}/view`} color="blue" link><EyeIcon size={18} className="mr-1"/> Papar</TButton>),
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/billings/archive");
        const { success, message, data } = response;

        if (!success) {
          throw new Error(message || "Gagal mendapatkan data");
        }

        const items = data?.items || [];
        setArchiveItems(items);
        setCountActive(items.length);
      } catch (error) {
        const errorMessage =
          error.message ||
          "Ralat mendapatkan data. Sila cuba sebentar lagi.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setCountActive]);

  return (
    <PageComponent title="Permohonan Arkib" icon="archive">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {isLoading ? (
            <div className="text-center text-gray-500">Sedang memuat...</div>
          ) : (
            <Table
              columns={columns}
              data={archiveItems}
              tOption={{ checkable: false }}
            />
          )}
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableArchive;
