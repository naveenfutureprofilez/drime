import { MdInsertDriveFile, MdClose, MdDownload } from 'react-icons/md';
import { IoMdDocument } from 'react-icons/io';
import { FaImage, FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { RiEyeLine } from "react-icons/ri";
import { FileSize } from '../../components/FileSize';
import NoData from '../../components/NoData';
import { useFileDrop } from '../../components/useFileDrop';
import { useState } from 'react';

export default function FileData({ step, selectedFiles, setSelectedFiles, setStep, hash, hasPassword, password }) {

    const handleDropAction = (newItems) => {
        setSelectedFiles((prev) => [...prev, ...newItems]);
        setStep(2);
    };

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDrop(handleDropAction);
    // File type icons
    const getMime = (type) => {
        if (!type) return 'other';
        if (type.includes('image')) return 'image';
        if (type.includes('video')) return 'video';
        if (type.includes('audio')) return 'audio';
        if (type.includes('doc')) return 'doc';
        return 'other';
    };

    const fileIcons = {
        video: <FaFileVideo className="text-red-600" size={28} />,
        image: <FaImage className="text-blue-600" size={28} />,
        audio: <FaFileAudio className="text-purple-600" size={28} />,
        other: <MdInsertDriveFile className="text-gray-600" size={28} />,
        doc: <IoMdDocument className="text-blue-600" size={28} />,
    };

    const handleRemove = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleView = (file) => {
        if (file instanceof File) {
            // const fileURL = URL?.createObjectURL(file);
            window.open(file, '_blank');
        }
    };

    const handleIndividualDownload = (file) => {
        if (!hash || !file.id) {
            alert("Invalid download link or file.");
            return;
        }

        try {
            const downloadParams = hasPassword && password 
                ? `?password=${encodeURIComponent(password)}` 
                : "";
            
            const downloadUrl = `/download/${hash}/${file.id}${downloadParams}`;
            window.open(downloadUrl, "_blank");
        } catch (error) {
            console.error("Individual download error:", error);
            alert("Something went wrong while downloading this file.");
        }
    };
    console.log("selectedFiles", selectedFiles)

    // Flatten all files for total size
    const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);

    const getItemSize = (file) => {
        if (file.files?.length > 0) {
            return file.files.reduce((acc, f) => acc + (f.size || 0), 0);
        }
        return file.size || 0;
    };

    const totalSizeAll = selectedFiles.reduce(
        (acc, item) => acc + getItemSize(item),
        0
    );

    // Get count of files in 1 item (file = 1, folder = length)
    const getItemCount = (file) => {
        if (file.files?.length > 0) {
            return file.files.length;
        }
        return 1; // single file
    };
    const totalFileCount = selectedFiles.reduce(
        (acc, item) => acc + getItemCount(item),
        0
    );

    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!hash) {
            alert("Invalid download link.");
            return;
        }

        if (!selectedFiles || selectedFiles.length === 0) {
            alert("No files available for download.");
            return;
        }

        setLoading(true);

        try {
            const downloadParams =
                hasPassword && password
                    ? `?password=${encodeURIComponent(password)}`
                    : "";

            let downloadUrl = "";

            if (selectedFiles.length === 1) {
                // 👉 Single file download
                const file = selectedFiles[0];
                downloadUrl = `/download/${hash}/${file.id}${downloadParams}`;
            } else {
                // 👉 Multiple files (ZIP download)
                downloadUrl = `/download/${hash}${downloadParams}`;
            }

            // Open in new tab
            window.open(downloadUrl, "_blank");
        } catch (error) {
            console.error("Download error:", error);
            alert("Something went wrong while downloading.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className={`
       ${isDragging ? "bg-green-50" : "bg-white"}
       ${step === 4 ? "max-h-[33vh]" : "max-h-[130px]"}
         mt-2
         custom-scroll
         overflow-y-auto pe-[20px]
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {selectedFiles.length === 0 ? (
                    <NoData />
                ) : (
                    selectedFiles.map((file, index) => (
                        <div key={index} className="between-align  py-2">
                            <div className="flex items-center space-x-2 ">
                                <div>{fileIcons[getMime(file.type)]}</div>
                                <div className='max-w-[90%]'>
                                    <h6 className="heading text-start break-all line-clamp-2 font-bold">{file.filename || file.folderName || file?.name}</h6>
                                    <p className="normal-para !text-left ">
                                        Size : {FileSize(file.size || file.files.reduce((acc, f) => acc + (f.size || 0), 0))}
                                        {/* {file.files?.length > 0 && <span className="ml-1">{file.files.length} files</span>} */}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto ps-3 flex items-center gap-3">
                                {step === 4 && !file.files && (
                                    <>
                                        <button onClick={() => handleView(file)}><RiEyeLine size={24} className='text-gray-700 hover:text-gray-400' /></button>
                                        <button onClick={() => handleIndividualDownload(file)}><MdDownload size={24} className='text-gray-700 hover:text-gray-400' /></button>

                                    </>
                                )}
                                {step !== 4 && <button onClick={() => handleRemove(index)}><MdClose size={24} className='text-gray-700 hover:text-gray-400' /></button>}
                            </div>
                        </div>
                    ))
                )}


            </div>

            {/* <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                    <h6 className="heading !text-left font-bold">Total Size:</h6>
                    <span className="font-medium">
                        {FileSize(totalSizeAll)} ({totalFileCount} files)
                    </span>
                </div>
            </div> */}
        </>
    );
}
