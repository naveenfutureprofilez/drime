import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { useParams } from 'react-router';
export function useUpdateCustomPage(endpoint) {
  const {
    pageId
  } = useParams();
  const finalEndpoint = `${endpoint || 'custom-pages'}/${pageId}`;
  return useMutation({
    mutationFn: payload => updatePage(payload, finalEndpoint),
    onError: err => showHttpErrorToast(err),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['custom-pages']
      });
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(finalEndpoint)
      });
      toast(message('Page updated'));
    }
  });
}
function updatePage(payload, endpoint) {
  return apiClient.put(`${endpoint}`, payload).then(r => r.data);
}