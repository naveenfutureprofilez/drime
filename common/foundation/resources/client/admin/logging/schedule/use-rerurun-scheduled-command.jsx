import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { message } from '@ui/i18n/message';
import { toast } from '@ui/toast/toast';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
export function useRerunScheduledCommand() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => rerunCommand(payload),
    onSuccess: async (response, props) => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('logs/schedule')
      });
      toast.positive(trans(message('Command reran')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function rerunCommand({
  id
}) {
  return apiClient.post(`logs/schedule/rerun/${id}`).then(r => r.data);
}