import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { CheckIcon, Pencil, Trash2, History } from "lucide-react";
import { toast } from "react-toastify";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import BillingHistoryModal from "../../components/modals/BillingHistoryModal";
import Table from "../../components/TableRow";

function BillingTableHOD() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [action, setAction] = useState(null); // 'reject' atau 'return'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);

  const handleAction = async (id, actionType) => {
    if (!['approve', 'reject', 'return'].includes(actionType)) {
      toast.error('Jenis tindakan tidak sah');
      return;
    }
    setActionLoadingId(id);
    setSelectedBilling(id);
    setAction(actionType);
    setShowConfirmation(true);
    setActionLoadingId(null);
  };

  const getEndpointForAction = (action) => {
    const endpoints = {
      reject: "reject",
      approve: "hod-approve",
      return: "return"
    };
    return endpoints[action] || "";
  };

  const getActionText = (action, type = 'verb') => {
    const actionTexts = {
      reject: { verb: 'menolak', noun: 'Ditolak', reason: 'penolakan' },
      approve: { verb: 'mengesahkan', noun: 'Disahkan', reason: 'pengesahan' },
      return: { verb: 'memulangkan', noun: 'Dipulangkan', reason: 'pemulangan' }
    };
    return actionTexts[action]?.[type] || '';
  };

  const handleConfirm = async (remarks) => {
    if (!remarks || !selectedBilling || !action) return;
    setIsActionLoading(true);

    try {
      const endpoint = getEndpointForAction(action);
      const {success,data,message} = await apiClient.post(
        `/billings/${selectedBilling}/${endpoint}`,
        { remarks }
      );

      if (!success) {
        throw new Error(message || `Gagal ${getActionText(action)} permohonan`);
      }

      await loadData();
      toast.success(`Permohonan berjaya ${getActionText(action, 'noun')}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || `Ralat ${getActionText(action)} permohonan`;
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
      setShowConfirmation(false);
      setSelectedBilling(null);
      setAction(null);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { success, message, data } = await apiClient.get(
        "/billings/pending-hod"
      );
      if (!success) {
        throw new Error(message || "Gagal mendapatkan data");
      }

      // Pastikan data wujud dan dalam format yang betul
      const billingData = data || [];

      setActiveItems(billingData);
      setCountActive(billingData.length);
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

  const handleViewHistory = async (id) => {
    try {
      const response = await apiClient.get(`/billings/${id}/history`);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Gagal mendapatkan sejarah permohonan"
        );
      }
      setBillingHistory(response.data.data);
      setShowHistory(true);
    } catch (error) {
      let errorMessage;
      if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      } else {
        errorMessage =
          error.message ||
          "Ralat mendapatkan sejarah permohonan. Sila cuba sebentar lagi.";
      }
      console.error("Error:", errorMessage);
    }
  };

  const actionButtons = [
    { type: 'approve', icon: CheckIcon, label: 'Sahkan', colorClass: 'bg-green-500 hover:bg-green-600' },
    { type: 'reject', icon: Trash2, label: 'Tolak', colorClass: 'bg-red-500 hover:bg-red-600' },
    { type: 'return', icon: Pencil, label: 'Pulang', colorClass: 'bg-yellow-500 hover:bg-yellow-600' },
    { type: 'history', icon: History, label: 'Sejarah', colorClass: 'bg-blue-500 hover:bg-blue-600' }
  ];

  const columns = [
    {
      name: "Tarikh Permohonan",
      render: (item) => item.issued_at ? format(parseISO(item.issued_at), "dd/MM/yyyy") : "-"
    },
    {
      name: "No. Projek",
      field: "no_project",
      classRow: "font-medium text-blue-600"
    },
    {
      name: "Perkara",
      field: "description"
    },
    {
      name: "Jumlah (RM)",
      render: (item) => parseFloat(item.total_amount).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    {
      name: "Status",
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${item.status_name === "Draft" ? "bg-gray-100 text-gray-800"
          : item.status_name === "Diluluskan" ? "bg-green-100 text-green-800" 
          : item.status_name === "Ditolak" ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"}`}>
          {item.status_name}
        </span>
      )
    },
    {
      name: "Tarikh Dibuat",
      render: (item) => item.created_at ? format(parseISO(item.created_at), "dd/MM/yyyy HH:mm") : "-"
    },
    {
      name: "Tindakan",
      render: (item) => (
        <div className="flex space-x-2">
          {actionLoadingId === item.id ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span className="text-sm text-gray-500">Memproses...</span>
            </div>
          ) : (
            actionButtons.map(({ type, icon: Icon, label, colorClass }) => (
              <button
                key={type}
                onClick={() => type === 'history' ? handleViewHistory(item.id) : handleAction(item.id, type)}
                disabled={isActionLoading}
                className={`${colorClass} text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50`}
              >
                <Icon size={16} className="mr-1" />
                {label}
              </button>
            ))
          )}
        </div>
      )
    }
  ];

  return (
    <PageComponent title="Permohonan Untuk Pengesahan">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <Table 
            columns={columns}
            data={activeItems}
            loading={isLoading}
            tOption={{
              checkable: false,
              oClassParent: "overflow-x-auto",
              oClassTable: "min-w-full divide-y divide-gray-200",
              oClassThead: "bg-gray-50"
            }}
          />

          {showConfirmation && (
            <ConfirmationModal
              isOpen={true}
              onClose={() => !isActionLoading && setShowConfirmation(false)}
              onConfirm={handleConfirm}
              title={`${getActionText(action, 'noun')} Permohonan`}
              message={`Sila nyatakan sebab ${getActionText(action, 'reason')}:`}
              confirmText={getActionText(action, 'noun')}
              isLoading={isActionLoading}
              disabled={isActionLoading}
            />
          )}

          {showHistory && (
            <BillingHistoryModal
              isOpen={true}
              onClose={() => {
                setShowHistory(false);
                setBillingHistory([]);
              }}
              history={billingHistory}
            />
          )}
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableHOD;
