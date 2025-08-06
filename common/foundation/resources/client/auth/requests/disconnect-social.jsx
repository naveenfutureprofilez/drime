import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
export function useDisconnectSocial() {
  return useMutation({
    mutationFn: disconnect,
    onError: err => showHttpErrorToast(err)
  });
}
function disconnect(payload) {
  return apiClient.post(`secure/auth/social/${payload.service}/disconnect`, payload).then(response => response.data);
}