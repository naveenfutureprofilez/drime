import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
export function useCreateCustomPage(endpoint) {
  const finalEndpoint = endpoint || 'custom-pages';
  return useMutation({
    mutationFn: payload => createPage(payload, finalEndpoint),
    onError: err => showHttpErrorToast(err),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['custom-pages']
      });
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(finalEndpoint)
      });
      toast(message('Page created'));
    }
  });
}
function createPage(payload, endpoint) {
  return apiClient.post(`${endpoint}`, payload).then(r => r.data);
}