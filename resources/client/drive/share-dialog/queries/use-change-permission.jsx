import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { invalidateEntryQueries } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useChangePermission() {
  return useMutation({
    mutationFn: payload => changePermission(payload),
    onSuccess: () => {
      invalidateEntryQueries();
      toast(message('Updated user permissions'));
    },
    onError: err => showHttpErrorToast(err, message('Could not update permissions'))
  });
}
function changePermission({
  entryId,
  ...payload
}) {
  return apiClient.put(`file-entries/${entryId}/change-permissions`, payload).then(response => response.data);
}