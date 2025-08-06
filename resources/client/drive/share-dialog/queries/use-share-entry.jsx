import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { invalidateEntryQueries } from '../../drive-query-keys';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function shareEntry({
  entryId,
  ...payload
}) {
  return apiClient.post(`file-entries/${entryId}/share`, payload).then(response => response.data);
}
export function useShareEntry() {
  return useMutation({
    mutationFn: payload => shareEntry(payload),
    onSuccess: () => {
      invalidateEntryQueries();
    },
    onError: err => {
      if (axios.isAxiosError(err) && err.response) {
        const response = err.response.data;
        if (response.errors?.emails) {
          toast.danger(response.errors?.emails[0]);
        } else {
          showHttpErrorToast(err);
        }
      }
    }
  });
}