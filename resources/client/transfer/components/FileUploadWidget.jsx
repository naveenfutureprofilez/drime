import React, { useState, useCallback, useRef } from 'react';
import FileData from './FileData';
import { MdAdd } from 'react-icons/md';
import Menu from '@app/components/Menu';
import { useFileDrop } from '@app/components/useFileDrop';
import { CiSettings } from 'react-icons/ci';
import { SettingsPanel } from './SettingsPanel';

export function FileUploadWidget({
  settings,
  onUploadStart,
  onSettingsChange
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  console.log("selectedFiles", selectedFiles)

  // const handleUpload = useCallback(async () => {
  //   if (selectedFiles.length === 0) return;
  //   const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
  //   onUploadStart?.({
  //     files: selectedFiles,
  //     totalSize,
  //     settings
  //   });
  // }, [selectedFiles, settings, onUploadStart]);

  // const removeFile = useCallback(index => {
  //   setSelectedFiles(files => files.filter((_, i) => i !== index));
  // }, []);

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

  const handlesubmit = (e) => {
    e.preventDefault();
    // setStep(3)
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


  return <div className="text-center">
    {selectedFiles.length === 0 ?
      <div
        className={` center-align  flex-col  h-[450px] md:!h-[576px] rounded-[15px] transition
                ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="manage-col text-center">
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
            className="Add rounded-[35px] p-4 mb-6 cursor-pointer inline-block"
          >
            <MdAdd size={56} />
          </label>


          <p className="para mt-[10px]">Let us begin by adding some files or folders</p>

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
                <h2 className="heading-md mb-1">1 items</h2>
                <p className="para !text-[#999999]">115.3 KB out of 100 GB</p>
              </div>
              <div className="Add rounded-[15px] flex items-center justify-center p-2  cursor-pointer " onClick={toggleMenu}>
                <MdAdd size={24} />
              </div>
            </div>
            {isMenuOpen && <Menu setSelectedFiles={setSelectedFiles} toggleMenu={toggleMenu} />}
            <div className="flex space-x-8 border-b-1 border-[#999999] mt-3">
              {/* Link Tab */}
              <div
                className="manage-col cursor-pointer"
                onClick={() => setActiveTab('Link')}
              >
                <span className={`text-[18px] font-medium transition-colors duration-200 ${activeTab === 'Link' ? 'text-[#08CF65] border-b-1 border-[#08CF65]' : 'text-[#999999]'}`}
                >
                  Link
                </span>
              </div>
              {/* Email Tab */}
              <div
                className="manage-col cursor-pointer"
                onClick={() => setActiveTab('Email')}
              >
                <span
                  className={`text-lg font-medium transition-colors duration-200 ${activeTab === 'Email' ? 'text-[#08CF65] border-b-1 border-[#08CF65]' : 'text-[#999999]'
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
                  placeholder="please provide email"
                  className="input"
                />
              </>
            )}
            <input
              type="text"
              placeholder="please provide Title"
              className="input"
              name='name'
              value={data?.name}
              onChange={handleChange}
            />
            <textarea
              rows={5}
              placeholder="Message"
              className="border-gray-300 border rounded-[15px] p-2 w-full resize-none"
              name='message'
              value={data?.message}
              onChange={handleChange}
            />
            <div className='between-align pt-[20px] gap-5 md:gap-0'>
              <div className='flex items-top space-x-1' onClick={handleSettingsClick}>
                <CiSettings size={28} className="text-black" />
                <div>
                  <h6 className="heading !font-[700]">
                    Expire on 2/6/2025
                  </h6>
                  <p className="normal-para ">
                    No password added
                  </p>
                </div>
              </div>
              <button className="button-sm md:button-md lg:button-lg"
                onClick={handlesubmit}>
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
        {/* <div className="flex gap-3 justify-center">
          <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={handleAddMoreFiles}>
              <Trans message="Add more files" />
            </button>
          <div className=" border-2 border-dashed rounded-2xl Add rounded-[15px] flex items-center justify-center p-2  cursor-pointer " onClick={toggleMenu}>
            <MdAdd size={24} />
          </div>{isMenuOpen && (<Menu setSelectedFiles={setSelectedFiles} toggleMenu={toggleMenu} />)}
          <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={() => setSelectedFiles([])}>
            <Trans message="Clear all" />
          </button>
          <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={handleUpload}>
            <Trans message="Upload files" />
          </button>
        </div> */}
      </div>}
  </div>;
}