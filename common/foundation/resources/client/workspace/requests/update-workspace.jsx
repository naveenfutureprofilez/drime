import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { WorkspaceQueryKeys } from './workspace-query-keys';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { message } from '@ui/i18n/message';
function updateWorkspace({
  id,
  ...props
}) {
  return apiClient.put(`workspace/${id}`, props).then(r => r.data);
}
export function useUpdateWorkspace(form) {
  const {
    close
  } = useDialogContext();
  return useMutation({
    mutationFn: props => updateWorkspace(props),
    onSuccess: response => {
      close();
      toast(message('Updated workspace'));
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueryKeys.fetchUserWorkspaces
      });
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueryKeys.workspaceWithMembers(response.workspace.id)
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}