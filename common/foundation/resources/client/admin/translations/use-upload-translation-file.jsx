import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '../../datatable/requests/paginated-resources';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
import { getLocalWithLinesQueryKey } from './use-locale-with-lines';
export function useUploadTranslationFile() {
  return useMutation({
    mutationFn: payload => uploadFile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('localizations')
      });
      await queryClient.invalidateQueries({
        queryKey: getLocalWithLinesQueryKey()
      });
      toast(message('Translation file uploaded'));
    },
    onError: r => showHttpErrorToast(r)
  });
}
function uploadFile({
  localeId,
  file
}) {
  const data = new FormData();
  data.append('file', file.native);
  return apiClient.post(`localizations/${localeId}/upload`, data).then(r => r.data);
}