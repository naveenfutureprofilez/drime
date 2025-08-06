import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useUserSessions() {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => fetchUserSessions()
  });
}
function fetchUserSessions() {
  return apiClient.get(`user-sessions`).then(response => response.data);
}