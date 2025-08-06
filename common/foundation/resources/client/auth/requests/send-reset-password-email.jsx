import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { toast } from '@ui/toast/toast';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
export function useSendPasswordResetEmail(form) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: sendResetPasswordEmail,
    onSuccess: response => {
      toast(response.message);
      navigate('/login');
    },
    onError: r => onFormQueryError(r, form)
  });
}
function sendResetPasswordEmail(payload) {
  return apiClient.post('auth/forgot-password', payload).then(response => response.data);
}