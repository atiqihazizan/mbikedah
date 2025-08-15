import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import apiClient from "../../utils/axios";
import UserModal from "./UserModal";

import DataTable from "../../components/DataTable";

/**
 * User Management Component
 * Admin component for managing users with API integration
 */
const UserManagement = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    department_id: "",
    abilities: [],
    is_active: true
  });

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

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleCreateUser = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      phone: "",
      department_id: "",
      abilities: [],
      is_active: true
    });
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      department_id: user.department_id || "",
      abilities: user.abilities || [],
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update existing user
        await apiClient.put(`/users/${selectedUser.id}`, formData);
      } else {
        // Create new user
        await apiClient.post("/users", formData);
      }
      setShowUserModal(false);
      fetchUsers(); // Refresh users list
    } catch (error) {
      setError("Failed to save user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiClient.delete(`/users/${userId}`);
        fetchUsers(); // Refresh users list
      } catch (error) {
        setError("Failed to delete user");
      }
    }
  };

  // Handle search term changes
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleCreateDepartment = () => {
    setShowDepartmentModal(true);
  };

  // Define columns for DataTable
  const columns = [
    {
      key: "user",
      label: "User",
      render: (value, user) => (
        <div className="flex items-center whitespace-nowrap">
          <div className="flex-shrink-0 h-10 w-10">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
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
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value, user) => (
        <div className="whitespace-nowrap">
          <span className={`inline-flex text-xs font-semibold rounded-full ${
            isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
          }`}>
            {user.department || 'No Department'}
          </span>
        </div>
      ),
    },
    {
      key: "abilities",
      label: "Abilities",
      render: (value, user) => (
        <div className="whitespace-nowrap">
          <div className="flex flex-wrap gap-1">
            {user.abilities?.map((ability, index) => (
              <span
                key={index}
                className={`inline-flex text-xs font-semibold rounded-full ${getAbilityBadgeColor(ability)}`}
              >
                {ability}
              </span>
            )) || 'No abilities'}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, user) => (
        <div className="whitespace-nowrap">
          <span className={`inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(user.is_active)}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, user) => (
        <div className="whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEditUser(user)}
              className={`text-blue-600 hover:text-blue-900 ${
                isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'
              }`}
            >
              Edit
            </button>
            <button 
              onClick={() => handleDeleteUser(user.id)}
              className={`text-red-600 hover:text-red-900 ${
                isDark ? 'hover:text-red-400' : 'hover:text-red-900'
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage system users and their roles
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
              onChange={(e) => handleSearchChange(e.target.value)}
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

            <button 
              onClick={handleCreateUser}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
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
            tableId="users-table"
            itemsPerPage={10}
            externalSearchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            showSearch={false}
            className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md overflow-hidden`}
            thClassName={`${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider`}
            textAlign="left"
          />
        )}

      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onSubmit={handleSubmitUser}
          formData={formData}
          setFormData={setFormData}

          selectedUser={selectedUser}
          isDark={isDark}
        />
      )}


    </div>
  );
};

export default UserManagement;

