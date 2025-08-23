import React, { useState, useCallback, useRef } from 'react';
import FileData from './FileData';
import { VscAdd } from "react-icons/vsc";

import Menu from '@app/components/Menu';
import { useFileDrop } from '@app/components/useFileDrop';
import { CiSettings } from 'react-icons/ci';
import { SettingsPanel } from './SettingsPanel';
import { FileSize } from '@app/components/FileSize';

export function FileUploadWidget({
  settings,
  onUploadStart,
  onSettingsChange
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  console.log("selectedFiles", selectedFiles)


  function formatExpiryTime(hours) {
    if (hours === 1) {
      return "Expires in 1 hour";
    } else if (hours < 24) {
      return `Expires in ${hours} hours`;
    } else if (hours === 24) {
      return "Expires in 1 day";
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `Expires in ${days} days`;
    } else if (hours === 168) {
      return "Expires in 1 week";
    } else if (hours < 720) {
      const days = Math.floor(hours / 24);
      return `Expires in ${days} days`;
    } else if (hours === 720) {
      return "Expires in 1 month";
    } else if (hours < 8760) {
      const months = Math.floor(hours / 720);
      return `Expires in ${months} months`;
    } else {
      return "Expires in 1 year";
    }
  }

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
    onUploadStart?.({
      files: selectedFiles,
      totalSize,
      settings
    });
  }, [selectedFiles, settings, onUploadStart]);


  const [showSettings, setShowSettings] = useState(false);
  const handleSettingsClick = () => {
    setShowSettings(true);
  };
  const handleModalClose = () => {
    setShowSettings(false);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [data, setData] = useState({
    email: "",
    name: "",
    message: ""
  })
  const handleChange = (e) => {
    setData((prevalue) => {
      return {
        ...prevalue,
        [e.target.name]: e.target.value
      }
    })
  }

  

  const addInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFilesSelected = (files) => {
    const arr = Array.from(files);

    const folderMap = {};
    const individualFiles = [];

    arr.forEach((file) => {
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/');
        const folderName = pathParts.length > 1 ? pathParts[0] : "Root";
        if (!folderMap[folderName]) folderMap[folderName] = [];
        folderMap[folderName].push(file);
      } else {
        // Individual file
        individualFiles.push(file);
      }
    });

    // Convert folderMap to array
    const groupedFolders = Object.keys(folderMap).map((folderName) => ({
      folderName,
      files: folderMap[folderName],
    }));

    // Combine individual files and folders
    setSelectedFiles((prev) => [...prev, ...individualFiles, ...groupedFolders]);
    // setStep(2);
  };

  const handleDropAction = (newItems) => {
    setSelectedFiles((prev) => [...prev, ...newItems]);
    // setStep(2);
  };
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDrop(handleDropAction);
  const [activeTab, setActiveTab] = useState('Link');

   const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
    const totalSizeAll = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  return <div className="text-center">
    {selectedFiles.length === 0 ?
      <div
        className={` center-align flex-col h-[60vh] max-h-[500px] rounded-[15px] transition
                ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="column-center text-center p-12">
          <input
            type="file"
            multiple
            ref={addInputRef}
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <input
            type="file"
            webkitdirectory=""
            multiple
            ref={folderInputRef}
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <label
            onClick={() => addInputRef.current.click()}
            className="btn-border rounded-[35px] p-4 mb-6 cursor-pointer inline-block"
          >
            <VscAdd size={56} />
          </label>


          <p className="para mt-[10px]">Let us begin by adding some files</p>
          <p
            onClick={() => folderInputRef.current.click()}
            className="transefer mt-1 inline-block cursor-pointer"
          >
            Or select folder
          </p> 
        </div>
      </div>
      :
      <div>
        <div className=" overflow-hidden relative " onClick={() => showSettings && handleModalClose()}>
          <div className='p-[20px] md:p-[30px]'>
            <div className="between-align">
              <div>
                <h2 className="heading-md mb-1 !text-left">{selectedFiles?.length} items</h2>
                <p className="para !text-[#999999]">{FileSize(selectedFiles.size || totalSizeAll)} out of 100 GB</p>
              </div>
              <div className="btn-border border-[3px] !bg-[#fff]  rounded-[18px] flex items-center justify-center p-2 py-[9px] cursor-pointer" onClick={toggleMenu}>
                <VscAdd size={24} color='#08cf65' />
              </div>
            </div>
            {isMenuOpen && <Menu setSelectedFiles={setSelectedFiles} toggleMenu={toggleMenu} />}
            <div className="flex space-x-8 border-b border-[#0002] border-b-[2px]   mt-3">
              <div
                className="column-center cursor-pointer mb-[-2px]"
                onClick={() => setActiveTab('Link')}
              >
                <span className={`text-lg p-1 font-medium transition-colors duration-200 ${activeTab === 'Link' ? 'text-[#08CF65] border-b-[2px] border-[#08CF65]' : 'text-[#999999]'}`}
                >
                  Link
                </span>
              </div>
              <div
                className="column-center cursor-pointer mb-[-2px]"
                onClick={() => setActiveTab('Email')}
              >
                <span
                  className={`text-lg p-1 font-medium transition-colors duration-200 ${activeTab === 'Email' ? 'text-[#08CF65] border-b-[2px] border-[#08CF65]' : 'text-[#999999]'
                    }`} >
                  Email
                </span>
              </div>
            </div>
            <FileData selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            {activeTab === "Email" && (
              <>
                <input
                  type="email"
                  name='email'
                  value={data?.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input"
                />
              </>
            )}
            <input
              type="text"
              placeholder="Title"
              className="input"
              name='name'
              value={data?.name}
              onChange={handleChange}
            />
            <textarea
              rows={3}
              placeholder="Message"
              className="textarea"
              name='message'
              value={data?.message}
              onChange={handleChange}
            />
            <div className='between-align pt-[20px] gap-5 md:gap-0'>
              <div className='flex items-center space-x-1' onClick={handleSettingsClick}>
                <CiSettings size={28} className="text-black" />
                <div>
                  <h6 className="heading !font-[700] ps-0 text-start text-sm">
                    {formatExpiryTime(settings.expiresInHours)}
                  </h6>
                  <p className="normal-para text-sm ">
                    {settings.password ? "Password protected" : "No password added"}
                  </p>
                </div>
              </div>
              <button className="button-sm md:button-md"
                onClick={handleUpload}>
                Create Transfer
              </button>
            </div>
          </div>
        </div>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        )}
        
      </div>}
  </div>;
}