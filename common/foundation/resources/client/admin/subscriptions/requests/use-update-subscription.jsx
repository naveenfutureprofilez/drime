import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
export function useUpdateSubscription(form) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => updateSubscription(props),
    onSuccess: () => {
      toast(trans(message('Subscription updated')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('billing/subscriptions')
      });
    },
    onError: err => onFormQueryError(err, form)
  });
}
function updateSubscription({
  id,
  ...payload
}) {
  return apiClient.put(`billing/subscriptions/${id}`, payload).then(r => r.data);
}