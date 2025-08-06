import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useAddableContent(params) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => search(params),
    //enabled: !!params.query,
    placeholderData: params.query ? keepPreviousData : undefined
  });
}
function search(params) {
  return apiClient.get(`channel/search-for-addable-content`, {
    params
  }).then(response => response.data);
}