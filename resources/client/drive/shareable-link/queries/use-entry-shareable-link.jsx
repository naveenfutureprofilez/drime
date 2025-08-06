import { useQuery } from '@tanstack/react-query';
import { DriveQueryKeys } from '../../drive-query-keys';
import { apiClient } from '@common/http/query-client';
export function useEntryShareableLink(entryId) {
  return useQuery({
    queryKey: DriveQueryKeys.fetchEntryShareableLink(entryId),
    queryFn: () => fetchLinkByEntryId(entryId),
    enabled: !!entryId
  });
}
function fetchLinkByEntryId(entryId) {
  return apiClient.get(`file-entries/${entryId}/shareable-link`, {
    params: {
      loader: 'shareableLink'
    }
  }).then(response => response.data);
}