import React, { useEffect } from 'react';
import { ProgressBar } from '@ui/progress/progress-bar';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { Trans } from '@ui/i18n/trans';
export function TransferProgress({
  onComplete
}) {
  useEffect(() => {
    // Simulate upload progress for demo
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return <div className="text-center py-12">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileUploadIcon className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        <Trans message="Uploading your files..." />
      </h3>
      <p className="text-gray-500 mb-6">
        <Trans message="Please wait while we process your files" />
      </p>
      <div className="max-w-md mx-auto">
        <ProgressBar isIndeterminate />
      </div>
    </div>;
}