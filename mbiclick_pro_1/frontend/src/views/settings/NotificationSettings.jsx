import React, { useState } from 'react';
import { FaBell, FaEnvelope, FaMobile, FaDesktop, FaCalendar, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { TButton } from '../../components/Core';

const NotificationSettings = ({ isDark }) => {
  const [settings, setSettings] = useState({
    // Email notifications
    emailBillingUpdates: true,
    emailApprovals: true,
    emailRejections: true,
    emailReports: false,
    emailSystemAlerts: true,
    
    // Push notifications
    pushBillingUpdates: true,
    pushApprovals: true,
    pushRejections: true,
    pushReports: false,
    pushSystemAlerts: true,
    
    // In-app notifications
    inAppBillingUpdates: true,
    inAppApprovals: true,
    inAppRejections: true,
    inAppReports: true,
    inAppSystemAlerts: true,
    
    // Notification preferences
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationSound: true,
    notificationVibration: true,
    
    // Frequency settings
    billingUpdateFrequency: 'immediate',
    reportFrequency: 'weekly',
    digestFrequency: 'daily'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Implementation for saving notification settings
    console.log('Saving notification settings:', settings);
    // Show success message
  };

  const handleTestNotification = (type) => {
    // Implementation for testing notifications
    console.log(`Testing ${type} notification...`);
    // Show test notification
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Tetapan Notifikasi
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Urus keutamaan notifikasi dan cara anda menerima maklumat
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaEnvelope className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifikasi E-mel
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kemas kini billing
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima e-mel apabila status billing berubah
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailBillingUpdates}
                    onChange={(e) => handleSettingChange('emailBillingUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('email-billing')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kelulusan dan penolakan
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima e-mel untuk kelulusan dan penolakan billing
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailApprovals}
                    onChange={(e) => handleSettingChange('emailApprovals', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('email-approval')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Laporan dan analitik
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima e-mel untuk laporan berkala
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailReports}
                    onChange={(e) => handleSettingChange('emailReports', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('email-report')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Amaran sistem
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima e-mel untuk amaran keselamatan dan sistem
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailSystemAlerts}
                    onChange={(e) => handleSettingChange('emailSystemAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('email-system')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaMobile className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifikasi Push
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kemas kini billing
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima notifikasi push untuk kemas kini billing
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushBillingUpdates}
                    onChange={(e) => handleSettingChange('pushBillingUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('push-billing')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kelulusan dan penolakan
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima notifikasi push untuk kelulusan dan penolakan
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushApprovals}
                    onChange={(e) => handleSettingChange('pushApprovals', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('push-approval')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Amaran sistem
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima notifikasi push untuk amaran sistem
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushSystemAlerts}
                    onChange={(e) => handleSettingChange('pushSystemAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <TButton 
                  onClick={() => handleTestNotification('push-system')} 
                  color="secondary" 
                  size="xs"
                >
                  Test
                </TButton>
              </div>
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaDesktop className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifikasi Dalam Aplikasi
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kemas kini billing
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tunjuk notifikasi dalam aplikasi untuk kemas kini billing
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inAppBillingUpdates}
                  onChange={(e) => handleSettingChange('inAppBillingUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kelulusan dan penolakan
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tunjuk notifikasi dalam aplikasi untuk kelulusan dan penolakan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inAppApprovals}
                  onChange={(e) => handleSettingChange('inAppApprovals', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Laporan dan analitik
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tunjuk notifikasi dalam aplikasi untuk laporan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inAppReports}
                  onChange={(e) => handleSettingChange('inAppReports', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaBell className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Keutamaan Notifikasi
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Mod senyap
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Jangan hantar notifikasi pada waktu tertentu
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHours}
                  onChange={(e) => handleSettingChange('quietHours', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            {settings.quietHours && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Mula
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                    className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Tamat
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                    className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bunyi notifikasi
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mainkan bunyi untuk notifikasi
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSound}
                  onChange={(e) => handleSettingChange('notificationSound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Getaran
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Getarkan peranti untuk notifikasi
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationVibration}
                  onChange={(e) => handleSettingChange('notificationVibration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaCalendar className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Kekerapan Notifikasi
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Kekerapan kemas kini billing
              </label>
              <select
                value={settings.billingUpdateFrequency}
                onChange={(e) => handleSettingChange('billingUpdateFrequency', e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="immediate">Segera</option>
                <option value="hourly">Setiap jam</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Kekerapan laporan
              </label>
              <select
                value={settings.reportFrequency}
                onChange={(e) => handleSettingChange('reportFrequency', e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Suku tahunan</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Kekerapan ringkasan
              </label>
              <select
                value={settings.digestFrequency}
                onChange={(e) => handleSettingChange('digestFrequency', e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <TButton onClick={handleSaveSettings} color="primary">
            Simpan Tetapan
          </TButton>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;