import { Upload } from 'tus-js-client';
import { getAxiosErrorMessage } from '@common/http/get-axios-error-message';
import { apiClient } from '@common/http/query-client';
import { getCookie } from 'react-use-cookie';
export class TusUpload {
  constructor(upload) {
    this.upload = upload;
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
            const response = await createFileEntry(uploadKey);
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
    return new TusUpload(upload);
  }
}
function createFileEntry(uploadKey) {
  return apiClient.post('tus/entries', {
    uploadKey
  }).then(r => r.data);
}