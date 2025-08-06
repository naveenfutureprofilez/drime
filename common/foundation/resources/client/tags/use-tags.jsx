import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useTags(params) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: ({
      signal
    }) => fetchTags(params, signal),
    placeholderData: keepPreviousData
  });
}
async function fetchTags(params, signal) {
  if (params.query) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return apiClient.get(`tags`, {
    params: {
      paginate: 'simple',
      ...params
    },
    signal: params.query ? signal : undefined
  }).then(response => response.data);
}