import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { DriveQueryKeys } from '../../drive-query-keys';
function updateShareableLink({
  entryId,
  ...payload
}) {
  return apiClient.put(`file-entries/${entryId}/shareable-link`, payload).then(response => response.data);
}
export function useUpdateShareableLink(form) {
  return useMutation({
    mutationFn: payload => updateShareableLink(payload),
    onSuccess: (data, {
      entryId
    }) => {
      queryClient.setQueryData(DriveQueryKeys.fetchEntryShareableLink(entryId), data);
    },
    onError: r => onFormQueryError(r, form)
  });
}