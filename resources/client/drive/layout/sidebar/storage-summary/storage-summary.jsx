import { useQuery } from '@tanstack/react-query';
import { DriveQueryKeys } from '../../../drive-query-keys';
import { apiClient } from '@common/http/query-client';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export function useStorageSummary() {
  return useQuery({
    queryKey: DriveQueryKeys.fetchStorageSummary,
    queryFn: fetchStorageSummary,
    select: formatResponse
  });
}
function fetchStorageSummary() {
  return apiClient.get(`user/space-usage`).then(response => response.data);
}
function formatResponse(response) {
  // null means that user has unlimited space available
  const percentage = response.available === null ? 0 : response.used * 100 / response.available;
  return {
    usedFormatted: prettyBytes(response.used, 2),
    availableFormatted: prettyBytes(response.available, 0),
    percentage,
    used: response.used,
    available: response.available
  };
}