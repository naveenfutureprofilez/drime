import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useRegenerateTwoFactorCodes() {
  return useMutation({
    mutationFn: () => regenerate(),
    onError: r => showHttpErrorToast(r)
  });
}
function regenerate() {
  return apiClient.post('auth/user/two-factor-recovery-codes').then(response => response.data);
}