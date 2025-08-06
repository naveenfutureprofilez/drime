import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useCustomDomains(payload) {
  return useQuery({
    queryKey: ['custom-domain', payload],
    queryFn: () => fetchCustomDomains(payload)
  });
}
function fetchCustomDomains(payload) {
  return apiClient.get('custom-domain', {
    params: payload
  }).then(response => response.data);
}