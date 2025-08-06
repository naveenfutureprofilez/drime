import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function deleteAccessToken({
  id
}) {
  return apiClient.delete(`access-tokens/${id}`).then(r => r.data);
}
export function useDeleteAccessToken() {
  return useMutation({
    mutationFn: props => deleteAccessToken(props),
    onSuccess: () => {
      toast(message('Token deleted'));
    },
    onError: err => showHttpErrorToast(err)
  });
}