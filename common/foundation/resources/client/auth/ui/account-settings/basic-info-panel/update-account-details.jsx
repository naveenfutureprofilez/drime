import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
export function useUpdateAccountDetails(userId, form) {
  return useMutation({
    mutationFn: props => updateAccountDetails(userId, props),
    onSuccess: () => {
      toast(message('Updated account details'));
    },
    onError: r => onFormQueryError(r, form)
  });
}
function updateAccountDetails(userId, payload) {
  return apiClient.put(`users/${userId}`, payload).then(r => r.data);
}