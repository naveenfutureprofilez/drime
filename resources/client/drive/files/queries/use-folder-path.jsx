import { useQuery } from '@tanstack/react-query';
import { DriveQueryKeys } from '../../drive-query-keys';
import { apiClient } from '@common/http/query-client';
export function useFolderPath({
  hash,
  params,
  isEnabled = true
}) {
  return useQuery({
    queryKey: DriveQueryKeys.fetchFolderPath(hash, params),
    queryFn: () => fetchFolderPath(hash, params),
    enabled: !!hash && isEnabled
  });
}
function fetchFolderPath(hash, params) {
  return apiClient.get(`folders/${hash}/path`, {
    params
  }).then(response => response.data);
}