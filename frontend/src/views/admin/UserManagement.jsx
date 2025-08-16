import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import apiClient from "../../utils/axios";
import UserModal from "./UserModal";
import { getAbilityName, getAbilityColor } from "../../utils/constants";

import DataTable from "../../components/DataTable";

/**
 * User Management Component
 * Admin component for managing users with API integration
 */
const UserManagement = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
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
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");

      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await apiClient.get("/departments");
      if (response?.data && response?.data?.length > 0) {
        setDepartments(response.data);
      } else {
        console.error("Failed to fetch departments:", response.message);
        setDepartments([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setDepartments([]); // Set empty array as fallback
    } finally {
      setIsLoadingDepartments(false);
    }
  };


  const getAbilityBadgeColor = (ability) => {
    return getAbilityColor(ability);
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
        const response = await apiClient.put(`/users/${selectedUser.id}`, formData);
        if (response.success) {
          setShowUserModal(false);
          fetchUsers(); // Refresh users list
        } else {
          console.error("Failed to update user:", response.message);
        }
      } else {
        // Create new user
        const response = await apiClient.post("/users", formData);
        if (response.success) {
          setShowUserModal(false);
          fetchUsers(); // Refresh users list
        } else {
          console.error("Failed to create user:", response.message);
        }
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await apiClient.delete(`/users/${userId}`);
        if (response.success) {
          fetchUsers(); // Refresh users list
        } else {
          console.error("Failed to delete user:", response.message);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
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

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    try {
      const response = await apiClient.put(`/users/${user.id}/toggle-status`, {
        is_active: newStatus
      });

      if (response.success) {
        // Update local state immediately for better UX
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u => {
            if (u.id === user.id) {
              const updatedUser = { ...u, is_active: newStatus };
              return updatedUser;
            }
            return u;
          });
          return updatedUsers;
        });

      } else {
        // Handle error from backend
        const errorMessage = response.message || `Failed to ${action} user`;
        console.error(`Failed to ${action} user:`, errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error occurred while trying to ${action} user:`, error);

      // Handle different types of errors
      let errorMessage = `Failed to ${action} user`;

      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else if (error.response.status === 400) {
          errorMessage = "Bad request - Invalid data or operation not allowed";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (error.response.status === 403) {
          errorMessage = "Forbidden - You don't have permission";
        } else if (error.response.status === 404) {
          errorMessage = "User not found";
        } else if (error.response.status === 500) {
          errorMessage = "Server error - Please try again later";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server - Please check your connection";
      } else {
        // Something else happened
        errorMessage = error.message || `Failed to ${action} user`;
      }

      alert(`Error: ${errorMessage}`);
    }
  };

  // Filter users based on search term and exclude admin users
  const getFilteredUsers = () => {
    let filtered = users;

    // Filter out admin users - admin tidak perlu dikemaskini
    filtered = filtered.filter(user => {
      // Exclude users with admin abilities or specific admin usernames
      const hasAdminAbility = user.abilities && user.abilities.includes('admin');
      const isAdminUser = user.username === 'admin' || user.username === 'superuser';
      return !hasAdminAbility && !isAdminUser;
    });

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.employee_id?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Get filtered users
  const filteredUsers = getFilteredUsers();

  // Define columns for DataTable
  const columns = [
    {
      key: "user",
      label: "User",
      render: (value, user) => (
        <div className="flex items-center whitespace-nowrap">
          <div className="flex-shrink-0 h-10 w-10">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
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
          <span className={`inline-flex text-xs font-semibold rounded-full ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
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
                className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getAbilityBadgeColor(ability)}`}
              >
                {getAbilityName(ability) || ability}
              </span>
            )) || 'No abilities'}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, user) => {
        const isCurrentUser = user.id === currentUser?.id;

        return (
          <div className="whitespace-nowrap">
          <button
            onClick={() => handleToggleStatus(user)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              user.is_active
                ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 hover:border-green-300'
                : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 hover:border-red-300'
            }`}
            title={user.is_active ? 'Click to deactivate' : 'Click to activate'}
          >
            {/* Status Icon */}
            {user.is_active ? (
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            
            {/* Status Text */}
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, user) => {
        const isCurrentUser = user.id === currentUser?.id;

        return (
          <div className="whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditUser(user)}
                className={`text-blue-600 hover:text-blue-900 ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'
                  }`}
                title="Edit User"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className={`text-red-600 hover:text-red-900 ${isDark ? 'hover:text-red-400' : 'hover:text-red-900'
                  }`}
                title="Delete User"
                disabled={!user.is_active || isCurrentUser}
              >
                Delete
              </button>
            </div>
          </div>
        );
      },
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
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
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
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
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
            data={filteredUsers}
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
      {showUserModal && !isLoadingDepartments && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onSubmit={handleSubmitUser}
          formData={formData}
          setFormData={setFormData}
          departments={departments}
          selectedUser={selectedUser}
          isDark={isDark}
        />
      )}

      {/* Loading Modal for Departments */}
      {showUserModal && isLoadingDepartments && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full bg-white">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-700">Loading departments...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserManagement;

