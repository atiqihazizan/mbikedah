import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const abilityColors = {
  1: 'bg-red-100 text-red-800',     // Admin
  2: 'bg-blue-100 text-blue-800',   // Pemohon
  3: 'bg-green-100 text-green-800', // HOD
  4: 'bg-yellow-100 text-yellow-800', // Penyemak
  5: 'bg-purple-100 text-purple-800', // Pengesah
  6: 'bg-pink-100 text-pink-800',   // Pelulus
  7: 'bg-gray-100 text-gray-800',   // Pembayar
};

export default function UserAbilitiesBadge() {
  const { currentUser } = useStateContext();

  if (!currentUser?.abilities || !Array.isArray(currentUser.abilities)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentUser.abilities.map((ability) => (
        <span
          key={ability}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${abilityColors[ability] || 'bg-gray-100 text-gray-800'}`}
        >
          {currentUser.ability_names?.[ability - 1] || `Peranan ${ability}`}
        </span>
      ))}
    </div>
  );
}
