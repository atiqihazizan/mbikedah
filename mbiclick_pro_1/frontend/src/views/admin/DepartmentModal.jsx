import React, { useState } from 'react';
import { FaTimes, FaBuilding, FaCode, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import apiClient from '../../utils/axios';

/**
 * Department Modal Component
 * Modal for managing departments
 */
const DepartmentModal = ({ 
  isOpen, 
  onClose, 
  departments, 
  onRefresh, 
  isDark 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateDepartment = () => {
    setFormData({ name: '', code: '', description: '' });
    setEditingDepartment(null);
    setShowCreateForm(true);
  };

  const handleEditDepartment = (dept) => {
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || ''
    });
    setEditingDepartment(dept);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        // Update existing department
        await apiClient.put(`/departments/${editingDepartment.id}`, formData);
      } else {
        // Create new department
        await apiClient.post('/departments', formData);
      }
      setShowCreateForm(false);
      setEditingDepartment(null);
      onRefresh(); // Refresh departments list
    } catch (error) {
      // Handle error silently
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await apiClient.delete(`/departments/${deptId}`);
        onRefresh(); // Refresh departments list
      } catch (error) {
        // Handle error silently
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingDepartment(null);
    setFormData({ name: '', code: '', description: '' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
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
                Department Management
              </h3>
              <button
                onClick={onClose}
                className={`rounded-md p-2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {showCreateForm ? (
              // Create/Edit Form
              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className={`text-md font-medium mb-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {editingDepartment ? 'Edit Department' : 'Create New Department'}
                </h4>
                
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaBuilding className="inline w-4 h-4 mr-2" />
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
                    <FaCode className="inline w-4 h-4 mr-2" />
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

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
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
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            ) : (
              // Departments List
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-md font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Departments
                  </h4>
                  <button
                    onClick={handleCreateDepartment}
                    className={`px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                      isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Department
                  </button>
                </div>

                <div className="space-y-3">
                  {departments.length === 0 ? (
                    <p className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No departments found. Create your first department.
                    </p>
                  ) : (
                    departments.map((dept) => (
                      <div
                        key={dept.id}
                        className={`p-4 border rounded-lg ${
                          isDark 
                            ? 'border-gray-700 bg-gray-700' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {dept.name}
                            </h5>
                            {dept.code && (
                              <p className={`text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Code: {dept.code}
                              </p>
                            )}
                            {dept.description && (
                              <p className={`text-sm mt-1 ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {dept.description}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditDepartment(dept)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'text-blue-400 hover:bg-gray-600' 
                                  : 'text-blue-600 hover:bg-gray-200'
                              }`}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept.id)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'text-red-400 hover:bg-gray-600' 
                                  : 'text-red-600 hover:bg-gray-200'
                              }`}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal;
