import { 
  FaExclamationTriangle,
  FaTimes,
  FaUndo,
  FaCheckCircle
} from 'react-icons/fa';
import { formatCurrency } from '../../config/format';

function HodReturnDialog({ 
  showModal, 
  selectedBilling, 
  returnComment, 
  setReturnComment,
  isReturning, // Can be true, false, or 'success'
  onConfirmReturn,
  onCloseModal 
}) {
  if (!showModal || !selectedBilling) return null;
  
  const isSelectedBillingUrgent = selectedBilling && selectedBilling.days_pending > 3;

  // Render different button states
  const renderReturnButton = () => {
    if (isReturning === 'success') {
      return (
        <button 
          disabled 
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md disabled:opacity-75 flex items-center space-x-2"
        >
          <FaCheckCircle className="w-4 h-4" />
          <span>Berjaya Dikembalikan!</span>
        </button>
      );
    }
    
    if (isReturning === true) {
      return (
        <button 
          disabled 
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md disabled:opacity-75 flex items-center space-x-2"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Memproses...</span>
        </button>
      );
    }
    
    return (
      <button
        onClick={onConfirmReturn}
        disabled={!returnComment.trim()}
        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <FaUndo className="w-4 h-4" />
        <span>Kembalikan untuk Pembetulan</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={isReturning ? undefined : onCloseModal}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ring-2 ring-orange-500">

        {/* Success overlay */}
        {isReturning === 'success' && (
          <div className="absolute inset-0 bg-orange-50 bg-opacity-95 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaCheckCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800">Permohonan Dikembalikan!</h3>
              <p className="text-sm text-orange-600">Pemohon akan menerima notifikasi untuk pembetulan...</p>
            </div>
          </div>
        )}
        
        {/* Urgent warning - untuk return */}
        {isSelectedBillingUrgent && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-orange-700 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-900">Permohonan Mendesak - Pembetulan Diperlukan</p>
                <p className="text-xs text-orange-700">
                  Telah tertunggak selama {selectedBilling.days_pending} hari - pastikan pembetulan dapat dilakukan dengan segera
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orange-800">
            Kembalikan untuk Pembetulan
            {isSelectedBillingUrgent && <span className="text-orange-600 ml-2">(Mendesak)</span>}
          </h3>
          <button
            onClick={onCloseModal}
            disabled={isReturning}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Billing details */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-2">
            <div><span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}</div>
            <div><span className="font-medium">Pemohon:</span> {selectedBilling.creator?.name || selectedBilling.creator}</div>
            <div><span className="font-medium">Penerima:</span> {selectedBilling.recipient}</div>
            <div><span className="font-medium">Jumlah:</span> {formatCurrency(selectedBilling.total_amount)}</div>
            <div><span className="font-medium">Tarikh Permohonan:</span> {selectedBilling.issued_at || selectedBilling.created_at}</div>
            <div>
              <span className="font-medium">Hari Tertunggak:</span> 
              <span className={`ml-1 font-bold ${isSelectedBillingUrgent ? 'text-orange-600' : 'text-gray-900'}`}>
                {selectedBilling.days_pending_display}
              </span>
            </div>
          </div>
        </div>

        {/* Info box about return process */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <FaUndo className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Proses Pemulangan</p>
              <p className="text-xs text-blue-700 mt-1">
                Permohonan akan dikembalikan kepada pemohon untuk pembetulan. Pemohon akan menerima notifikasi dan boleh mengemukakan semula selepas pembetulan.
              </p>
            </div>
          </div>
        </div>

        {/* Urgent return warning */}
        {isSelectedBillingUrgent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Permohonan ini telah tertunggak lebih 3 hari. Sila pastikan arahan pembetulan adalah jelas supaya pemohon dapat menyelesaikan dengan segera.
            </p>
          </div>
        )}

        {/* Required comment field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arahan Pembetulan <span className="text-red-500">*</span>
            {isSelectedBillingUrgent && <span className="text-orange-600"> (Perlu jelas dan spesifik)</span>}:
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows="4"
            placeholder={isSelectedBillingUrgent 
              ? "Sila nyatakan dengan jelas apa yang perlu diperbaiki supaya pemohon dapat menyelesaikan dengan segera..." 
              : "Sila nyatakan secara terperinci apa yang perlu diperbaiki atau dilengkapkan..."
            }
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            disabled={isReturning}
            required
          />
          {!returnComment.trim() && (
            <p className="text-xs text-red-500 mt-1">Arahan pembetulan adalah wajib</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Contoh: "Sila lampirkan resit asal", "Maklumat penerima tidak lengkap", "Jumlah tidak sepadan dengan dokumen sokongan"
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCloseModal}
            disabled={isReturning}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          {renderReturnButton()}
        </div>

      </div>
    </div>
  );
}

export default HodReturnDialog;