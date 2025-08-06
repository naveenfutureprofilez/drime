import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useSeoTags(name) {
  return useQuery({
    queryKey: ['admin', 'seo-tags', name],
    queryFn: () => fetchTags(name)
  });
}
function fetchTags(name) {
  return apiClient.get(`admin/appearance/seo-tags/${name}`).then(response => response.data);
}