import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useUnbanUser(userId) {
  return useMutation({
    mutationFn: () => unbanUser(userId),
    onSuccess: () => {
      toast(message('User unsuspended'));
      queryClient.invalidateQueries({
        queryKey: ['users']
      });
    },
    onError: r => showHttpErrorToast(r)
  });
}
function unbanUser(userId) {
  return apiClient.delete(`users/unban/${userId}`).then(r => r.data);
}