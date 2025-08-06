import { apiClient } from '../../http/query-client';
import { useMutation } from '@tanstack/react-query';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
export function useExportCsv(endpoint) {
  return useMutation({
    mutationFn: payload => exportCsv(endpoint, payload),
    onError: err => showHttpErrorToast(err)
  });
}
function exportCsv(endpoint, payload) {
  return apiClient.post(endpoint, payload).then(r => r.data);
}