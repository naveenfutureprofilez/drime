import  { useRef } from "react";

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
    <div className="absolute right-1 top-[60px] mt-2 w-64 bg-white rounded-lg shadow-xl p-2 z-50">
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
        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        <span className="mr-2">📄</span>
        <span>Import files</span>
      </div>

      {/* Import Folder */}
      <div
        className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
        onClick={() => folderInputRef.current.click()}
      >
        <span className="mr-2">📁</span>
        <span>Import folder</span>
      </div>

    </div>
  );
};

export default Menu;
