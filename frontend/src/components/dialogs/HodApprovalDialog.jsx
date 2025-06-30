import { useState } from 'react';
import { 
  FaExclamationTriangle,
  FaTimes,
  FaThumbsUp,
  FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../config/format';
import apiClient from '../../utils/axios';

function HodApprovalDialog({ 
  showModal, 
  selectedBilling, 
  onCloseModal,
  onApprovalSuccess // Callback untuk refresh data di parent
}) {
  const [approvalComment, setApprovalComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  if (!showModal || !selectedBilling) return null;
  
  const isSelectedBillingUrgent = selectedBilling && selectedBilling.days_pending_display && 
    parseInt(selectedBilling.days_pending_display.match(/(\d+)/)?.[1] || '0') > 3;

  // Function untuk handle approval - dipindahkan dari BillingTableHOD
  const handleConfirmApproval = async () => {
    if (!selectedBilling) return;

    try {
      setIsApproving(true);

      const response = await apiClient.post(`/billings/${selectedBilling.id}/hod-approve`, {
        remarks: approvalComment.trim() || "Diluluskan oleh Ketua Jabatan"
      });

      if (response.data.success || response.status === 200) {
        setApprovalSuccess(true);
        toast.success('Permohonan berjaya diluluskan');
        
        // Tunggu sebentar untuk show success state
        setTimeout(() => {
          handleCloseModal();
          // Callback untuk refresh data di parent
          if (onApprovalSuccess) {
            onApprovalSuccess();
          }
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Ralat tidak diketahui');
      }
    } catch (error) {
      console.error('Error approving billing:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Ralat semasa meluluskan permohonan'
      );
      setIsApproving(false);
    }
  };

  const handleCloseModal = () => {
    if (!isApproving) {
      setApprovalComment("");
      setIsApproving(false);
      setApprovalSuccess(false);
      onCloseModal();
    }
  };

  // Render different button states
  const renderApprovalButton = () => {
    if (approvalSuccess) {
      return (
        <button disabled className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md disabled:opacity-75 flex items-center space-x-2">
          <FaCheckCircle className="w-4 h-4" />
          <span>Berjaya Diluluskan!</span>
        </button>
      );
    }
    
    if (isApproving) {
      return (
        <button disabled className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md disabled:opacity-75 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Memproses...</span>
        </button>
      );
    }
    
    return (
      <button
        onClick={handleConfirmApproval}
        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md flex items-center space-x-2 ${
          isSelectedBillingUrgent 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <FaThumbsUp className="w-4 h-4" />
        <span>{isSelectedBillingUrgent ? 'Luluskan Segera' : 'Luluskan'}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>

      <div className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${isSelectedBillingUrgent ? 'ring-2 ring-red-500' : ''}`}>

        {approvalSuccess && (
          <div className="absolute inset-0 bg-green-50 bg-opacity-95 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800">Permohonan Diluluskan!</h3>
              <p className="text-sm text-green-600">Memuat kembali data...</p>
            </div>
          </div>
        )}
        
        {isSelectedBillingUrgent && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">Permohonan Mendesak</p>
                <p className="text-xs text-red-600">
                  Telah tertunggak selama {selectedBilling.days_pending_display}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isSelectedBillingUrgent ? 'text-red-800' : 'text-gray-900'}`}>
            Kelulusan Ketua Jabatan
            {isSelectedBillingUrgent && <span className="text-red-600 ml-2">(Mendesak)</span>}
          </h3>
          <button
            onClick={handleCloseModal}
            disabled={isApproving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className={`rounded-lg p-4 mb-4 ${isSelectedBillingUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <div className="text-sm space-y-2">
            <div><span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}</div>
            <div><span className="font-medium">Pemohon:</span> {selectedBilling.creator?.name || selectedBilling.creator}</div>
            <div><span className="font-medium">Penerima:</span> {selectedBilling.recipient}</div>
            <div><span className="font-medium">Jumlah:</span> {formatCurrency(selectedBilling.total_amount)}</div>
            <div><span className="font-medium">Tarikh Permohonan:</span> {selectedBilling.issued_at}</div>
            <div>
              <span className="font-medium">Hari Tertunggak:</span> 
              <span className={`ml-1 font-bold ${isSelectedBillingUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                {selectedBilling.days_pending_display}
              </span>
            </div>
          </div>
        </div>

        {isSelectedBillingUrgent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Amaran:</strong> Permohonan ini telah melebihi 3 hari dan memerlukan tindakan segera.
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan Kelulusan {isSelectedBillingUrgent ? '(Disyorkan untuk permohonan mendesak)' : '(pilihan)'}:
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder={isSelectedBillingUrgent ? "Sila nyatakan catatan untuk permohonan mendesak ini..." : "Masukkan catatan kelulusan jika perlu..."}
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            disabled={isApproving}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCloseModal}
            disabled={isApproving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          {renderApprovalButton()}
        </div>

      </div>
    </div>
  );
}

export default HodApprovalDialog;