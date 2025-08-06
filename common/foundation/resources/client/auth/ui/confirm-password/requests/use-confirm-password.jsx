import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
export function useConfirmPassword(form) {
  return useMutation({
    mutationFn: payload => confirm(payload),
    onError: r => onFormQueryError(r, form)
  });
}
function confirm(payload) {
  return apiClient.post('auth/user/confirm-password', payload).then(response => response.data);
}