import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function clearCache() {
  return apiClient.post('cache/flush').then(r => r.data);
}
export function useClearCache() {
  return useMutation({
    mutationFn: () => clearCache(),
    onSuccess: () => {
      toast(message('Cache cleared'));
    },
    onError: err => showHttpErrorToast(err)
  });
}