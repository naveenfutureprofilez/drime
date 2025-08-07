import React, { useState } from 'react';
import { Trans } from '@ui/i18n/trans';

export function SettingsPanel({
  settings,
  onSettingsChange,
  onClose
}) {
  
  console.log('Settings received:', settings); // Debug log
  
  const [localSettings, setLocalSettings] = useState({
    password: settings.password || '',
    expiresInHours: settings.expiresInHours || 72,
    maxDownloads: settings.maxDownloads || null
  });
  
  const handleSave = () => {
    console.log('handleSave called with:', localSettings);
    onSettingsChange(localSettings);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            <Trans message="Transfer Settings" />
          </h2>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Password Protection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trans message="Password protection (optional)" />
              </label>
              <input 
                type="password"
                value={localSettings.password}
                onChange={(e) => {
                  console.log('Password changed to:', e.target.value);
                  setLocalSettings({...localSettings, password: e.target.value});
                }}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-1">
                <Trans message="Add a password to protect your files" />
              </p>
            </div>

            {/* Expiry Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trans message="Delete files after" />
              </label>
              <select 
                value={localSettings.expiresInHours}
                onChange={(e) => {
                  const newExpiry = parseInt(e.target.value);
                  console.log('Expiry changed to:', newExpiry);
                  setLocalSettings({...localSettings, expiresInHours: newExpiry});
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>1 day</option>
                <option value={72}>3 days</option>
                <option value={120}>5 days</option>
                <option value={168}>7 days</option>
                <option value={240}>10 days</option>
                <option value={480}>20 days</option>
                <option value={720}>30 days</option>
                <option value={8760}>1 year</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                <Trans message="Files will be automatically deleted after this time" />
              </p>
            </div>

            {/* Download Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trans message="Download limit (optional)" />
              </label>
              <select 
                value={localSettings.maxDownloads || ''}
                onChange={(e) => {
                  const newLimit = e.target.value ? parseInt(e.target.value) : null;
                  console.log('Max downloads changed to:', newLimit);
                  setLocalSettings({...localSettings, maxDownloads: newLimit});
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">No limit</option>
                <option value={1}>1 download</option>
                <option value={5}>5 downloads</option>
                <option value={10}>10 downloads</option>
                <option value={25}>25 downloads</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                <Trans message="Limit the number of times files can be downloaded" />
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={() => {
              console.log('Cancel clicked');
              onClose();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <Trans message="Cancel" />
          </button>
          <button 
            onClick={() => {
              console.log('Save clicked with settings:', localSettings);
              handleSave();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Trans message="Save settings" />
          </button>
        </div>
      </div>
    </div>
  );
}