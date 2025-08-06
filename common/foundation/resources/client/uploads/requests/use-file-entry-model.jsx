import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useFileEntryModel(entryIdOrUrl, options = {
  enabled: true
}) {
  const entryId = extractEntryId(entryIdOrUrl);
  return useQuery({
    queryKey: ['file-entries', `${entryId}`],
    queryFn: () => fetchFileEntry(entryId),
    enabled: !!entryId && options.enabled
  });
}
function fetchFileEntry(entryId) {
  return apiClient.get(`file-entries/${entryId}/model`).then(response => response.data);
}
function extractEntryId(entryIdOrUrl) {
  if (!entryIdOrUrl) {
    return undefined;
  }
  const parsedId = parseInt(entryIdOrUrl);
  if (!isNaN(parsedId)) {
    return parsedId;
  }
  return `${entryIdOrUrl}`.split('/').pop();
}