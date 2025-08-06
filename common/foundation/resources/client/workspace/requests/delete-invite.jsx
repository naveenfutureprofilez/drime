import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { useUserNotifications } from '../../notifications/dialog/requests/user-notifications';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
function deleteInvite({
  inviteId
}) {
  return apiClient.delete(`workspace/invite/${inviteId}`).then(r => r.data);
}
export function useDeleteInvite() {
  return useMutation({
    mutationFn: props => deleteInvite(props),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useUserNotifications.key
      });
      toast(message('Declined workspace invitation'));
    },
    onError: e => {
      if (axios.isAxiosError(e) && e.response && e.response.status === 404) {
        queryClient.invalidateQueries({
          queryKey: useUserNotifications.key
        });
        toast.danger(message('This invite is no longer valid'));
      } else {
        showHttpErrorToast(e);
      }
    }
  });
}