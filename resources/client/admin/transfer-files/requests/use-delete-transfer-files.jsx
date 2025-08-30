import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { queryClient } from '@common/http/query-client';

export function useDeleteTransferFiles() {
  return useMutation({
    mutationFn: ({ id }) =>
      apiClient.delete(`admin/transfer-files/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.positive(message('Transfer file deleted'));
      queryClient.invalidateQueries({ 
        queryKey: DatatableDataQueryKey('admin-transfer-files') 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'transfer-files', 'stats'] 
      });
    },
    onError: (err) => {
      const errorMessage = err?.response?.data?.message || 'Failed to delete transfer file';
      toast.danger(message(errorMessage));
    },
  });
}
