import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
export function useValidateEmailVerificationOtp(form) {
  return useMutation({
    mutationFn: payload => validate(payload),
    onSuccess: () => {
      window.location.reload();
    },
    onError: err => onFormQueryError(err, form)
  });
}
function validate(payload) {
  return apiClient.post('validate-email-verification-otp', payload).then(response => response.data);
}