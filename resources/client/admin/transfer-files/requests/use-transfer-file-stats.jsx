import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';

export function useTransferFileStats() {
  return useQuery({
    queryKey: ['admin', 'transfer-files', 'stats'],
    queryFn: () => apiClient.get('admin/transfer-files/stats').then((r) => r.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
