import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
export function useNormalizedModels(endpoint, queryParams, queryOptions) {
  return useQuery({
    queryKey: [...endpoint.split('/'), queryParams],
    queryFn: () => fetchModels(endpoint, queryParams),
    placeholderData: keepPreviousData,
    ...queryOptions
  });
}
async function fetchModels(endpoint, params) {
  return apiClient.get(endpoint, {
    params
  }).then(r => {
    if ('results' in r.data) {
      return r.data;
    } else {
      const results = Object.values(r.data).find(v => Array.isArray(v));
      return {
        results
      };
    }
  });
}