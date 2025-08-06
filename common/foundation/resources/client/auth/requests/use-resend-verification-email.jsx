import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient } from '../../http/query-client';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: payload => resendEmail(payload),
    onSuccess: () => {
      toast(message('Email sent'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function resendEmail(payload) {
  return apiClient.post('resend-email-verification', payload).then(response => response.data);
}