import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function UpdateNotificationSettings(payload) {
  return apiClient.put('notifications/me/subscriptions', {
    selections: payload
  }).then(r => r.data);
}
export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: payload => UpdateNotificationSettings(payload),
    onSuccess: () => {
      toast(message('Updated preferences'));
      queryClient.invalidateQueries({
        queryKey: ['notification-subscriptions']
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}