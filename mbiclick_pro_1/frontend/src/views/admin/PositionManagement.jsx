import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import apiClient from "../../utils/axios";
import DataTable from "../../components/DataTable";

/**
 * Position Management Component
 * Admin component for managing job positions
 */
const PositionManagement = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showPositionModal, setShowPositionModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/positions");
      
      if (response.success) {
        setPositions(response.data);
      } else {
        console.error("API returned success: false", response);
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePosition = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true
    });
    setSelectedPosition(null);
    setShowPositionModal(true);
  };

  const handleEditPosition = (position) => {
    setFormData({
      name: position.name || "",
      description: position.description || "",
      is_active: position.is_active !== undefined ? position.is_active : true
    });
    setSelectedPosition(position);
    setShowPositionModal(true);
  };

  const handleSubmitPosition = async (e) => {
    e.preventDefault();

    try {
      if (selectedPosition) {
        // Update existing position
        const response = await apiClient.put(`/positions/${selectedPosition.id}`, formData);
        if (response.success) {
          setShowPositionModal(false);
          fetchPositions(); // Refresh positions list
        } else {
          console.error("Failed to update position:", response.message);
        }
      } else {
        // Create new position
        const response = await apiClient.post("/positions", formData);
        if (response.success) {
          setShowPositionModal(false);
          fetchPositions(); // Refresh positions list
        } else {
          console.error("Failed to create position:", response.message);
        }
      }
    } catch (error) {
      console.error("Failed to save position:", error);
    }
  };

  const handleDeletePosition = async (positionId) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      try {
        const response = await apiClient.delete(`/positions/${positionId}`);
        if (response.success) {
          fetchPositions(); // Refresh positions list
        } else {
          console.error("Failed to delete position:", response.message);
        }
      } catch (error) {
        console.error("Failed to delete position:", error);
      }
    }
  };

  const handleToggleStatus = async (position) => {
    const newStatus = !position.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    try {
      const response = await apiClient.put(`/positions/${position.id}/toggle-status`, {
        is_active: newStatus
      });
      
      if (response.success) {
        // Update local state immediately for better UX
        setPositions(prevPositions => {
          const updatedPositions = prevPositions.map(p => {
            if (p.id === position.id) {
              return { ...p, is_active: newStatus };
            }
            return p;
          });
          return updatedPositions;
        });
      } else {
        console.error(`Failed to ${action} position:`, response.message);
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error(`Error occurred while trying to ${action} position:`, error);
      alert(`Error: Failed to ${action} position`);
    }
  };

  // Filter positions based on search term
  const getFilteredPositions = () => {
    let filtered = positions;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(position =>
        position.name?.toLowerCase().includes(searchLower) ||
        position.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Get filtered positions
  const filteredPositions = getFilteredPositions();

  // Define columns for DataTable
  const columns = [
    {
      key: "name",
      label: "Position Name",
      render: (value, position) => (
        <div className="whitespace-nowrap">
          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {position.name || 'N/A'}
          </div>
        </div>
      ),
      // className: "w-64" // Fixed width for position name
    },
    {
      key: "description",
      label: "Description",
      render: (value, position) => (
        <div className="whitespace-nowrap">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {position.description || 'No description'}
          </span>
        </div>
      ),
      // className: "w-80" // Fixed width for description
    },
    {
      key: "status",
      label: "Status",
      render: (value, position) => (
        <div className="whitespace-nowrap">
          <button
            onClick={() => handleToggleStatus(position)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              position.is_active
                ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 hover:border-green-300'
                : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 hover:border-red-300'
            }`}
            title={position.is_active ? 'Click to deactivate' : 'Click to activate'}
          >
            {/* Status Icon */}
            {position.is_active ? (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            
            {/* Status Text */}
            {position.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
      ),
      thClassName: "w-20" // Smaller fixed width for status
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, position) => (
        <div className="whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-1">
            <button
              onClick={() => handleEditPosition(position)}
              className={`px-2 py-1 text-blue-600 hover:text-blue-900 border border-blue-200 hover:border-blue-300 rounded transition-colors text-xs ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'}`}
              title="Edit Position"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeletePosition(position.id)}
              className={`px-2 py-1 text-red-600 hover:text-red-900 border border-red-200 hover:border-red-300 rounded transition-colors text-xs ${isDark ? 'hover:text-red-400' : 'hover:text-red-900'}`}
              title="Delete Position"
              disabled={!position.is_active}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      thClassName: "w-28 text-center" // Smaller fixed width for actions
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Position Management
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage job positions and titles
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={handleCreatePosition}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
                }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Position
            </button>
          </div>
        </div>

        {/* Positions Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPositions}
            isDark={isDark}
            tableId="positions-table"
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

      {/* Position Modal */}
      {showPositionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowPositionModal(false)}
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
                    {selectedPosition ? 'Edit Position' : 'Add New Position'}
                  </h3>
                  <button
                    onClick={() => setShowPositionModal(false)}
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
              <form onSubmit={handleSubmitPosition}>
                <div className="px-6 py-4 space-y-4">
                  {/* Position Name */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Position Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter position name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter position description"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Active Position
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPositionModal(false)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedPosition ? 'Update Position' : 'Create Position'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionManagement;
