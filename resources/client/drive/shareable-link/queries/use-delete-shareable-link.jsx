import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { DriveQueryKeys } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function deleteShareableLink({
  entryId
}) {
  return apiClient.delete(`file-entries/${entryId}/shareable-link`).then(r => r.data);
}
export function useDeleteShareableLink() {
  return useMutation({
    mutationFn: ({
      entryId
    }) => deleteShareableLink({
      entryId
    }),
    onSuccess: (response, {
      entryId
    }) => {
      queryClient.setQueryData(DriveQueryKeys.fetchEntryShareableLink(entryId), {
        ...response,
        link: null
      });
    },
    onError: err => showHttpErrorToast(err, message('Could not delete link'))
  });
}