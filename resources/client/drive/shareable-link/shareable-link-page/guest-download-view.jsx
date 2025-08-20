import React, { useState } from 'react';
import { apiClient } from '@common/http/query-client';
import { MdClose } from 'react-icons/md';
import Download from '@app/components/Download';
import FileData from '@app/transfer/components/FileData';
import StoragePopup from '@app/components/StoragePopup';
import Layout from '@app/components/Layout';
export const GuestDownloadView = ({
  files,
  totalSize,
  expiresAt,
  hash,
  hasPassword
}) => {
  const [password, setPassword] = useState('');
  const [ispassword, setIspassword] = useState(false)


  const handleInputChange = (event) => {
    setPassword(event.target.value);
  };


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

  const handleCreateTransfer = () => {
    console.log('Create a transfer link clicked!');
  };

  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!hash) {
      alert("Invalid download link.");
      return;
    }

    setLoading(true);

    try {
      const downloadParams =
        hasPassword && password ? `?password=${encodeURIComponent(password)}` : "";

      if (files && files.length === 1) {
        // Single file - direct download using file ID
        const file = files[0];
        console.log("file", file)
        const downloadUrl = `/download/${hash}/${file.id}${downloadParams}`;
        window.open(downloadUrl, "_blank");
      } else if (files && files.length > 1) {
        // Multiple files - ZIP download
        const downloadUrl = `/download/${hash}${downloadParams}`;
        window.open(downloadUrl, "_blank");
        console.log("downloadUrl", downloadUrl)
      } else {
        alert("No files available for download.");
      }
    } finally {
      setLoading(false);
    }
  };

  // If password protected and not unlocked, show password form
  if (hasPassword && !isUnlocked) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="box">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Enter the password</h3>
            <button onClick={() => setIspassword(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <MdClose className="h-6 w-6" />
            </button>
          </div>
          {/* Modal Body */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              To access this link, you will need its password. If you do not have
              the password, contact the creator of the link.
            </p>
            <input
              type="password"
              placeholder="Enter the password"
              value={password}
              onChange={handleInputChange}
              className="inut-sm  sm:input"
            />
          </div>
          {/* Modal Footer */}
          <div className="flex justify-end items-center p-4 space-x-2 border-t">
            <button onClick={() => setIspassword(false)} className="px-4 py-2 text-white bg-red-600 rounded-lg font-medium hover:bg-red-500 transition-colors">
              Cancel
            </button>
            <button
              disabled={isVerifying || !password.trim()}
              onClick={handlePasswordSubmit}
              className="button-sm md:button-md lg:button-lg "
            >
              {isVerifying ? (
                <p>
                  Verifying..
                </p>
              ) : (
                <p>
                  Access Files
                </p>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="space-y-6">
    {/* <div className="bg-white text-black rounded-xl p-4">
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

      Download Button
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
      </div> */}

    <>
      <Download />
      <div className='!pt-0 p-[20px] md:p-[30px]'>
        <FileData step={4} selectedFiles={files} />
        <div className="between-align mt-6 pb-4">
          <button onClick={handleCreateTransfer} className="text-[14px] md:text-[18px] text-black font-[600] leading-5 underline">
            Create a transfer
          </button>
          <button
            onClick={handleDownload}
            className="button-sm md:button-md lg:-button-lg"
          >
            Download
          </button>
        </div>
        <StoragePopup />
      </div>
    </>

  </div>
    ;
};