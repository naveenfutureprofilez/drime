import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useQueueStats() {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => fetchStats(),
    refetchInterval: 5000 // Poll every 5s
  });
}
function fetchStats() {
  return apiClient.get('horizon/api/stats').then(response => response.data);
}