import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { invalidateEntryQueries } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { useMutation } from '@tanstack/react-query';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function addStarToEntries({
  entryIds
}) {
  return apiClient.post('file-entries/star', {
    entryIds
  }).then(response => response.data);
}
export function useAddStarToEntries() {
  return useMutation({
    mutationFn: payload => addStarToEntries(payload),
    onSuccess: (data, {
      entryIds
    }) => {
      invalidateEntryQueries();
      toast(message('Starred [one 1 item|other :count items]', {
        values: {
          count: entryIds.length
        }
      }));
    },
    onError: err => showHttpErrorToast(err, message('Could not star items'))
  });
}