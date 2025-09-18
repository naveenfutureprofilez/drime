import  { useRef } from "react";
import { ImportFileIcon, ImportFolderIcon } from "./FigmaIcons";

const Menu = ({ setSelectedFiles, toggleMenu }) => {
  const fileInputRef = useRef(null);
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
        individualFiles.push(file);
      }
    });

    const groupedFolders = Object.keys(folderMap).map((folderName) => ({
      folderName,
      files: folderMap[folderName],
    }));
    setSelectedFiles((prev) => [...prev, ...individualFiles, ...groupedFolders]);
    toggleMenu();
  };


  return (
    <div className="absolute right-[30px] border !border-[#0001] top-[70px] mt-2 w-64 bg-white rounded-[15px] shadow-xl p-1 z-50">
      {/* Hidden Inputs */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        type="file"
        webkitdirectory=""
        directory=""
        ref={folderInputRef}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Import Files */}
      <div
        className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-[10px] cursor-pointer transition-all duration-200 font-medium"
        onClick={() => fileInputRef.current.click()}
      >
        <ImportFileIcon className="me-3 text-lg" />
        <span className="ms-3 text-[16px] text-black">Import files</span>
      </div>

      {/* Import Folder */}
      <div
        className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-[10px] cursor-pointer transition-all duration-200 font-medium"
        onClick={() => folderInputRef.current.click()}
      >
        <ImportFolderIcon className="me-3 text-lg" />
        <span className="ms-3 text-[16px] text-black">Import folder</span>
      </div>

    </div>
  );
};

export default Menu;
