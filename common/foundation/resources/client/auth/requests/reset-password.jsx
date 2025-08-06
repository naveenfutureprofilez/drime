import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
function reset(payload) {
  return apiClient.post('auth/reset-password', payload).then(response => response.data);
}
export function useResetPassword(form) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: reset,
    onSuccess: () => {
      navigate('/login', {
        replace: true
      });
      toast(message('Your password has been reset!'));
    },
    onError: r => onFormQueryError(r, form)
  });
}