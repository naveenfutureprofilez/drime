import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { invalidateEntryQueries } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useRestoreEntries() {
  return useMutation({
    mutationFn: payload => restoreEntries(payload),
    onSuccess: (r, p) => {
      invalidateEntryQueries();
      toast(message('Restored [one 1 item|other :count items]', {
        values: {
          count: p.entryIds.length
        }
      }));
    },
    onError: err => showHttpErrorToast(err, message('Could not restore items'))
  });
}
function restoreEntries(payload) {
  return apiClient.post('file-entries/restore', payload).then(response => response.data);
}