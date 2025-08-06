import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
import { useAuth } from '../use-auth';
import { setBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
export function useConnectSocialWithPassword(form) {
  const navigate = useNavigate();
  const {
    getRedirectUri
  } = useAuth();
  return useMutation({
    mutationFn: connect,
    onSuccess: response => {
      setBootstrapData(response.bootstrapData);
      navigate(getRedirectUri(), {
        replace: true
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}
function connect(payload) {
  return apiClient.post('secure/auth/social/connect', payload).then(response => response.data);
}