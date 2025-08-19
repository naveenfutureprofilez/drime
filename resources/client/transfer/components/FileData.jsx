import { MdInsertDriveFile, MdClose } from 'react-icons/md';
import { IoMdDocument } from 'react-icons/io';
import { FaImage, FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { RiEyeLine } from "react-icons/ri";
import { LuDownload } from "react-icons/lu";
import { FileSize } from '../../components/FileSize';
import NoData from '../../components/NoData';
import { useFileDrop } from '../../components/useFileDrop';

export default function FileData({ step, selectedFiles, setSelectedFiles, setStep }) {

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
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        }
    };

    // Flatten all files for total size
    const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
    const totalSizeAll = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    return (
       <>
        <div
            className={`
       ${isDragging ? "bg-green-50" : "bg-white"}
       ${step === 4 ? "max-h-[400px]" : "max-h-[130px]"}
         mt-2
         custom-scroll
         overflow-y-auto
        `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {selectedFiles.length === 0 ? (
                <NoData />
            ) : (
                selectedFiles.map((file, index) => (
                    <div key={index} className="between-align  space-x-2 py-2">
                        <div className="flex items-center space-x-2">
                            <div>{fileIcons[getMime(file.type)]}</div>
                            <div>
                                <h6 className="heading !text-left font-bold">{file.name || file.folderName}</h6>
                                <p className="normal-para !text-left">
                                    {FileSize(file.size || totalSizeAll)}
                                    {file.files?.length > 0 && <span className="ml-1">{file.files.length} files</span>}
                                </p>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            {step === 4 && !file.files && (
                                <>
                                    <button onClick={() => handleView(file)}><RiEyeLine size={24} className='text-gray-700 hover:text-gray-400' /></button>
                                    <a href={URL.createObjectURL(file)} download={file.name}><LuDownload size={24} className='text-gray-700 hover:text-gray-400' /></a>
                                </>
                            )}
                            {step !== 4 && <button onClick={() => handleRemove(index)}><MdClose size={24} className='text-gray-700 hover:text-gray-400' /></button>}
                        </div>
                    </div>
                ))
            )}


        </div>

         <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                          <h6 className="heading !text-left font-bold">Total Size:</h6>
                        <span className="font-medium">
                               {FileSize(totalSizeAll)}
                        </span>
                      </div>
                    </div>
       </>
    );
}
