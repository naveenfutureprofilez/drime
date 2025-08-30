import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { queryClient } from '@common/http/query-client';

export function useCleanupTransferFiles() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('admin/transfer-files/cleanup').then((r) => r.data),
    onSuccess: (data) => {
      const deletedCount = data.deleted_uploads || 0;
      toast.positive(message(`Cleanup completed. Removed ${deletedCount} expired files`));
      queryClient.invalidateQueries({ 
        queryKey: DatatableDataQueryKey('admin-transfer-files') 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'transfer-files', 'stats'] 
      });
    },
    onError: (err) => {
      const errorMessage = err?.response?.data?.message || 'Cleanup failed';
      toast.danger(message(errorMessage));
    },
  });
}
