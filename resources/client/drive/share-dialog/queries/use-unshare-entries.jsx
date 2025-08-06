import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { invalidateEntryQueries } from '../../drive-query-keys';
export function useUnshareEntries() {
  return useMutation({
    mutationFn: payload => unshareEntries(payload),
    onSuccess: () => {
      return invalidateEntryQueries();
    }
  });
}
function unshareEntries({
  entryIds,
  ...payload
}) {
  return apiClient.post(`file-entries/${entryIds.join(',')}/unshare`, payload).then(response => response.data);
}