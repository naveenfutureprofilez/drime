import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: enable,
    onError: r => showHttpErrorToast(r)
  });
}
function enable() {
  return apiClient.post('auth/user/two-factor-authentication').then(response => response.data);
}