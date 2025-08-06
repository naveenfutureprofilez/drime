import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function removeAvatar(user) {
  return apiClient.delete(`users/${user.id}/avatar`).then(r => r.data);
}
export function useRemoveAvatar({
  user
}) {
  return useMutation({
    mutationFn: () => removeAvatar(user),
    onSuccess: () => {
      toast(message('Removed avatar'));
    },
    onError: err => showHttpErrorToast(err)
  });
}