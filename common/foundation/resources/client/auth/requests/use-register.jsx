import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
import { useAuth } from '../use-auth';
import { setBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
import { useParams } from 'react-router';
export function useRegister(form) {
  const navigate = useNavigate();
  const {
    getRedirectUri
  } = useAuth();
  const {
    inviteId
  } = useParams();
  return useMutation({
    mutationFn: payload => {
      return register({
        invite_id: inviteId,
        ...payload
      });
    },
    onSuccess: response => {
      setBootstrapData(response.bootstrapData);
      if (response.status === 'needs_email_verification') {
        navigate('/');
      } else {
        navigate(getRedirectUri(), {
          replace: true
        });
      }
    },
    onError: r => onFormQueryError(r, form)
  });
}
function register(payload) {
  return apiClient.post('auth/register', payload).then(response => response.data);
}