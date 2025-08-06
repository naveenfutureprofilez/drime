import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
function createAccessToken(payload) {
  return apiClient.post(`access-tokens`, payload).then(r => r.data);
}
export function useCreateAccessToken(form) {
  return useMutation({
    mutationFn: props => createAccessToken(props),
    onSuccess: () => {
      toast(message('Token create'));
    },
    onError: r => onFormQueryError(r, form)
  });
}