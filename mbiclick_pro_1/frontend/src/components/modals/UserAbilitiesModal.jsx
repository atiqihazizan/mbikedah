import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axios';
import { USER_ABILITIES_NAMES } from '../../utils/constants';

export default function UserAbilitiesModal({ user, show = false, onClose }) {
  const [selectedAbilities, setSelectedAbilities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.abilities && Array.isArray(user.abilities)) {
      setSelectedAbilities(user.abilities);
    }
  }, [user]);

  const handleAbilityToggle = (abilityId) => {
    setSelectedAbilities((prev) => {
      if (prev.includes(abilityId)) {
        return prev.filter((id) => id !== abilityId);
      }
      return [...prev, abilityId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put(`/users/${user.id}/abilities`, {
        abilities: selectedAbilities,
      });

      if (response.data.success) {
        toast.success('Peranan pengguna telah dikemaskini');
        onClose();
      } else {
        toast.error(response.data.message || 'Ralat semasa mengemaskini peranan');
      }
    } catch (error) {
      console.error('Ralat:', error);
      toast.error(error.response?.data?.message || 'Ralat semasa mengemaskini peranan');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Kemaskini Peranan Pengguna</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <p className="font-medium mb-2">Nama: {user?.name}</p>
              <p className="text-sm text-gray-600 mb-4">Email: {user?.email}</p>
            </div>

            <div className="space-y-2">
              <p className="font-medium mb-2">Pilih Peranan:</p>
              {Object.entries(USER_ABILITIES_NAMES).map(([id, name]) => (
                <label
                  key={id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAbilities.includes(Number(id))}
                    onChange={() => handleAbilityToggle(Number(id))}
                    className="rounded text-blue-600"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sedang dikemaskini...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
