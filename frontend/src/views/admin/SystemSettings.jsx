import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTheme } from "../../hooks/useTheme";
import { FaCog, FaDatabase, FaShieldAlt, FaBell, FaClock, FaFileAlt, FaSave, FaUndo } from "react-icons/fa";

/**
 * System Settings Component
 * Admin component for configuring system-wide settings
 */
const SystemSettings = () => {
  const { currentUser } = useStateContext();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState({
    // General Settings
    appName: "MBI Clicks",
    appVersion: "1.0.0",
    timezone: "Asia/Kuala_Lumpur",
    language: "ms",
    
    // Security Settings
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableTwoFactor: false,
    
    // File Settings
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "png", "xlsx"],
    enableFileCompression: true,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    enableEmailNotifications: true,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    backupLocation: "/backups",
    
    // Logging Settings
    enableLogging: true,
    logLevel: "info",
    logRetention: 90,
    enableAuditLog: true,
    
    // Maintenance Settings
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    debugMode: false,
    
    // Performance Settings
    cacheEnabled: true,
    cacheTTL: 3600,
    enableCompression: true,
    maxConnections: 100
  });

  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    // Load current settings (in real app, this would come from API)
    setOriginalSettings({ ...settings });
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update original settings
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      
      // Show success message
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className={`mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const SettingField = ({ label, type = "text", value, onChange, options, placeholder, helpText }) => (
    <div className="mb-4">
      <label className={`block text-sm font-medium mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className={`ml-2 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {helpText}
          </span>
        </div>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder={placeholder}
        />
      )}
      
      {helpText && type !== "checkbox" && (
        <p className={`mt-1 text-xs ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {helpText}
        </p>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Settings
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {hasChanges && "You have unsaved changes"}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors flex items-center ${
                hasChanges
                  ? isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : isDark 
                    ? 'border-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaUndo className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
              }`}
            >
              <FaSave className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <SettingSection title="General Settings" icon={FaCog}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Application Name"
                value={settings.appName}
                onChange={(value) => handleInputChange('general', 'appName', value)}
                helpText="The name displayed throughout the application"
              />
              <SettingField
                label="Application Version"
                value={settings.appVersion}
                onChange={(value) => handleInputChange('general', 'appVersion', value)}
                helpText="Current version of the application"
              />
              <SettingField
                label="Timezone"
                type="select"
                value={settings.timezone}
                onChange={(value) => handleInputChange('general', 'timezone', value)}
                options={[
                  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur (UTC+8)" },
                  { value: "UTC", label: "UTC (UTC+0)" },
                  { value: "America/New_York", label: "America/New_York (UTC-5)" }
                ]}
              />
              <SettingField
                label="Language"
                type="select"
                value={settings.language}
                onChange={(value) => handleInputChange('general', 'language', value)}
                options={[
                  { value: "ms", label: "Bahasa Malaysia" },
                  { value: "en", label: "English" },
                  { value: "zh", label: "中文" }
                ]}
              />
            </div>
          </SettingSection>

          {/* Security Settings */}
          <SettingSection title="Security Settings" icon={FaShieldAlt}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(value) => handleInputChange('security', 'sessionTimeout', parseInt(value))}
                helpText="How long before a user session expires"
              />
              <SettingField
                label="Max Login Attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(value) => handleInputChange('security', 'maxLoginAttempts', parseInt(value))}
                helpText="Maximum failed login attempts before lockout"
              />
              <SettingField
                label="Password Minimum Length"
                type="number"
                value={settings.passwordMinLength}
                onChange={(value) => handleInputChange('security', 'passwordMinLength', parseInt(value))}
                helpText="Minimum characters required for passwords"
              />
              <SettingField
                label="Require Strong Password"
                type="checkbox"
                value={settings.requireStrongPassword}
                onChange={(value) => handleInputChange('security', 'requireStrongPassword', value)}
                helpText="Enforce password complexity requirements"
              />
              <SettingField
                label="Enable Two-Factor Authentication"
                type="checkbox"
                value={settings.enableTwoFactor}
                onChange={(value) => handleInputChange('security', 'enableTwoFactor', value)}
                helpText="Allow users to enable 2FA for additional security"
              />
            </div>
          </SettingSection>

          {/* File Settings */}
          <SettingSection title="File Settings" icon={FaFileAlt}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Maximum File Size (MB)"
                type="number"
                value={settings.maxFileSize}
                onChange={(value) => handleInputChange('file', 'maxFileSize', parseInt(value))}
                helpText="Maximum allowed file size for uploads"
              />
              <SettingField
                label="Enable File Compression"
                type="checkbox"
                value={settings.enableFileCompression}
                onChange={(value) => handleInputChange('file', 'enableFileCompression', value)}
                helpText="Automatically compress uploaded files to save space"
              />
            </div>
          </SettingSection>

          {/* Email Settings */}
          <SettingSection title="Email Settings" icon={FaBell}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="SMTP Host"
                value={settings.smtpHost}
                onChange={(value) => handleInputChange('email', 'smtpHost', value)}
                helpText="SMTP server hostname"
              />
              <SettingField
                label="SMTP Port"
                type="number"
                value={settings.smtpPort}
                onChange={(value) => handleInputChange('email', 'smtpPort', parseInt(value))}
                helpText="SMTP server port number"
              />
              <SettingField
                label="SMTP Username"
                value={settings.smtpUsername}
                onChange={(value) => handleInputChange('email', 'smtpUsername', value)}
                helpText="SMTP authentication username"
              />
              <SettingField
                label="SMTP Password"
                type="password"
                value={settings.smtpPassword}
                onChange={(value) => handleInputChange('email', 'smtpPassword', value)}
                helpText="SMTP authentication password"
              />
              <SettingField
                label="Enable Email Notifications"
                type="checkbox"
                value={settings.enableEmailNotifications}
                onChange={(value) => handleInputChange('email', 'enableEmailNotifications', value)}
                helpText="Send email notifications for system events"
              />
            </div>
          </SettingSection>

          {/* Backup Settings */}
          <SettingSection title="Backup Settings" icon={FaDatabase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Auto Backup"
                type="checkbox"
                value={settings.autoBackup}
                onChange={(value) => handleInputChange('backup', 'autoBackup', value)}
                helpText="Automatically create system backups"
              />
              <SettingField
                label="Backup Frequency"
                type="select"
                value={settings.backupFrequency}
                onChange={(value) => handleInputChange('backup', 'backupFrequency', value)}
                options={[
                  { value: "hourly", label: "Hourly" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" }
                ]}
              />
              <SettingField
                label="Backup Retention (days)"
                type="number"
                value={settings.backupRetention}
                onChange={(value) => handleInputChange('backup', 'backupRetention', parseInt(value))}
                helpText="How long to keep backup files"
              />
              <SettingField
                label="Backup Location"
                value={settings.backupLocation}
                onChange={(value) => handleInputChange('backup', 'backupLocation', value)}
                helpText="Directory path for storing backups"
              />
            </div>
          </SettingSection>

          {/* Maintenance Settings */}
          <SettingSection title="Maintenance Settings" icon={FaCog}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Maintenance Mode"
                type="checkbox"
                value={settings.maintenanceMode}
                onChange={(value) => handleInputChange('maintenance', 'maintenanceMode', value)}
                helpText="Put the system in maintenance mode"
              />
              <SettingField
                label="Maintenance Message"
                type="textarea"
                value={settings.maintenanceMessage}
                onChange={(value) => handleInputChange('maintenance', 'maintenanceMessage', value)}
                placeholder="Message displayed to users during maintenance"
              />
              <SettingField
                label="Debug Mode"
                type="checkbox"
                value={settings.debugMode}
                onChange={(value) => handleInputChange('maintenance', 'debugMode', value)}
                helpText="Enable detailed error logging and debugging"
              />
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
