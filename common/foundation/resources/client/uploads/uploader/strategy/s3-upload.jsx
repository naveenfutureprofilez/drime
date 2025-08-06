import axios from 'axios';
import { getAxiosErrorMessage } from '@common/http/get-axios-error-message';
import { apiClient } from '@common/http/query-client';
export class S3Upload {
  constructor(file, config) {
    this.file = file;
    this.config = config;
    this.abortController = new AbortController();
  }
  async start() {
    this.presignedRequest = await this.presignPostUrl();
    if (!this.presignedRequest) return;
    const result = await this.uploadFileToS3();
    if (result !== 'uploaded') return;
    const response = await this.createFileEntry();
    if (response?.fileEntry) {
      this.config.onSuccess?.(response.fileEntry, this.file);
    } else if (!this.abortController.signal) {
      this.config.onError?.(null, this.file);
    }
  }
  abort() {
    this.abortController.abort();
    return Promise.resolve();
  }
  presignPostUrl() {
    return apiClient.post('s3/simple/presign', {
      filename: this.file.name,
      mime: this.file.mime,
      disk: this.config.metadata?.disk,
      size: this.file.size,
      extension: this.file.extension,
      ...this.config.metadata
    }, {
      signal: this.abortController.signal
    }).then(r => r.data).catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        this.config.onError?.(getAxiosErrorMessage(err), err);
      }
    });
  }
  uploadFileToS3() {
    const {
      url,
      acl
    } = this.presignedRequest;
    return axios.put(url, this.file.native, {
      signal: this.abortController.signal,
      withCredentials: false,
      headers: {
        'Content-Type': this.file.mime,
        'x-amz-acl': acl
      },
      onUploadProgress: e => {
        if (e.event.lengthComputable) {
          this.config.onProgress?.({
            bytesUploaded: e.loaded,
            bytesTotal: e.total || 0
          });
        }
      }
    }).then(() => 'uploaded').catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        this.config.onError?.(getAxiosErrorMessage(err), err);
      }
    });
  }
  async createFileEntry() {
    return await apiClient.post('s3/entries', {
      ...this.config.metadata,
      clientMime: this.file.mime,
      clientName: this.file.name,
      filename: this.presignedRequest.key.split('/').pop(),
      size: this.file.size,
      clientExtension: this.file.extension
    }).then(r => {
      return r.data;
    }).catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        this.config.onError?.(getAxiosErrorMessage(err), err);
      }
    });
  }
  static async create(file, config) {
    return new S3Upload(file, config);
  }
}