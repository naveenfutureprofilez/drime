import { useMutation } from '@tanstack/react-query';
import { linkPageState } from '../link-page-store';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { message } from '@ui/i18n/message';
function checkLinkPassword({
  password,
  linkHash
}) {
  return apiClient.post(`shareable-links/${linkHash}/check-password`, {
    password
  }).then(r => r.data);
}
export function useCheckLinkPassword() {
  return useMutation({
    mutationFn: props => checkLinkPassword(props),
    onSuccess: (response, props) => {
      if (response.matches) {
        linkPageState().setPassword(props.password);
      }
    },
    onError: err => showHttpErrorToast(err, message('Could not create link'))
  });
}