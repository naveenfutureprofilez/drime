import React from 'react';
import { FileUploadWidget } from './FileUploadWidget';

/**
 * Example usage of the FileUploadWidget with the new file selection & preview subsystem
 * 
 * Features demonstrated:
 * - FileReader API for image/video thumbnail generation
 * - Fallback to mime-type icons for unsupported file types
 * - Human-readable file names and sizes
 * - Multiple file support via array state hook
 * - Clean file management with add/remove functionality
 */
export function FileSelectionExample() {
  const handleUploadComplete = files => {
    console.log('Upload completed:', files);
  };
  const handleSpeed = speed => {
    console.log('Upload speed:', speed, 'bytes/sec');
  };
  const handleETA = eta => {
    console.log('ETA:', eta, 'seconds');
  };
  return <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        File Selection & Preview System
      </h1>
      
      <div className="mb-6 text-sm text-gray-600">
        <h2 className="font-semibold mb-2">Features:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>✓ Image thumbnails generated using FileReader API</li>
          <li>✓ Video thumbnails extracted from video frames</li>
          <li>✓ Fallback to mime-type specific icons</li>
          <li>✓ Human-readable file names and sizes</li>
          <li>✓ Multiple file support with array state management</li>
          <li>✓ Memory-efficient with URL cleanup</li>
        </ul>
      </div>

      <FileUploadWidget settings={{
      password: '',
      expiresInHours: 24,
      maxDownloads: 10
    }} onUploadComplete={handleUploadComplete} onSpeed={handleSpeed} onETA={handleETA} theme="light" />
    </div>;
}