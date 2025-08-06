import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { mergeBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
export function useChangeLocale() {
  return useMutation({
    mutationFn: props => changeLocale(props),
    onSuccess: response => {
      mergeBootstrapData({
        i18n: response.locale
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}
function changeLocale(props) {
  return apiClient.post(`users/me/locale`, props).then(r => r.data);
}