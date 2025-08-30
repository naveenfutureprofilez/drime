import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { queryClient } from '@common/http/query-client';

export function useBulkDeleteTransferFiles() {
  return useMutation({
    mutationFn: ({ ids }) =>
      apiClient.post('admin/transfer-files/bulk-delete', { ids }).then((r) => r.data),
    onSuccess: (data) => {
      const count = data.deleted_count || 0;
      toast.positive(message(`Successfully deleted ${count} transfer files`));
      queryClient.invalidateQueries({ 
        queryKey: DatatableDataQueryKey('admin-transfer-files') 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'transfer-files', 'stats'] 
      });
    },
    onError: (err) => {
      const errorMessage = err?.response?.data?.message || 'Failed to delete transfer files';
      toast.danger(message(errorMessage));
    },
  });
}
