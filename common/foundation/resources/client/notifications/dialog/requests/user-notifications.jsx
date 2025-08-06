import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
const Endpoint = 'notifications';
export function useUserNotifications(payload) {
  return useQuery({
    queryKey: useUserNotifications.key,
    queryFn: () => fetchUserNotifications(payload)
  });
}
function fetchUserNotifications(payload) {
  return apiClient.get(Endpoint, {
    params: payload
  }).then(response => response.data);
}
useUserNotifications.key = [Endpoint];