import { MdDownload } from 'react-icons/md';
import { FigmaVideoIcon, FigmaImageIcon, FigmaAudioIcon, FigmaDocumentIcon, FigmaCloseIcon, VideoIcon, CloseIcon, EyeFigmaIcon, DownloadFigmaIcon } from '../../components/FigmaIcons';
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
        video: <VideoIcon  className="" />,
        image: <FigmaImageIcon size={30} className="" />,
        audio: <FigmaAudioIcon size={30} className="" />,
        other: <FigmaDocumentIcon size={30} className="" />,
        doc: <FigmaDocumentIcon size={30} className="" />,
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
       ${step === 4 ? "max-h-[290px]" : "max-h-[130px]"} mt-2 custom-scroll low overflow-y-auto   `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {selectedFiles.length === 0 ? (
                    <NoData />
                ) : (
                    selectedFiles.map((file, index) => (
                        <div key={index} className="between-align  bg-white rounded-[10px]   transition-all duration-200 mb-3">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-[10px]">
                                    {fileIcons[getMime(file.type)]}
                                </div>
                                <div className='max-w-[90%]'>
                                    <h6 className="heading text-start break-all text-[16px] md:!text-[18px] line-clamp-1 font-semibold text-black">
                                        {file.filename || file.folderName || file?.name}
                                    </h6>
                                    <p className="normal-para text-[14px] md:!text-[16px] !text-left text-gray-500">
                                        {FileSize(file.size || file.files.reduce((acc, f) => acc + (f.size || 0), 0))}
                                        {file.files?.length > 0 && <span className="ml-1 text-gray-400">• {file.files.length} files</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto ps-3 flex items-center gap-2">
                                {step === 4 && !file.files && (
                                    <>
                                        <button 
                                            onClick={() => handleView(file)}
                                            className="p-2 rounded-[10px] bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                        >
                                            <EyeFigmaIcon />
                                        </button>
                                        <button 
                                            onClick={() => handleIndividualDownload(file)}
                                            className="p-2 rounded-[10px] bg-green-100 hover:bg-green-200 transition-all duration-200"
                                        >
                                            <DownloadFigmaIcon/>
                                        </button>
                                    </>
                                )}
                                {step !== 4 && (
                                    <button 
                                        onClick={() => handleRemove(index)}
                                        className="mb-4 p-2 rounded-[10px] bg-red-100 hover:bg-red-200 transition-all duration-200"
                                    >
                                        <CloseIcon size={16} className='text-red-600' />
                                    </button>
                                )}
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
