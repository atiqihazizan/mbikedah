import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import apiClient from "../../utils/axios";
import DataTable from "../../components/DataTable";

/**
 * Department Management Component
 * Admin component for managing departments with API integration
 */
const DepartmentManagement = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/departments");
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      setError("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };



  const handleCreateDepartment = () => {
    setFormData({
      name: "",
      code: "",
      description: ""
    });
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (dept) => {
    setFormData({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || ""
    });
    setSelectedDepartment(dept);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDepartment) {
        // Update existing department
        await apiClient.put(`/departments/${selectedDepartment.id}`, formData);
      } else {
        // Create new department
        await apiClient.post("/departments", formData);
      }
      setShowModal(false);
      fetchDepartments(); // Refresh departments list
    } catch (error) {
      setError("Failed to save department");
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await apiClient.delete(`/departments/${deptId}`);
        fetchDepartments(); // Refresh departments list
          } catch (error) {
      setError("Failed to delete department");
    }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Define columns for DataTable
  const columns = [
    {
      key: 'name',
      label: 'Department Name',
      render: (value, dept) => (
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          }`}>
            <span className="text-white text-sm font-medium">
              {dept.name?.charAt(0).toUpperCase() || 'D'}
            </span>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {dept.name || 'N/A'}
            </div>
            {dept.code && (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {dept.code}
              </span>
            )}
          </div>
        </div>
      ),
      // thClassName: "w-80" // Fixed width for department name
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, dept) => (
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {dept.description || 'No description available'}
        </div>
      ),
      // thClassName: "w-96" // Fixed width for description
    },
    {
      key: 'details',
      label: 'Details',
      render: (value, dept) => (
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div>ID: {dept.id}</div>
          <div>Created: {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'}</div>
        </div>
      ),
      thClassName: "w-32" // Fixed width for details
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, dept) => (
        <div className="whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditDepartment(dept)}
              className={`px-3 py-2 text-blue-600 hover:text-blue-900 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'}`}
              title="Edit Department"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteDepartment(dept.id)}
              className={`px-3 py-2 text-red-600 hover:text-red-900 border border-red-200 hover:border-red-300 rounded-lg transition-colors ${isDark ? 'hover:text-red-400' : 'hover:text-red-900'}`}
              title="Delete Department"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      thClassName: "w-32 text-center" // Fixed width for actions
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Department Management
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage system departments and organizational structure
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search departments..."
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
          
          <button 
            onClick={handleCreateDepartment}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Department
          </button>
        </div>

        {/* Departments Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={departments}
            isDark={isDark}
            tableId="department-management-table"
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

      {/* Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
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
                    {selectedDepartment ? 'Edit Department' : 'Create New Department'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter department name"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter department code (e.g., IT, HR, FIN)"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter department description"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    {selectedDepartment ? 'Update Department' : 'Create Department'}
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

export default DepartmentManagement;
