import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useGenerateDropboxRefreshToken() {
  return useMutation({
    mutationFn: props => generateToken(props),
    onError: err => showHttpErrorToast(err)
  });
}
function generateToken(payload) {
  return apiClient.post('settings/uploading/dropbox-refresh-token', payload).then(r => r.data);
}