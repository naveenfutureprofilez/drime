import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { useHandleLoginSuccess } from '@common/auth/requests/use-login';
export function useTwoFactorChallenge(form) {
  const handleSuccess = useHandleLoginSuccess();
  return useMutation({
    mutationFn: payload => completeChallenge(payload),
    onSuccess: response => {
      handleSuccess(response);
    },
    onError: r => onFormQueryError(r, form)
  });
}
function completeChallenge(payload) {
  return apiClient.post('auth/two-factor-challenge', payload).then(response => response.data);
}