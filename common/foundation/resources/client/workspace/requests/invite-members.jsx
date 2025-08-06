import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '../../http/query-client';
import { WorkspaceQueryKeys } from './workspace-query-keys';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
function InviteMembers({
  workspaceId,
  ...other
}) {
  return apiClient.post(`workspace/${workspaceId}/invite`, other).then(r => r.data);
}
export function useInviteMembers() {
  return useMutation({
    mutationFn: props => InviteMembers(props),
    onSuccess: (response, props) => {
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueryKeys.workspaceWithMembers(props.workspaceId)
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}