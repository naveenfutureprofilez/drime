import { useMutation } from '@tanstack/react-query';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient, queryClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useApplyChannelPreset() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => resetChannels(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('channel')
      });
      toast(trans(message('Channel preset applied')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function resetChannels(payload) {
  return apiClient.post('channel/apply-preset', payload).then(r => r.data);
}