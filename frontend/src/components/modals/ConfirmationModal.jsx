import React, { useState } from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Tidak' }) {
  if (!isOpen) return null;

  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <textarea
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Masukkan komen..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(comment)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
