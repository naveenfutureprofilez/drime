import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useImportSearchModels() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => importModels(payload),
    onSuccess: () => {
      toast(trans(message('Imported search models')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function importModels(payload) {
  return apiClient.post('admin/search/import', payload).then(r => r.data);
}