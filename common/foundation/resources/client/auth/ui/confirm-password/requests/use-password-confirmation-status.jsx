import { useQuery } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
export function usePasswordConfirmationStatus() {
  return useQuery({
    queryKey: ['password-confirmation-status'],
    queryFn: () => fetchStatus()
  });
}
function fetchStatus() {
  return apiClient.get('auth/user/confirmed-password-status', {
    params: {
      seconds: 9000
    }
  }).then(response => response.data);
}
export function setPasswordConfirmationStatus(confirmed) {
  queryClient.setQueryData(['password-confirmation-status'], {
    confirmed
  });
}