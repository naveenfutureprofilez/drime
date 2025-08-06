import { UploadedFile } from '@ui/utils/files/uploaded-file';
export function createUpload(file, strategyConfig, storeOptions) {
  let uploadedFile = file instanceof UploadedFile ? file : new UploadedFile(file);
  if (storeOptions?.modifyUploadedFile) {
    uploadedFile = storeOptions.modifyUploadedFile(uploadedFile);
  }
  return {
    file: uploadedFile,
    percentage: 0,
    bytesUploaded: 0,
    status: 'pending',
    options: strategyConfig || {},
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 1000,
    isRetrying: false
  };
}