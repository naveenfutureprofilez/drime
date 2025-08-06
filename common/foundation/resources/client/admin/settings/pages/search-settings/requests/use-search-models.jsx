import { apiClient } from '@common/http/query-client';
import { useQuery } from '@tanstack/react-query';
export function useSearchModels() {
  return useQuery({
    queryKey: ['search-models'],
    queryFn: () => fetchModels()
  });
}
function fetchModels() {
  return apiClient.get('admin/search/models').then(response => response.data);
}