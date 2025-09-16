import React, { useState } from 'react';
import { Trans } from '@ui/i18n/trans';
import { MdClose } from 'react-icons/md';

export function SettingsPanel({
  settings,
  onSettingsChange,
  onClose
}) {

  const [localSettings, setLocalSettings] = useState({
    password: settings.password || '',
    expiresInHours: settings.expiresInHours || 72,
    maxDownloads: settings.maxDownloads || null
  });

  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    if (password && password.length < 4) {
      return 'The password must be at least 4 characters.';
    }
    return '';
  };

  const handleSave = () => {
    console.log('handleSave called with:', localSettings);
    
    // Validate password before saving
    const passwordValidationError = validatePassword(localSettings.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return; // Don't save if validation fails
    }
    
    setPasswordError(''); // Clear any existing error
    onSettingsChange(localSettings);
    onClose();
  };

  return <>
      <div 
        className="absolute inset-0 bg-[#0006] bg-opacity-50 flex items-end justify-center z-50 transition-all duration-300 ease-in-out" 
        onClick={onClose} >
        <div 
          className="bg-white w-full max-w-md rounded-t-2xl shadow-xl p-6 transform transition-transform duration-300 ease-out translate-y-0 animate-slideUpFromBottom"
          onClick={(e) => e.stopPropagation()}
        >
      
          <div className="flex items-center justify-between space-x-3 text-center mb-2">
            <h3 className="normal-heading text-lg font-semibold text-gray-800">Transfer settings</h3>
            <div onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 transition">
              <MdClose size={24} />
            </div>
          </div>

<div className="mb-2 md:flex items-center gap-5 justify-between">
            <p className="font-bold !text-start">
              Expiration
            </p>
            <select
              value={localSettings.expiresInHours}
              onChange={(e) => {
                const newExpiry = parseInt(e.target.value);
                console.log('Expiry changed to:', newExpiry);
                setLocalSettings({ ...localSettings, expiresInHours: newExpiry });
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="input-sm sm:input !w-full md:!max-w-[200px]  px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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
          </div>

          <div className="mb-2 md:flex items-center gap-5 justify-between">
            <p className='font-bold !text-start'>Password</p>
            <div className=" !w-full  md:!max-w-[200px]">
              <input
                type="password" autoComplete={false}
                value={localSettings.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  console.log('Password changed to:', newPassword);
                  setLocalSettings({ ...localSettings, password: newPassword });
                  
                  // Clear error when user starts typing
                  if (passwordError) {
                    setPasswordError('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Enter password"
                className={` input-sm sm:input !w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  passwordError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
            </div>
          </div>
          {passwordError && (
            <p className="!text-yellow-600 text-sm mt-1 text-xs mt-1">{passwordError}</p>
          )}

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
            {/* <button
              onClick={() => {
                console.log('Cancel clicked');
                onClose();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <Trans message="Cancel" />
            </button> */}
            <button
              onClick={() => {
                console.log('Save clicked with settings:', localSettings);
                handleSave();
              }}
              className="button-lg"
            >
              <Trans message="Done" />
            </button>
          </div>
        </div>
        {/* </div> */}
      </div>
    </>

}