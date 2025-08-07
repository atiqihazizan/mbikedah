import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaUserSecret, FaDatabase, FaGlobe } from 'react-icons/fa';
import { TButton } from '../../components/Core';

const PrivacySettings = ({ isDark }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    thirdPartySharing: false,
    dataRetention: '2years',
    locationSharing: false,
    activityLogging: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Implementation for saving privacy settings
    console.log('Saving privacy settings:', settings);
    // Show success message
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Kata laluan baru tidak sepadan');
      return;
    }
    // Implementation for password change
    console.log('Changing password...');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Privasi dan Keselamatan
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Kawal maklumat peribadi dan tetapan privasi anda
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaUserSecret className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Keterlihatan Profil
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="profile-public"
                name="profileVisibility"
                value="public"
                checked={settings.profileVisibility === 'public'}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="mr-2"
              />
              <label htmlFor="profile-public" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Awam - Semua pengguna boleh melihat profil anda
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="profile-private"
                name="profileVisibility"
                value="private"
                checked={settings.profileVisibility === 'private'}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="mr-2"
              />
              <label htmlFor="profile-private" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Peribadi - Hanya rakan sekerja boleh melihat profil anda
              </label>
            </div>
          </div>
        </div>

        {/* Data Sharing Settings */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaDatabase className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Kongsian Data
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kongsi data untuk analitik
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Membantu kami menambah baik perkhidmatan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dataSharing}
                  onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Jejaki aktiviti untuk pengalaman yang lebih baik
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Merekod aktiviti untuk menambah baik antara muka
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.analyticsTracking}
                  onChange={(e) => handleSettingChange('analyticsTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Kongsi dengan pihak ketiga
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Membolehkan kongsi data dengan rakan kongsi
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.thirdPartySharing}
                  onChange={(e) => handleSettingChange('thirdPartySharing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Communication Settings */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaGlobe className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Komunikasi
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  E-mel pemasaran
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terima e-mel tentang produk dan perkhidmatan baru
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaShieldAlt className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Penyimpanan Data
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Tempoh penyimpanan data
              </label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="6months">6 bulan</option>
                <option value="1year">1 tahun</option>
                <option value="2years">2 tahun</option>
                <option value="5years">5 tahun</option>
                <option value="indefinite">Sehingga dipadamkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center mb-4">
            <FaLock className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tukar Kata Laluan
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Kata laluan semasa
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full p-2 pr-10 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Masukkan kata laluan semasa"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4 text-gray-500" /> : <FaEye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Kata laluan baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Masukkan kata laluan baru"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Sahkan kata laluan baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-2 border rounded-md ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Sahkan kata laluan baru"
              />
            </div>

            <TButton onClick={handlePasswordChange} color="primary" size="sm">
              Tukar Kata Laluan
            </TButton>
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

export default PrivacySettings;