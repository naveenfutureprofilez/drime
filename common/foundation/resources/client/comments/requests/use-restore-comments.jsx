import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
export function useRestoreComments() {
  return useMutation({
    mutationFn: payload => restoreComment(payload),
    onSuccess: (response, payload) => {
      toast(message('Restored [one 1 comment|other :count comments]', {
        values: {
          count: payload.commentIds.length
        }
      }));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function restoreComment({
  commentIds
}) {
  return apiClient.post('comment/restore', {
    commentIds
  }).then(r => r.data);
}