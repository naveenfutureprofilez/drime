import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useDeleteComments() {
  return useMutation({
    mutationFn: payload => deleteComments(payload),
    onSuccess: (response, payload) => {
      toast(message('[one Comment deleted|other Deleted :count comments]', {
        values: {
          count: payload.commentIds.length
        }
      }));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function deleteComments({
  commentIds
}) {
  return apiClient.delete(`comment/${commentIds.join(',')}`).then(r => r.data);
}