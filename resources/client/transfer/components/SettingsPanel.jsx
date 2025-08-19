import React, { useState } from 'react';
import { Trans } from '@ui/i18n/trans';
import { MdClose } from 'react-icons/md';

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
    <div className="mx-auto inset-0 w-full max-w-[435px] bg-gray-600 bg-opacity-50 flex items-center justify-center p-[3px] z-50 absolute h-[500px]" >
      <div className="bg-white w-full max-w-[435px] rounded-[15px] shadow-xl p-6 animate-slideUp">
        {/* <div className="flex items-center justify-between space-x-3 text-center mb-2"> */}
        {/* Header */}
        <div className="flex items-center justify-between space-x-3 text-center mb-2">
          <h3 className="normal-heading text-lg font-semibold text-gray-800">Transfer settings</h3>
          <div onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 transition">
            <MdClose size={24} />
          </div>
        </div>

        {/* Body */}
        {/* Password Protection */}
        <div className="mb-2 ">
          <label className="text-[18px] font-medium text-black font-bold w-1/3 font-schibsted">
            Password protection (optional)
          </label>

          <input
            type="password"
            value={localSettings.password}
            onChange={(e) => {
              console.log('Password changed to:', e.target.value);
              setLocalSettings({ ...localSettings, password: e.target.value });
            }}
            placeholder="Enter password"
            className="w-2/3 input-sm sm:input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

          />
          <p className="text-sm text-gray-500 mt-1">
            Add a password to protect your files
          </p>


        </div>

        {/* Expiry Time */}
        <div className="mb-2 ">

          <label className="text-[18px] font-medium text-black font-bold w-1/3 font-schibsted">
            Delete files after
          </label>

          <select
            value={localSettings.expiresInHours}
            onChange={(e) => {
              const newExpiry = parseInt(e.target.value);
              console.log('Expiry changed to:', newExpiry);
              setLocalSettings({ ...localSettings, expiresInHours: newExpiry });
            }}
            className="w-2/3 input-sm sm:input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"


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
            Files will be automatically deleted after this time
          </p>
        </div>

        {/* Download Limit
        <div className="mb-2 ">

          <label className="text-[18px] font-medium text-black font-bold w-1/3 font-schibsted">
            Download limit (optional)
          </label>
          <select
            value={localSettings.maxDownloads || ''}
            onChange={(e) => {
              const newLimit = e.target.value ? parseInt(e.target.value) : null;
              console.log('Max downloads changed to:', newLimit);
              setLocalSettings({ ...localSettings, maxDownloads: newLimit });
            }}
            className="w-2/3 input-sm sm:input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

          >
            <option value="">No limit</option>
            <option value={1}>1 download</option>
            <option value={5}>5 downloads</option>
            <option value={10}>10 downloads</option>
            <option value={25}>25 downloads</option>
          </select>
          <p className="para !text-[#999999]">Limit the number of times files can be downloaded</p>


        </div> */}

        {/* Footer */}
        <div className="px-2 py-2 flex justify-end gap-3">
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
            className=" button-sm md:button-md lg:button-lg"
          >
            <Trans message="Save settings" />
          </button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}