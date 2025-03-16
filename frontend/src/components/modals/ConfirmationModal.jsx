import { useState } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../../axios';
import { toast } from 'react-toastify';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmText = 'Ya', 
  cancelText = 'Tidak',
  action,
  setAction,
  endpoint,
  callBack,
}) {
  const [comment, setComment] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleConfirm = async (remarks) => {
    if (!action) return;

    setIsActionLoading(true);
    try {
      const {success,data,message} = await apiClient.post(endpoint, { remarks });
      if (!success) {
        throw new Error(message || `Sila cuba sekali lagi`);
      }
      callBack();
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || `Sila cuba sekali lagi`;
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
      setAction(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 id="modal-title" className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">Catatan {message} (jika perlu):</p>

        <textarea
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Masukkan catatan..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-label="Catatan"
        ></textarea>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLoading}
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 
              ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => handleConfirm()}
            disabled={isActionLoading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 
              ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isActionLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                <span>Memproses...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isLoading: PropTypes.bool
};
