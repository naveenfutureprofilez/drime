import { Upload } from 'tus-js-client';
import { getAxiosErrorMessage } from '@common/http/get-axios-error-message';
import { apiClient } from '@common/http/query-client';
import { getCookie } from 'react-use-cookie';
export class TusUpload {
  constructor(upload, uploadGroupHash) {
    this.upload = upload;
    this.uploadGroupHash = uploadGroupHash;
  }
  start() {
    this.upload.start();
  }
  abort() {
    return this.upload.abort(true);
  }
  static async create(file, {
    onProgress,
    onSuccess,
    onError,
    metadata,
    chunkSize,
    baseUrl
  }) {
    const tusFingerprint = ['tus', file.fingerprint, 'drive'].join('-');
    const upload = new Upload(file.native, {
      fingerprint: () => Promise.resolve(tusFingerprint),
      removeFingerprintOnSuccess: true,
      endpoint: `${baseUrl}/api/v1/tus/upload`,
      chunkSize,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      overridePatchMethod: true,
      metadata: {
        name: window.btoa(file.id),
        clientName: file.name,
        clientExtension: file.extension,
        clientMime: file.mime || '',
        clientSize: `${file.size}`,
        ...metadata
      },
      headers: {
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
      },
      onError: err => {
        let errorDetails = {
          code: 'TUS_ERROR'
        };
        if ('originalResponse' in err && err.originalResponse) {
          try {
            const responseBody = err.originalResponse.getBody();
            const parsedError = JSON.parse(responseBody);
            const message = parsedError?.message;
            errorDetails = {
              code: 'TUS_SERVER_ERROR',
              response: {
                status: err.originalResponse.getStatus(),
                data: parsedError
              }
            };
            onError?.(message, errorDetails);
          } catch (e) {
            onError?.(null, errorDetails);
          }
        } else {
          // Network or client-side error
          errorDetails.code = 'TUS_NETWORK_ERROR';
          onError?.(null, errorDetails);
        }
      },
      onProgress(bytesUploaded, bytesTotal) {
        onProgress?.({
          bytesUploaded,
          bytesTotal
        });
      },
      onSuccess: async () => {
        const uploadKey = upload.url?.split('/').pop();
        try {
          if (uploadKey) {
            const response = await createFileEntry(uploadKey, {
              upload_group_hash: metadata.upload_group_hash,
              password: metadata.password,
              expires_in_hours: metadata.expires_in_hours,
              max_downloads: metadata.max_downloads,
              sender_email: metadata.sender_email,
              sender_name: metadata.sender_name,
              message: metadata.message
            });
            
            // Store the upload_group_hash for subsequent files to use
            if (response.upload_group_hash && !metadata.upload_group_hash) {
              // This was the first file, store the hash for subsequent files
              window.currentUploadGroupHash = response.upload_group_hash;
            }
            
            // Upload is complete - no processing feedback needed
            // Background jobs will handle heavy operations silently
            onSuccess?.(response.fileEntry, file);
          }
        } catch (err) {
          localStorage.removeItem(tusFingerprint);
          onError?.(getAxiosErrorMessage(err), err);
        }
      }
    });
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    return new TusUpload(upload, metadata.upload_group_hash);
  }
}
function createFileEntry(uploadKey, options = {}) {
  return apiClient.post('tus/entries', {
    uploadKey,
    upload_group_hash: options.upload_group_hash || null,
    password: options.password || null,
    expires_in_hours: options.expires_in_hours || null,
    max_downloads: options.max_downloads || null,
    sender_email: options.sender_email || null,
    sender_name: options.sender_name || null,
    message: options.message || null
  }).then(r => r.data);
}

