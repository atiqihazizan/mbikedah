import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import apiClient from "../../utils/axios";
import DataTable from "../../components/DataTable";

/**
 * Role Management Component
 * Admin component for managing user roles and abilities
 */
const RoleManagement = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAbilityModal, setShowAbilityModal] = useState(false);
  const [selectedAbilities, setSelectedAbilities] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };



  const availableAbilities = [
    { id: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800', description: 'Full system access' },
    { id: 'finance', label: 'Finance', color: 'bg-green-100 text-green-800', description: 'Financial operations' },
    { id: 'hod', label: 'Head of Department', color: 'bg-purple-100 text-purple-800', description: 'Department management' },
    { id: 'applicant', label: 'Applicant', color: 'bg-blue-100 text-blue-800', description: 'Basic user access' }
  ];

  const getAbilityBadgeColor = (ability) => {
    const abilityColors = {
      'admin': 'bg-red-100 text-red-800',
      'finance': 'bg-green-100 text-green-800',
      'hod': 'bg-purple-100 text-purple-800',
      'applicant': 'bg-blue-100 text-blue-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return abilityColors[ability] || abilityColors.default;
  };

  const handleEditAbilities = (user) => {
    setSelectedUser(user);
    setSelectedAbilities(user.abilities || []);
    setShowAbilityModal(true);
  };

  const handleAbilityToggle = (ability) => {
    setSelectedAbilities(prev => 
      prev.includes(ability)
        ? prev.filter(a => a !== ability)
        : [...prev, ability]
    );
  };

  const handleSaveAbilities = async () => {
    try {
      await apiClient.put(`/users/${selectedUser.id}/abilities`, {
        abilities: selectedAbilities
      });
      setShowAbilityModal(false);
      onRefresh(); // Refresh users list
    } catch (error) {
      setError('Failed to update user abilities');
    }
  };

  const getAbilityDescription = (ability) => {
    const found = availableAbilities.find(a => a.id === ability);
    return found ? found.description : 'No description available';
  };

  // Define columns for DataTable
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (value, user) => (
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          }`}>
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.name || 'N/A'}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {user.username || 'N/A'} • {user.email || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'abilities',
      label: 'Current Abilities',
      render: (value, user) => (
        <div className="flex flex-wrap gap-2">
          {user.abilities && user.abilities.length > 0 ? (
            user.abilities.map((ability, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAbilityBadgeColor(ability)}`}>
                  {ability}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getAbilityDescription(ability)}
                </span>
              </div>
            ))
          ) : (
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No abilities assigned
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, user) => (
        <button
          onClick={() => handleEditAbilities(user)}
          className={`text-blue-600 hover:text-blue-900 ${
            isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'
          }`}
        >
          Edit Abilities
        </button>
      )
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Role Management
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage user roles, abilities, and permissions
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              Refresh Users
            </button>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            isDark={isDark}
            tableId="role-management-table"
            itemsPerPage={10}
            externalSearchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={false}
            className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md overflow-hidden`}
            thClassName={`${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
            textAlign="left"
          />
        )}

      </div>

      {/* Ability Management Modal */}
      {showAbilityModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAbilityModal(false)}
            ></div>

            {/* Modal panel */}
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Manage Abilities for {selectedUser.name}
                  </h3>
                  <button
                    onClick={() => setShowAbilityModal(false)}
                    className={`rounded-md p-2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Select the abilities you want to assign to this user:
                </p>
                
                <div className="space-y-3">
                  {availableAbilities.map((ability) => (
                    <label key={ability.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAbilities.includes(ability.id)}
                        onChange={() => handleAbilityToggle(ability.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ability.color}`}>
                            {ability.label}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {ability.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAbilityModal(false)}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAbilities}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
