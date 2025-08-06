import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { onFormQueryError } from '../errors/on-form-query-error';
import { useNavigate } from '../ui/navigation/use-navigate';
export function useSubmitContactForm(form) {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: props => submitContactForm(props),
    onSuccess: () => {
      toast(trans(message('Your message has been submitted.')));
      navigate('/');
    },
    onError: err => onFormQueryError(err, form)
  });
}
function submitContactForm(payload) {
  return apiClient.post('contact-page', payload).then(r => r.data);
}