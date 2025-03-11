import { useState, useEffect, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Check, CheckIcon, Pencil, Trash2, History } from "lucide-react";
import { toast } from "react-toastify";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import BillingHistoryModal from "../../components/modals/BillingHistoryModal";

function BillingHODTable() {
  const { setCountActive } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [activeItems, setActiveItems] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [action, setAction] = useState(null); // 'reject' atau 'return'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const isReady = useRef(false);

  const handleApprove = (id) => {
    setSelectedBilling(id); // Simpan ID permohonan
    setAction("approve"); // Tetapkan tindakan
    setShowConfirmation(true); // Tunjukkan modal pengesahan
  };

  const handleReject = async (id) => {
    setSelectedBilling(id);
    setAction("reject");
    setShowConfirmation(true);

    try {
      const { success, message } = await apiClient.post(
        `/billings/${id}/reject`,
        {
          remarks,
        }
      );

      if (!success) {
        throw new Error(message || "Gagal menolak permohonan");
      }

      // Tunjuk notifikasi berjaya
      toast.success("Permohonan berjaya ditolak");

      // Refresh data
      loadData();
    } catch (error) {
      let errorMessage;
      if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      } else if (error.response?.status === 403) {
        errorMessage =
          error.response.data?.message ||
          "Anda tidak mempunyai kebenaran untuk menolak permohonan ini.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message || "Permohonan ini tidak boleh ditolak";
      } else if (error.response?.status === 422) {
        errorMessage =
          error.response.data?.message || "Sila nyatakan sebab penolakan";
      } else {
        errorMessage =
          error.message || "Ralat menolak permohonan. Sila cuba sebentar lagi.";
      }
      console.error("Error:", errorMessage);
    }
  };

  const handleReturn = async (id) => {
    setSelectedBilling(id);
    setAction("return");
    setShowConfirmation(true);

    try {
      const { success, message } = await apiClient.post(
        `/billings/${id}/return`,
        {
          remarks,
        }
      );

      if (!success) {
        throw new Error(message || "Gagal memulangkan permohonan");
      }

      // Tunjuk notifikasi berjaya
      toast.success("Permohonan berjaya dipulangkan");

      // Refresh data
      loadData();
    } catch (error) {
      let errorMessage;
      if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      } else if (error.response?.status === 403) {
        errorMessage =
          error.response.data?.message ||
          "Anda tidak mempunyai kebenaran untuk memulangkan permohonan ini.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          "Permohonan ini tidak boleh dipulangkan";
      } else if (error.response?.status === 422) {
        errorMessage =
          error.response.data?.message || "Sila nyatakan sebab pemulangan";
      } else {
        errorMessage =
          error.message ||
          "Ralat memulangkan permohonan. Sila cuba sebentar lagi.";
      }
      console.error("Error:", errorMessage);
    }
  };

  const handleConfirm = async (remarks) => {
    if (!remarks) return;

    try {
      const endpoint =
        action === "reject"
          ? "reject"
          : action === "approve"
          ? "hod-approve"
          : "return";
      const res = await apiClient.post(
        `/billings/${selectedBilling}/${endpoint}`,
        {
          remarks: remarks, // Hantar komen yang dimasukkan oleh pengguna
        }
      );
      const { success, message } = res;
      console.log(res);

      if (!success) {
        throw new Error(
          message ||
            `Gagal ${
              action === "reject"
                ? "menolak"
                : action === "approve"
                ? "mengesahkan"
                : "memulangkan"
            } permohonan`
        );
      }

      // Refresh data selepas berjaya
      loadData();
      setShowConfirmation(false); // Tutup modal
      setSelectedBilling(null); // Reset ID
      setAction(null); // Reset tindakan
      toast.success(
        `Permohonan berjaya ${
          action === "reject"
            ? "ditolak"
            : action === "approve"
            ? "disahkan"
            : "dipulangkan"
        }`
      );
    } catch (error) {
      console.log(error)
      let errorMessage;
      if (error.message === "Tiada response dari server") {
        errorMessage =
          "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi anda telah tamat. Sila log masuk semula.";
      } else if (error.response?.status === 403) {
        errorMessage =
          error.response.data?.message ||
          `Anda tidak mempunyai kebenaran untuk ${
            action === "reject"
              ? "menolak"
              : action === "approve"
              ? "mengesahkan"
              : "memulangkan"
          } permohonan ini.`;
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          `Permohonan ini tidak boleh ${
            action === "reject"
              ? "ditolak"
              : action === "approve"
              ? "disahkan"
              : "dipulangkan"
          }`;
      } else if (error.response?.status === 422) {
        errorMessage =
          error.response.data?.message ||
          `Sila nyatakan sebab ${
            action === "reject"
              ? "penolakan"
              : action === "approve"
              ? "pengesahan"
              : "pemulangan"
          }`;
      } else {
        errorMessage =
          error.message ||
          `Ralat ${
            action === "reject"
              ? "menolak"
              : action === "approve"
              ? "mengesahkan"
              : "memulangkan"
          } permohonan. Sila cuba sebentar lagi.`;
      }
      toast.error(errorMessage);
    } finally {
      setShowConfirmation(false);
      setSelectedBilling(null);
      setAction(null);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { success, message, data } = await apiClient.get(
        "/billings/pending-approvals"
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

  return (
    <PageComponent title="Permohonan Untuk Pengesahan">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
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
                      {item.issued_at
                        ? format(parseISO(item.issued_at), "dd/MM/yyyy")
                        : "-"}
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
                      item.status_name === "Draft"
                        ? "bg-gray-100 text-gray-800"
                        : item.status_name === "Diluluskan"
                        ? "bg-green-100 text-green-800"
                        : item.status_name === "Ditolak"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                      >
                        {item.status_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.created_at
                        ? format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                        >
                          <CheckIcon size={16} className="mr-1" />
                          Sahkan
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Tolak
                        </button>
                        <button
                          onClick={() => handleReturn(item.id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 flex items-center"
                        >
                          <Pencil size={16} className="mr-1" />
                          Pulang
                        </button>
                        <button
                          onClick={() => handleViewHistory(item.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
                        >
                          <History size={16} className="mr-1" />
                          Sejarah
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

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => {
              setShowConfirmation(false);
              setSelectedBilling(null);
              setAction(null);
            }}
            onConfirm={(remarks) => handleConfirm(remarks)}
            title={
              action === "reject"
                ? "Tolak Permohonan"
                : action === "approve"
                ? "Sahkan Permohonan"
                : "Kembali kepada Permohonan"
            }
            message={` ${
              action === "reject"
                ? "Sila nyatakan sebab penolakan"
                : action === "approve"
                ? "Masukkan catatan"
                : "Sila nyatakan sebab pemulangan"
            }:`}
            confirmText={
              action === "reject"
                ? "Tolak"
                : action === "approve"
                ? "Sahkan"
                : "Pulang"
            }
          />
          {/* History Modal */}
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

export default BillingHODTable;
