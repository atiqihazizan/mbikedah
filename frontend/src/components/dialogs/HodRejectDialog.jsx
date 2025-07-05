import { useState } from 'react';
import { 
  FaExclamationTriangle,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../config/format';
import apiClient from '../../utils/axios';
import TButton from '../Core/TButton';

function HodRejectDialog({ 
  showModal, 
  selectedBilling, 
  onCloseModal,
  onRejectSuccess // Callback untuk refresh data dari parent
}) {
  // Internal state management
  const [rejectComment, setRejectComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false); // Can be true, false, or 'success'

  if (!showModal || !selectedBilling) return null;
  
  const isSelectedBillingUrgent = selectedBilling && selectedBilling.days_pending > 3;

  // Reset state when modal opens/closes
  const handleCloseModal = () => {
    if (!isRejecting) {
      setRejectComment("");
      setIsRejecting(false);
      onCloseModal();
    }
  };

  // Handle reject confirmation with API call
  const handleConfirmReject = async () => {
    if (!rejectComment.trim()) return;
    
    try {
      setIsRejecting(true);
      
      const response = await apiClient.post(`/billings/${selectedBilling.id}/reject`, {
        remarks: rejectComment.trim()
      });
      
      if (response.success) {
        setIsRejecting('success');
        toast.success('Permohonan berjaya ditolak');
        
        // Auto close after 2 seconds and notify parent
        setTimeout(() => {
          handleCloseModal();
          if (onRejectSuccess) {
            onRejectSuccess();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error rejecting billing:', error);
      setIsRejecting(false);
      toast.error(error.response?.data?.message || 'Ralat semasa menolak permohonan');
    }
  };

  // Render different button states
  const renderRejectButton = () => {
    if (isRejecting === 'success') {
      return (
        <TButton 
          color="red" 
          variant="solid"
          isDisable={true}
          className="flex items-center space-x-2"
        >
          <FaCheckCircle className="w-4 h-4" />
          <span>Berjaya Ditolak!</span>
        </TButton>
      );
    }
    
    if (isRejecting === true) {
      return (
        <TButton 
          color="red" 
          variant="solid"
          onChecking={true}
        >
          Memproses...
        </TButton>
      );
    }
    
    return (
      <TButton
        color="red"
        variant="solid"
        onClick={handleConfirmReject}
        isDisable={!rejectComment.trim()}
        className="flex items-center space-x-2"
      >
        <FaTimes className="w-4 h-4" />
        <span>Tolak Permohonan</span>
      </TButton>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={isRejecting ? undefined : handleCloseModal}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ring-2 ring-red-500">

        {/* Success overlay */}
        {isRejecting === 'success' && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-95 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaCheckCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800">Permohonan Ditolak!</h3>
              <p className="text-sm text-red-600">Memuat kembali data...</p>
            </div>
          </div>
        )}
        
        {/* Urgent warning - lebih prominent untuk reject */}
        {isSelectedBillingUrgent && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-700 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-900">Permohonan Mendesak - Tolak dengan Berhati-hati</p>
                <p className="text-xs text-red-700">
                  Telah tertunggak selama {selectedBilling.days_pending} hari
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-800">
            Tolak Permohonan
            {isSelectedBillingUrgent && <span className="text-red-600 ml-2">(Mendesak)</span>}
          </h3>
          <button
            onClick={handleCloseModal}
            disabled={isRejecting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Billing details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-2">
            <div><span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}</div>
            <div><span className="font-medium">Pemohon:</span> {selectedBilling.creator?.name || selectedBilling.creator}</div>
            <div><span className="font-medium">Penerima:</span> {selectedBilling.recipient}</div>
            <div><span className="font-medium">Jumlah:</span> {formatCurrency(selectedBilling.total_amount)}</div>
            <div><span className="font-medium">Tarikh Permohonan:</span> {selectedBilling.issued_at || selectedBilling.created_at}</div>
            <div>
              <span className="font-medium">Hari Tertunggak:</span> 
              <span className={`ml-1 font-bold ${isSelectedBillingUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                {selectedBilling.days_pending_display}
              </span>
            </div>
          </div>
        </div>

        {/* Extra warning for urgent rejections */}
        {isSelectedBillingUrgent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Amaran:</strong> Permohonan ini telah tertunggak lebih 3 hari. Pastikan sebab penolakan adalah sah dan munasabah.
            </p>
          </div>
        )}

        {/* Required comment field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sebab Penolakan <span className="text-red-500">*</span>
            {isSelectedBillingUrgent && <span className="text-red-600"> (Wajib untuk permohonan mendesak)</span>}:
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows="4"
            placeholder={isSelectedBillingUrgent 
              ? "Sila nyatakan sebab penolakan yang kukuh untuk permohonan mendesak ini..." 
              : "Sila nyatakan sebab penolakan secara terperinci..."
            }
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            disabled={isRejecting}
            required
          />
          {!rejectComment.trim() && (
            <p className="text-xs text-red-500 mt-1">Sebab penolakan adalah wajib</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <TButton
            variant="outline"
            onClick={handleCloseModal}
            isDisable={isRejecting}
          >
            Batal
          </TButton>
          {renderRejectButton()}
        </div>

      </div>
    </div>
  );
}

export default HodRejectDialog;