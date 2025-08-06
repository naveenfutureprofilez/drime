import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
export function useDeleteReport(model) {
  return useMutation({
    mutationFn: () => deleteReport(model),
    onSuccess: () => {
      toast(message('Report removed'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function deleteReport(reportable) {
  return apiClient.delete(`report/${reportable.model_type}/${reportable.id}`).then(r => r.data);
}