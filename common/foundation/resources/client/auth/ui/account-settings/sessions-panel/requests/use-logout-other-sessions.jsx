import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useLogoutOtherSessions() {
  return useMutation({
    mutationFn: payload => logoutOther(payload),
    onError: r => showHttpErrorToast(r)
  });
}
function logoutOther(payload) {
  return apiClient.post('user-sessions/logout-other', payload).then(response => response.data);
}