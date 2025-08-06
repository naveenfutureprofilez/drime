import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useAdminSetupAlerts() {
  return useQuery({
    queryKey: ['admin-setup-alerts'],
    queryFn: () => fetchAlerts()
  });
}
function fetchAlerts() {
  return apiClient.get(`admin/setup-alerts`).then(response => response.data);
}