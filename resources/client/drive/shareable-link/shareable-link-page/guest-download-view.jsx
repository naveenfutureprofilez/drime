import React, { useState } from 'react';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { apiClient } from '@common/http/query-client';
import { LockIcon } from '@ui/icons/material/Lock';
export const GuestDownloadView = ({
  files,
  totalSize,
  expiresAt,
  hash,
  hasPassword
}) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!hasPassword);
  const [passwordError, setPasswordError] = useState('');
  
  console.log('GuestDownloadView props:', { files, totalSize, expiresAt, hash, hasPassword });
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsVerifying(true);
    setPasswordError('');
    
    try {
      const response = await apiClient.post(`guest/upload/${hash}/verify-password`, { password });
      if (response.data.valid) {
        setIsUnlocked(true);
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setPasswordError('Error verifying password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // If password protected and not unlocked, show password form
  if (hasPassword && !isUnlocked) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LockIcon className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <Trans message="Password Protected" />
          </h2>
          
          <p className="text-gray-600 mb-6">
            <Trans message="This file share is password protected. Please enter the password to access the files." />
          </p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isVerifying}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isVerifying ? (
                <Trans message="Verifying..." />
              ) : (
                <Trans message="Access Files" />
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }
  return <div className="space-y-6">
      <div className="bg-white text-black rounded-xl p-4">
        <h3 className="font-medium  mb-3">
          <Trans message="Download Files" />
        </h3>
        <div className="space-y-2">
          {files?.map((file, index) => <div key={index} className="flex items-center gap-3 bg-white border border-black rounded-lg p-3">
              <div className="flex-1 text-left">
                <div className="text-sm font-medium ">{file.name || file.filename || file.original_filename}</div>
                <div className="text-xs ">{prettyBytes(file.file_size || file.size || 0)}</div>
              </div>
            </div>) || []}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
          <span className="text-gray-600">
            <Trans message="Total size:" />
          </span>
          <span className="font-medium">{prettyBytes(totalSize)}</span>
        </div>

        {expiresAt && <div className="mt-2 text-xs ">
            <Trans message="Expires on :date" values={{
          date: new Date(expiresAt).toLocaleDateString()
        }} />
          </div>}
      </div>

      {/* Download Button */}
      <div className="flex justify-center pt-4">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors" 
          onClick={() => {
            if (!hash) {
              alert('Invalid download link.');
              return;
            }
            
            const downloadParams = hasPassword && password ? `?password=${encodeURIComponent(password)}` : '';
            
            if (files && files.length === 1) {
              // Single file - direct download using file ID
              const file = files[0];
              const downloadUrl = `/download/${hash}/${file.id}${downloadParams}`;
              window.open(downloadUrl, '_blank');
            } else if (files && files.length > 1) {
              // Multiple files - ZIP download 
              const downloadUrl = `/download/${hash}${downloadParams}`;
              window.open(downloadUrl, '_blank');
            } else {
              alert('No files available for download.');
            }
          }}
        >
          <Trans message="Download all" />
        </button>
      </div>
    </div>;
};