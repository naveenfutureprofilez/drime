import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
function fetchNotificationSubscriptions() {
  return apiClient.get('notifications/me/subscriptions').then(response => response.data);
}
export function useNotificationSubscriptions() {
  return useQuery({
    queryKey: ['notification-subscriptions'],
    queryFn: () => fetchNotificationSubscriptions(),
    staleTime: Infinity
  });
}