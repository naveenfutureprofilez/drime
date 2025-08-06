import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useTwoFactorQrCode() {
  return useQuery({
    queryKey: ['two-factor-qr-code'],
    queryFn: () => fetchCode()
  });
}
function fetchCode() {
  return apiClient.get('auth/user/two-factor/qr-code').then(response => response.data);
}