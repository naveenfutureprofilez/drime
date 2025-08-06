import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
const endpoint = 'billing/subscriptions';
export function useCreateSubscription(form) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => createNewSubscription(props),
    onSuccess: () => {
      toast(trans(message('Subscription created')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint)
      });
    },
    onError: err => onFormQueryError(err, form)
  });
}
function createNewSubscription(payload) {
  return apiClient.post(endpoint, payload).then(r => r.data);
}