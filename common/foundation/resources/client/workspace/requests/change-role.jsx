import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { WorkspaceQueryKeys } from './workspace-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
function ChangeRole({
  workspaceId,
  member,
  ...other
}) {
  const modelType = member.model_type;
  const memberId = member.model_type === 'invite' ? member.id : member.member_id;
  return apiClient.post(`workspace/${workspaceId}/${modelType}/${memberId}/change-role`, other).then(r => r.data);
}
export function useChangeRole() {
  return useMutation({
    mutationFn: props => ChangeRole(props),
    onSuccess: (response, props) => {
      toast(message('Role changed'));
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueryKeys.workspaceWithMembers(props.workspaceId)
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}