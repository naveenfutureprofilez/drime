import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { toast } from '@ui/toast/toast';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
export function useDeleteErrorLog() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => deleteLogFile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('logs/error')
      });
      toast(trans(message('Log file deleted')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function deleteLogFile({
  identifier
}) {
  return apiClient.delete(`logs/error/${identifier}`).then(r => r.data);
}