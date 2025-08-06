import { queryClient } from '@common/http/query-client';
export const DriveQueryKeys = {
  fetchEntries: params => {
    const key = ['drive-entries'];
    if (params) key.push(params);
    return key;
  },
  fetchUserFolders(params) {
    const key = ['user-folders'];
    if (params) {
      key.push(params);
    }
    return key;
  },
  fetchShareableLink: params => {
    const key = ['shareable-link'];
    if (params) {
      key.push(params);
    }
    return key;
  },
  fetchFolderPath(hash, params) {
    const key = ['folder-path'];
    if (hash) {
      key.push(hash);
    }
    if (params) {
      key.push(params);
    }
    return key;
  },
  fetchEntryShareableLink: entryId => {
    return ['file-entries', entryId, 'shareable-link'];
  },
  fetchFileEntry: id => {
    const key = ['drive/file-entries/model'];
    if (id) key.push(id);
    return key;
  },
  fetchStorageSummary: ['storage-summary']
};
export function invalidateEntryQueries() {
  return Promise.all([queryClient.invalidateQueries({
    queryKey: DriveQueryKeys.fetchEntries()
  }), queryClient.invalidateQueries({
    queryKey: DriveQueryKeys.fetchFolderPath()
  }), queryClient.invalidateQueries({
    queryKey: DriveQueryKeys.fetchUserFolders()
  }),
  // fetching model for single file entry in "useFileEntry"
  queryClient.invalidateQueries({
    queryKey: DriveQueryKeys.fetchFileEntry()
  })]);
}