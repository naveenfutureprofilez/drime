import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
export function useSubmitReport(model) {
  return useMutation({
    mutationFn: payload => submitReport(model, payload),
    onSuccess: () => {
      toast(message('Thanks for reporting. We will review this content.'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function submitReport(model, payload) {
  return apiClient.post('report', {
    reason: payload.reason,
    model_id: model.id,
    model_type: model.model_type
  }).then(r => r.data);
}