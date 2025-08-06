import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '../../http/query-client';
import { toast } from '@ui/toast/toast';
import { DatatableDataQueryKey } from './paginated-resources';
import { useDataTable } from '../page/data-table-context';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
export function useDeleteSelectedRows() {
  const {
    endpoint,
    selectedRows,
    setSelectedRows,
    baseQueryKey
  } = useDataTable();
  return useMutation({
    mutationFn: () => deleteSelectedRows(endpoint, selectedRows),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint, undefined, baseQueryKey)
      });
      toast(message('Deleted [one 1 record|other :count records]', {
        values: {
          count: selectedRows.length
        }
      }));
      setSelectedRows([]);
    },
    onError: err => showHttpErrorToast(err, message('Could not delete records'))
  });
}
function deleteSelectedRows(endpoint, ids) {
  return apiClient.delete(`${endpoint}/${ids.join(',')}`).then(r => r.data);
}