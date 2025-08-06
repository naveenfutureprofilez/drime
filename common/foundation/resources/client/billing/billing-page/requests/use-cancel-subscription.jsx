import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useCancelSubscription() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => cancelSubscription(props),
    onSuccess: (response, payload) => {
      toast(payload.delete ? trans(message('Subscription deleted.')) : trans(message('Subscription cancelled.')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function cancelSubscription({
  subscriptionId,
  ...payload
}) {
  return apiClient.post(`billing/subscriptions/${subscriptionId}/cancel`, payload).then(r => r.data);
}