import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { getAxiosErrorMessage } from '@common/http/get-axios-error-message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
function UploadAvatar({
  file,
  url
}, user) {
  const payload = new FormData();
  if (file) {
    payload.set('file', file.native);
  } else {
    payload.set('url', url);
  }
  return apiClient.post(`users/${user.id}/avatar`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(r => r.data);
}
export function useUploadAvatar({
  user
}) {
  return useMutation({
    mutationFn: payload => UploadAvatar(payload, user),
    onSuccess: () => {
      toast(message('Uploaded avatar'));
    },
    onError: err => {
      const message = getAxiosErrorMessage(err, 'file');
      if (message) {
        toast.danger(message);
      } else {
        showHttpErrorToast(err);
      }
    }
  });
}