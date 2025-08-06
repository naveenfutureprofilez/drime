import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@common/auth/use-auth';
import { DriveQueryKeys } from '../../drive-query-keys';
import { apiClient } from '@common/http/query-client';
import { useActiveWorkspaceId } from '@common/workspace/active-workspace-id-context';
function fetchUserFolders(params) {
  return apiClient.get(`users/${params.userId}/folders`, {
    params
  }).then(response => response.data);
}
export function useFolders() {
  const {
    user
  } = useAuth();
  const {
    workspaceId
  } = useActiveWorkspaceId();
  const params = {
    userId: user.id,
    workspaceId
  };
  return useQuery({
    queryKey: DriveQueryKeys.fetchUserFolders(params),
    queryFn: () => fetchUserFolders(params),
    enabled: !!user
  });
}