import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
export function useNormalizedModel(endpoint, queryParams, queryOptions) {
  return useQuery({
    queryKey: [endpoint, queryParams],
    queryFn: () => fetchModel(endpoint, queryParams),
    ...queryOptions
  });
}
async function fetchModel(endpoint, params) {
  return apiClient.get(endpoint, {
    params
  }).then(r => r.data);
}