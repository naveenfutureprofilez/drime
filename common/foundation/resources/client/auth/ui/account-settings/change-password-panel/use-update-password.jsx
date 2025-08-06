import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
export function useUpdatePassword(form) {
  return useMutation({
    mutationFn: props => updatePassword(props),
    onSuccess: () => {
      toast(message('Password changed'));
    },
    onError: r => onFormQueryError(r, form)
  });
}
function updatePassword(payload) {
  return apiClient.put('auth/user/password', payload).then(r => r.data);
}