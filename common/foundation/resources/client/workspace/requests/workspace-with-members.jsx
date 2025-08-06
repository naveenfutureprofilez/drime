import { useQuery } from '@tanstack/react-query';
import { WorkspaceQueryKeys } from './workspace-query-keys';
import { apiClient } from '../../http/query-client';
function fetchWorkspaceWithMembers(workspaceId) {
  return apiClient.get(`workspace/${workspaceId}`).then(response => response.data);
}
export function useWorkspaceWithMembers(workspaceId) {
  return useQuery({
    queryKey: WorkspaceQueryKeys.workspaceWithMembers(workspaceId),
    queryFn: () => fetchWorkspaceWithMembers(workspaceId)
  });
}