import { useQuery } from '@tanstack/react-query';
import { WorkspaceQueryKeys } from './requests/workspace-query-keys';
import { apiClient } from '../http/query-client';
export const PersonalWorkspace = {
  name: 'Default',
  default: true,
  id: 0,
  members_count: 1
};
function fetchUserWorkspaces() {
  return apiClient.get(`me/workspaces`).then(response => response.data);
}
function addPersonalWorkspaceToResponse(response) {
  return [PersonalWorkspace, ...response.workspaces];
}
export function useUserWorkspaces() {
  return useQuery({
    queryKey: WorkspaceQueryKeys.fetchUserWorkspaces,
    queryFn: fetchUserWorkspaces,
    placeholderData: {
      workspaces: []
    },
    select: addPersonalWorkspaceToResponse
  });
}