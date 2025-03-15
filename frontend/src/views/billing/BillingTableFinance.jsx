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

function BillingTableFinance() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [action, setAction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [idStatus, setIdStatus] = useState(null);
  const actionUrl = {
    3: "finance-review",
    4: "finance-verify",
    5: "finance-approve",
    6: "process-payment",
    7: "paid-complete",
  };

  const getActionText = (action, type = 'verb') => {
    const actionTexts = {
        reject: { verb: 'menolak', noun: 'Ditolak', reason: 'penolakan' },
        approve: { verb: 'mengesahkan', noun: 'Disahkan', reason: 'pengesahan' },
        return: { verb: 'memulangkan', noun: 'Dipulangkan', reason: 'pemulangan' }
    };
    return actionTexts[action]?.[type] || '';
  };

  const actionMapping = {
    approve: { url: (id) => actionUrl[id], text: getActionText('approve') },
    reject: { url: () => "reject", text: getActionText('reject') },
    return: { url: () => "return", text: getActionText('return') }
  };

  const handleAction = (id, action, statusId = null) => {
    setSelectedBilling(id);
    setAction(action);
    if (statusId) setIdStatus(statusId);
    setShowConfirmation(true);
  };

  const handleConfirm = async (remarks) => {
    if (!remarks) return;

    try {
      const endpoint = actionMapping[action].url(idStatus);
      const { success, message } = await apiClient.post(
        `/billings/${selectedBilling}/${endpoint}`,
        { remarks }
      );

      if (!success) throw new Error(message || `Gagal ${actionMapping[action].text} permohonan`);

      loadData();
      toast.success(`Permohonan berjaya ${actionMapping[action].text}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        error.response?.status === 401 ? "Sesi anda telah tamat" :
        error.message || `Ralat ${actionMapping[action].text} permohonan`;
      
      toast.error(errorMessage);
    } finally {
      setShowConfirmation(false);
      setSelectedBilling(null);
      setAction(null);
    }
  };

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

      const billingData = data || [];

      setActiveItems(billingData);
      setCountActive(billingData.length);
    } catch (error) {
      let errorMessage =
        error.message || "Ralat mendapatkan data. Sila cuba sebentar lagi.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewHistory = async (id) => {
    try {
      const { success, message, data } = await apiClient.get(`/billings/${id}/history`);
      if (!success) {
        throw new Error(message || "Gagal mendapatkan sejarah permohonan");
      }
      setBillingHistory(data);
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

  const columns = [
    {
      name: "Tarikh Permohonan",
      field: "issued_at",
      render: (item) => item.issued_at ? format(parseISO(item.issued_at), "dd/MM/yyyy") : "-"
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
          <button
            onClick={() => handleAction(item.id, 'approve', item.status_id)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
          >
            <CheckIcon size={16} className="mr-1" />
            {getActionText('approve')}
          </button>
          <button
            onClick={() => handleAction(item.id, 'reject')}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center"
          >
            <Trash2 size={16} className="mr-1" />
            {getActionText('reject')}
          </button>
          <button
            onClick={() => handleAction(item.id, 'return')}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 flex items-center"
          >
            <Pencil size={16} className="mr-1" />
            {getActionText('return')}
          </button>
          <button
            onClick={() => handleViewHistory(item.id)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
          >
            <History size={16} className="mr-1" />
            Sejarah
          </button>
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
              oClassTable: "min-w-full divide-y divide-gray-200"
            }}
          />

          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => {
              setShowConfirmation(false);
              setSelectedBilling(null);
              setAction(null);
            }}
            onConfirm={handleConfirm}
            title={getActionText(action, 'noun')}
            message={` ${getActionText(action, 'reason')}:`}
            confirmText={getActionText(action)}
          />
          <BillingHistoryModal
            isOpen={showHistory}
            onClose={() => {
              setShowHistory(false);
              setBillingHistory([]);
            }}
            history={billingHistory}
          />
        </div>
      </div>
    </PageComponent>
  );
}

export default BillingTableFinance;
