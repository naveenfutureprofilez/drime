import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient } from '@common/http/query-client';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useImpersonateUser() {
  return useMutation({
    mutationFn: payload => impersonateUser(payload),
    onSuccess: async response => {
      toast(message(`Impersonating User "${response.user.name}"`));
      window.location.href = '/';
    },
    onError: r => showHttpErrorToast(r)
  });
}
function impersonateUser(payload) {
  return apiClient.post(`admin/users/impersonate/${payload.userId}`, payload).then(r => r.data);
}