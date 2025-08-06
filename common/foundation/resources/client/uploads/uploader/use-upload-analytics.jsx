import { useMemo } from 'react';
import { useFileUploadStore } from './file-upload-provider';
import { formatSpeed, formatETA } from './upload-analytics-utils';
/**
 * Custom hook that provides upload analytics for a specific file
 */
export function useUploadAnalytics(fileId) {
  const fileUpload = useFileUploadStore(s => s.fileUploads.get(fileId));
  return useMemo(() => {
    const percentage = fileUpload?.percentage || 0;
    const bytesUploaded = fileUpload?.bytesUploaded || 0;
    const speed = fileUpload?.speed || 0;
    const eta = fileUpload?.eta || 0;
    const status = fileUpload?.status || 'pending';
    return {
      percentage,
      bytesUploaded,
      speed,
      eta,
      speedFormatted: formatSpeed(speed),
      etaFormatted: formatETA(eta),
      status
    };
  }, [fileUpload?.percentage, fileUpload?.bytesUploaded, fileUpload?.speed, fileUpload?.eta, fileUpload?.status]);
}