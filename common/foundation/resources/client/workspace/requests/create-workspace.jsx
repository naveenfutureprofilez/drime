import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { WorkspaceQueryKeys } from './workspace-query-keys';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { message } from '@ui/i18n/message';
export function useCreateWorkspace(form) {
  return useMutation({
    mutationFn: props => createWorkspace(props),
    onSuccess: () => {
      toast(message('Created workspace'));
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueryKeys.fetchUserWorkspaces
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}
function createWorkspace(props) {
  return apiClient.post('workspace', props).then(r => r.data);
}