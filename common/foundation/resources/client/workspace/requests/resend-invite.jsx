import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient } from '../../http/query-client';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
function ResendInvite({
  workspaceId,
  inviteId,
  ...other
}) {
  return apiClient.post(`workspace/${workspaceId}/${inviteId}/resend`, other).then(r => r.data);
}
export function useResendInvite() {
  return useMutation({
    mutationFn: props => ResendInvite(props),
    onSuccess: () => {
      toast('Invite sent');
    },
    onError: err => showHttpErrorToast(err)
  });
}