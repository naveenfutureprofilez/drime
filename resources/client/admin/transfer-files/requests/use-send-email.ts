import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {useTrans} from '@common/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';

interface SendEmailPayload {
  sender_email: string;
  recipient_emails: string[];
  sender_name?: string;
  message?: string;
}

interface SendEmailResponse {
  sender_email: string;
  recipient_count: number;
  link_url: string;
}

function sendEmail(transferFileId: number, payload: SendEmailPayload): Promise<BackendResponse<SendEmailResponse>> {
  return apiClient.post(`admin/transfer-files/${transferFileId}/send-email`, payload).then(r => r.data);
}

export function useSendEmail() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: ({transferFileId, ...payload}: SendEmailPayload & {transferFileId: number}) =>
      sendEmail(transferFileId, payload),
    onSuccess: (response) => {
      toast.positive(
        trans(
          message('Email sent successfully to {count} recipients', {
            values: {count: response.data.recipient_count}
          })
        )
      );
      queryClient.invalidateQueries({queryKey: ['admin/transfer-files']});
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || trans(message('Failed to send email'));
      toast.danger(errorMessage);
    },
  });
}
