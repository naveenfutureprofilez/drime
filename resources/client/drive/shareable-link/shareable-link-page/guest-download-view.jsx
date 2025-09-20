import React, { useState } from 'react';
import { apiClient } from '@common/http/query-client';
import { MdClose } from 'react-icons/md';
import Download from '@app/components/Download';
import FileData from '@app/transfer/components/FileData';
import StoragePopup from '@app/components/StoragePopup';
import Layout from '@app/components/Layout';
import { CloseIcon } from '@app/components/FigmaIcons';
import { toast } from '@ui/toast/toast';
import { Link } from 'react-router';
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

  const [isOpenStorageModal, setIsOpenStorageModal] = useState(false);
  const handleDownload = () => {
    if (!hash) {
      alert("Invalid download link.");
      return;
    }
    if (hasPassword && !isUnlocked) {
      return false;
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
      setTimeout(() => {
        setIsOpenStorageModal(true);
      }, 3000);
    }
  };

  // If password protected and not unlocked, show password form
  

  return <div className="space-y-6 bg-white">
    <>

    {(hasPassword && !isUnlocked) ? 
        <div className="fixed inset-0 w-full bg-gray-600 bg-opacity-50 flex items-center justify-center  z-50">
          <div className="box max-w-[500px] border border-gray-500 p-[20px] md:p-[30px]">  
            <div className="flex justify-between items-center  ">
              <h3 className="text-[18px] font-semibold text-gray-800">Enter the password </h3>
              <button onClick={() => setIspassword(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
              <p className="text-[16px] mt-4 text-gray-600 mb-4">  
                To access this link, you will need its password. If you do not have the password, contact the creator of the link.
              </p>
              <input
                type="password" autoComplete='off'
                placeholder="Enter the password"
                value={password}
                onChange={handleInputChange}
                className="inut-sm  sm:input"
              />
            <div className="flex justify-end items-center p-4 gap-4">
              <button onClick={() => setIspassword(false)} className="button !bg-transparent !text-black shadow-none hover:shadow-none hover:opacity-[0.5] !p-[12px]">
                Cancel
              </button>
              <button
                disabled={isVerifying || !password.trim()}
                onClick={handlePasswordSubmit}
                className="button font-semibold !p-[12px] !px-[20px] rounded-[14px] min-w-[80px] !shadow-none" 
              >
                {isVerifying ? (
                  <p>
                    Verifying..
                  </p>
                ) : (
                  <p>
                    Ok
                  </p>
                )}
              </button>
            </div>
          </div>
        </div> : ''
    }
      <Download 
        expiresAt={expiresAt} 
        totalSize={totalSize} 
        itemCount={files ? files.length : 0}
      />
      <div className=' mt-0 px-[20px] md:!px-[30px]    '>
            <FileData 
              step={4} 
              selectedFiles={files} 
              hash={hash}  isLocked={hasPassword && !isUnlocked}
              hasPassword={hasPassword} 
              password={password} 
            />
        <div className="between-align mt-6 absolute left-0 p-[30px] bottom-0 w-full">
          <Link to='/' className="text-[16px]  text-black font-[600] leading-5 underline">
            Create a transfer
          </Link>
          <button
            onClick={handleDownload}
            className="button-md ">
            Download
          </button>
        </div>
        <StoragePopup isOpen={isOpenStorageModal} />
      </div>
    </>

  </div>
    ;
};