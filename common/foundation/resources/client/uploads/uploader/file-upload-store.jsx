import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { UploadedFileFromEntry } from '@ui/utils/files/uploaded-file';
import { S3MultipartUpload } from './strategy/s3-multipart-upload';
import { TusUpload } from './strategy/tus-upload';
import { startUploading } from './start-uploading';
import { createUpload } from './create-file-upload';
enableMapSet();
const initialState = {
  concurrency: 3,
  fileUploads: new Map(),
  activeUploadsCount: 0,
  completedUploadsCount: 0
};
export const createFileUploadStore = ({
  settings,
  options
}) => create()(immer((set, get) => {
  return {
    ...initialState,
    reset: () => {
      set(initialState);
    },
    getUpload: uploadId => {
      return get().fileUploads.get(uploadId);
    },
    getCompletedFileEntries: () => {
      return [...get().fileUploads.values()].filter(u => !!u.entry).map(u => u.entry);
    },
    clearInactive: () => {
      set(state => {
        state.fileUploads.forEach((upload, key) => {
          if (upload.status !== 'inProgress') {
            state.fileUploads.delete(key);
          }
        });
      });
      get().runQueue();
    },
    abortUpload: id => {
      const upload = get().fileUploads.get(id);
      if (upload) {
        upload.request?.abort();
        get().updateFileUpload(id, {
          status: 'aborted',
          percentage: 0
        });
        get().runQueue();
      }
    },
    retryUpload: id => {
      const upload = get().fileUploads.get(id);
      if (upload && upload.status === 'failed') {
        const currentRetryCount = upload.retryCount || 0;
        const maxRetries = upload.maxRetries || 3;
        if (currentRetryCount < maxRetries) {
          // Calculate exponential backoff delay
          const baseDelay = upload.retryDelay || 1000;
          const delay = baseDelay * Math.pow(2, currentRetryCount);
          get().updateFileUpload(id, {
            status: 'pending',
            isRetrying: true,
            retryCount: currentRetryCount + 1,
            percentage: 0,
            bytesUploaded: 0,
            speed: 0,
            eta: 0,
            previousTimestamp: undefined,
            previousBytes: undefined,
            errorMessage: undefined,
            request: undefined,
            timer: undefined
          });

          // Implement exponential backoff
          setTimeout(() => {
            get().updateFileUpload(id, {
              isRetrying: false
            });
            get().runQueue();
          }, delay);
        }
      }
    },
    updateFileUpload: (id, newUploadState) => {
      set(state => {
        const fileUpload = state.fileUploads.get(id);
        if (fileUpload) {
          state.fileUploads.set(id, {
            ...fileUpload,
            ...newUploadState
          });

          // only need to update inProgress count if status of the uploads in queue change
          if ('status' in newUploadState) {
            updateTotals(state);
          }
        }
      });
    },
    addCompletedFileUpload: entry => {
      set(state => {
        state.fileUploads.set(`${entry.id}`, {
          file: new UploadedFileFromEntry(entry),
          status: 'completed',
          entry,
          percentage: 100,
          bytesUploaded: entry.file_size || 0,
          options: {}
        });
        updateTotals(state);
      });
    },
    uploadSingle: (file, userOptions) => {
      const upload = createUpload(file, userOptions, options);
      const fileUploads = new Map(get().fileUploads);
      fileUploads.set(upload.file.id, upload);
      set(state => {
        updateTotals(state);
        state.fileUploads = fileUploads;
      });
      get().runQueue();
      return upload.file.id;
    },
    removeUpload: id => {
      set(state => {
        state.fileUploads.delete(id);
        updateTotals(state);
      });
    },
    uploadMultiple: (files, strategyConfig) => {
      // create file upload items from specified files
      const uploads = new Map(get().fileUploads);
      [...files].forEach(file => {
        const upload = createUpload(file, strategyConfig, options);
        uploads.set(upload.file.id, upload);
      });

      // set state only once, there might be thousands of files, don't want to trigger a rerender for each one
      set(state => {
        updateTotals(state);
        state.fileUploads = uploads;
      });
      get().runQueue();
      return [...uploads.keys()];
    },
    runQueue: async () => {
      const uploads = [...get().fileUploads.values()];
      const activeUploads = uploads.filter(u => u.status === 'inProgress');
      let concurrency = get().concurrency;
      if (activeUploads.filter(activeUpload =>
      // only upload one file from folder at a time to avoid creating duplicate folders
      activeUpload.file.relativePath ||
      // only allow one s3 multipart upload at a time, it will already upload multiple parts in parallel
      activeUpload.request instanceof S3MultipartUpload ||
      // only allow one tus upload if file is larger than chunk size, tus will have parallel uploads already in that case
      activeUpload.request instanceof TusUpload && settings.uploads.chunk_size && activeUpload.file.size > settings.uploads.chunk_size).length) {
        concurrency = 1;
      }
      if (activeUploads.length < concurrency) {
        //const pendingUploads = uploads.filter(u => u.status === 'pending');
        //const next = pendingUploads.find(a => !!a.request);
        const next = uploads.find(u => u.status === 'pending');
        if (next) {
          await startUploading(next, get());
        }
      }
    }
  };
}));
const updateTotals = state => {
  state.completedUploadsCount = [...state.fileUploads.values()].filter(u => u.status === 'completed').length;
  state.activeUploadsCount = [...state.fileUploads.values()].filter(u => u.status === 'inProgress' || u.status === 'pending').length;
};