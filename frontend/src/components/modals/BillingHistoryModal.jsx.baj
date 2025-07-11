import React from 'react';
import { format, parseISO } from 'date-fns';

export default function BillingHistoryModal({ isOpen, onClose, history = [] }) {
  if (!isOpen) return null;

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Diluluskan':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      case 'Dipulangkan':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Sejarah Permohonan</h2>

        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tiada sejarah permohonan</p>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {history.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== history.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              getStatusBadgeColor(event.status_name).includes('green')
                                ? 'bg-green-500'
                                : getStatusBadgeColor(event.status_name).includes('red')
                                ? 'bg-red-500'
                                : getStatusBadgeColor(event.status_name).includes('yellow')
                                ? 'bg-yellow-500'
                                : 'bg-gray-500'
                            }`}
                          >
                            <span className="text-white text-sm">{event.status_name[0]}</span>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              Status diubah kepada{' '}
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(event.status_name)}`}>
                                {event.status_name}
                              </span>
                            </p>
                            {event.remarks && (
                              <p className="mt-1 text-sm text-gray-600">{event.remarks}</p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={event.created_at}>
                              {format(parseISO(event.created_at), 'dd/MM/yyyy HH:mm')}
                            </time>
                            <p className="text-xs text-gray-400">{event.user_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
