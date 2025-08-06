import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: props => createComment(props),
    onSuccess: async (response, props) => {
      await queryClient.invalidateQueries({
        queryKey: ['comment', `${props.commentable.id}-${props.commentable.model_type}`]
      });
      toast(message('Comment posted'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function createComment({
  commentable,
  content,
  inReplyTo,
  ...other
}) {
  const payload = {
    commentable_id: commentable.id,
    commentable_type: commentable.model_type,
    content,
    inReplyTo,
    ...other
  };
  return apiClient.post('comment', payload).then(r => r.data);
}