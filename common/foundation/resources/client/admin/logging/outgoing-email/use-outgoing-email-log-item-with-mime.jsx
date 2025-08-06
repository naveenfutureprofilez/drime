import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useOutgoingEmailLogItemWithMime(id) {
  return useQuery({
    queryKey: ['logs/outgoing-email', id],
    queryFn: () => fetchLogItem(id)
  });
}
function fetchLogItem(id) {
  return apiClient.get(`logs/outgoing-email/${id}`).then(r => r.data);
}