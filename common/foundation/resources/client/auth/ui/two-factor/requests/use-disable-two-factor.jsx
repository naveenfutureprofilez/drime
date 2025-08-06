import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useDisableTwoFactor() {
  return useMutation({
    mutationFn: disable,
    onError: r => showHttpErrorToast(r)
  });
}
function disable() {
  return apiClient.delete('auth/user/two-factor-authentication').then(response => response.data);
}