import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { getAbilityName, getAbilityColor } from '../utils/constants';

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
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getAbilityColor(ability)}`}
        >
          {getAbilityName(ability)}
        </span>
      ))}
    </div>
  );
}
