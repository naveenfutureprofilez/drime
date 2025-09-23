import React, { useState, useEffect } from 'react';
import { CloseIcon } from './FigmaIcons';

const ImagePreviewModal = ({ isOpen, onClose, file, hash, hasPassword, password }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (isOpen && file) {
            // Reset states
            setImageLoaded(false);
            setImageError(false);
            
            // Construct the image URL
            const downloadParams = hasPassword && password 
                ? `?password=${encodeURIComponent(password)}` 
                : "";
            
            const url = `/download/${hash}/${file.id}${downloadParams}`;
            setImageUrl(url);
        }
    }, [isOpen, file, hash, hasPassword, password]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !file) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-[30px] overflow-hidden">
                
                {/* Image Content */}
                <div className="flex items-center justify-center p-0 min-h-[300px]">
                    {!imageLoaded && !imageError && (
                        <div className="flex flex-col items-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p>Loading image...</p>
                        </div>
                    )}
                    
                    {imageError && (
                        <div className="flex flex-col items-center text-red-500">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p>Failed to load image</p>
                            <p className="text-sm text-gray-500">This file might not be a valid image or the link has expired</p>
                        </div>
                    )}

                    <img 
                        src={imageUrl}
                        alt={file.filename || file.name}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className={`w-full h-full max-w-full max-h-[50vh] object-cover ${
                            imageLoaded ? 'block' : 'hidden'
                        }`}
                    />
                </div>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-t">
                    <div className="flex-1">
                        <h3 className="text-md font-semibold text-gray-800 truncate">
                            {file.filename || file.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {file.type || 'Image'}
                        </p>
                    </div>
                </div>
                    <button 
                        onClick={onClose}
                        className="absolute bg-white w-[40px] h-[40px] flex items-center justify-center font-bold top-4 right-4 p-2 hover:bg-gray-100 rounded-[30px] transition-colors"
                    >
                        <CloseIcon className="h-6 w-6 text-gray-600" />
                    </button>

                

                {/* {imageLoaded && (
                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-center">
                            <a
                                href={imageUrl}
                                download={file.filename || file.name}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Download Image
                            </a>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default ImagePreviewModal;