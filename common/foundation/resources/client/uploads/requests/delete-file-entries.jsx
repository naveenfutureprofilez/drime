import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
function deleteFileEntries(payload) {
  return apiClient.post('file-entries/delete', payload).then(r => r.data);
}
export function useDeleteFileEntries() {
  return useMutation({
    mutationFn: props => deleteFileEntries(props),
    onError: err => showHttpErrorToast(err)
  });
}