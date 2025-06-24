import React from 'react';
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaThumbsUp 
} from 'react-icons/fa';
import { formatCurrency } from '../../config/format';

const FinanceActionDialog = ({isOpen,onClose,selectedBilling,actionType,actionComment,setActionComment,isProcessing,onConfirm}) => {
  if (!isOpen || !selectedBilling) return null;

  const getActionLabel = (type) => {
    switch (type) {
      case 'review': return 'Semak';
      case 'verify': return 'Verifikasi';
      case 'payment': return 'Proses Bayaran';
      default: return 'Proses';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'review': return 'bg-blue-600 hover:bg-blue-700';
      case 'verify': return 'bg-orange-600 hover:bg-orange-700';
      case 'payment': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const isUrgent = selectedBilling && selectedBilling.days_pending > 7;

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleClose}
      ></div>

      <div className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${isUrgent ? 'ring-2 ring-red-500' : ''}`}>
        {isUrgent && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">Permohonan Tertunggak</p>
                <p className="text-xs text-red-600">
                  Telah tertunggak selama {selectedBilling.days_pending_display}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isUrgent ? 'text-red-800' : 'text-gray-900'}`}>
            {getActionLabel(actionType)} Permohonan
            {isUrgent && <span className="text-red-600 ml-2">(Tertunggak)</span>}
          </h3>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className={`rounded-lg p-4 mb-4 ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <div className="text-sm space-y-2">
            <div><span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}</div>
            <div><span className="font-medium">Pemohon:</span> {selectedBilling.creator}</div>
            <div><span className="font-medium">Penerima:</span> {selectedBilling.recipient}</div>
            <div><span className="font-medium">Jumlah:</span> {formatCurrency(selectedBilling.total_amount)}</div>
            <div><span className="font-medium">Status:</span> {selectedBilling.status}</div>
            <div><span className="font-medium">Tarikh Permohonan:</span> {selectedBilling.created_at}</div>
            <div>
              <span className="font-medium">Tempoh Tertunggak:</span> 
              <span className={`ml-1 font-bold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                {selectedBilling.days_pending_display}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan {getActionLabel(actionType)} {isUrgent ? '(Disyorkan untuk permohonan tertunggak)' : '(pilihan)'}:
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder={`Masukkan catatan ${getActionLabel(actionType).toLowerCase()} jika perlu...`}
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${getActionColor(actionType)}`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <FaThumbsUp className="w-4 h-4" />
                <span>{getActionLabel(actionType)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceActionDialog;