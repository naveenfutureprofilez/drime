import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useAuth } from '@common/auth/use-auth';
export function useFollowedUsers() {
  const {
    user
  } = useAuth();
  return useQuery({
    queryKey: ['users', 'followed', 'ids'],
    queryFn: () => fetchIds(),
    enabled: !!user
  });
}
export function useIsUserFollowing(user) {
  const {
    data,
    isLoading
  } = useFollowedUsers();
  return {
    isLoading,
    isFollowing: !!data?.ids.includes(user.id)
  };
}
function fetchIds() {
  return apiClient.get(`users/me/followed-users/ids`).then(response => response.data);
}