import { useState, useEffect, useMemo, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from 'react-toastify';
import { formatCurrency } from "../../config/format";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import Table from "../../components/TableRow";
import PulseTable from "../../components/Core/PulseTable";
import TButton from "../../components/Core/TButton";

function BillingTableActive() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const mounted = useRef(false);

  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error.response?.status === 401) return 'Sesi anda telah tamat. Sila log masuk semula.';
    return error.message || 'Ralat. Sila cuba sebentar lagi.';
  };

  const getStatusStyle = (status) => {
    const styles = {
      Draft: "bg-gray-100 text-gray-800",
      Diluluskan: "bg-green-100 text-green-800",
      Ditolak: "bg-red-100 text-red-800",
      default: "bg-yellow-100 text-yellow-800"
    };
    return styles[status] || styles.default;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const {success, data} = await apiClient.get("/billings/incomplete");
      if (success && mounted.current) {
        setActiveItems(data?.items || []);
        setCountActive(data?.items?.length || 0);
      }
    } catch (error) {
      if (mounted.current) {
        toast.error(getErrorMessage(error));
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if(isLoading) return;
    mounted.current = true;
    loadData();
    return () => {mounted.current = false;};
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Adakah anda pasti untuk padam permohonan ini?")) return;

    setIsDeletingId(id);
    try {
      const { success } = await apiClient.delete(`/billings/${id}`);
      if (success) {
        toast.success("Permohonan berjaya dipadam");
        await loadData();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns = useMemo(
    () => [
      {name: "Tarikh Permohonan",render: ({ issued_at }) => format(parseISO(issued_at), "dd/MM/yyyy")},
      {name: "No. Projek",field: "no_project",nClassRow:"px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600"},
      {name: "Jumlah (RM)", nClassRow: "text-right text-gray-500",nClass: "text-right text-xs font-medium text-gray-500",render: ({ total_amount }) => formatCurrency(total_amount)},
      {name: "Status",render: ({ status }) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(status)}`}>{status}</span>},
      {name: "Tarikh Dibuat",render: ({ created_at }) => format(parseISO(created_at), "dd/MM/yyyy HH:mm")},
      {
        name: "Tindakan",
        nClass: "text-center text-gray-500 ",
        render: (item) => (
          <div className="flex gap-4 justify-end">
            {[1, 9].includes(item.status_id) && (
              <>
                <TButton to={`/billing/${item.id}/edit`} nClasses={`text-indigo-600 hover:text-indigo-900 flex items-center ${isDeletingId && "opacity-50"}`} disabled={isDeletingId}>
                  <Pencil size={18} className="mr-1"/> Edit
                </TButton>
                <TButton onClick={() => handleDelete(item.id)} disabled={isDeletingId} nClasses={`text-red-600 hover:text-red-900 flex items-center ${isDeletingId === item.id && "opacity-50"}`}>
                  <Trash2 size={18} className="mr-1" /> Hapus
                </TButton>
              </>
            )}
            <TButton to={`/billing/${item.id}/view`} nClasses="text-blue-500 hover:text-blue-600 flex items-center" circle link>
              <EyeIcon size={18} className="mr-1"/> Papar
            </TButton>
          </div>
        ),
      },
    ],
    [isDeletingId]
  );

  return (
    <PageComponent title="Permohonan Aktif">
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
                oClassTable: "min-w-full divide-y divide-gray-200",
                oClassThead: "bg-gray-50"
              }}
            />
          )}
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableActive;
