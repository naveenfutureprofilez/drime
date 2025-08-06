import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useUpdateComment() {
  return useMutation({
    mutationFn: props => updateComment(props),
    onSuccess: () => {
      toast(message('Comment updated'));
      queryClient.invalidateQueries({
        queryKey: ['comment']
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}
function updateComment({
  commentId,
  content
}) {
  return apiClient.put(`comment/${commentId}`, {
    content
  }).then(r => r.data);
}