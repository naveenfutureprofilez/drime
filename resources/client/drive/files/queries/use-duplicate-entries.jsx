import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { DriveQueryKeys, invalidateEntryQueries } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function duplicateEntries(payload) {
  return apiClient.post('file-entries/duplicate', payload).then(response => response.data);
}
export function useDuplicateEntries() {
  return useMutation({
    mutationFn: payload => {
      toast.loading(message('Duplicating [one 1 item|other :count items]...', {
        values: {
          count: payload.entryIds.length
        }
      }), {
        disableExitAnimation: true
      });
      return duplicateEntries(payload);
    },
    onSuccess: (r, p) => {
      invalidateEntryQueries();
      queryClient.invalidateQueries({
        queryKey: DriveQueryKeys.fetchStorageSummary
      });
      toast(message('Duplicated [one 1 item|other :count items]', {
        values: {
          count: p.entryIds.length
        }
      }), {
        disableEnterAnimation: true
      });
    },
    onError: err => showHttpErrorToast(err, message('Could not duplicate items'), null, {
      disableEnterAnimation: true
    })
  });
}