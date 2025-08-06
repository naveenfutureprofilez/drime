import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useResumeSubscription() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => resumeSubscription(props),
    onSuccess: () => {
      toast(trans(message('Subscription renewed.')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function resumeSubscription({
  subscriptionId
}) {
  return apiClient.post(`billing/subscriptions/${subscriptionId}/resume`).then(r => r.data);
}