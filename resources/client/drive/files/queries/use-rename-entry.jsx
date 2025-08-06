import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { invalidateEntryQueries } from '../../drive-query-keys';
import { onFormQueryError } from '@common/errors/on-form-query-error';
export function useRenameEntry(form) {
  return useMutation({
    mutationFn: payload => renameEntry(payload),
    onSuccess: (r, p) => {
      invalidateEntryQueries();
      toast(message(':oldName renamed to :newName', {
        values: {
          oldName: p.initialName,
          newName: r.fileEntry.name
        }
      }));
    },
    onError: err => onFormQueryError(err, form)
  });
}
function renameEntry({
  entryId,
  ...payload
}) {
  return apiClient.put(`file-entries/${entryId}`, payload).then(response => response.data);
}