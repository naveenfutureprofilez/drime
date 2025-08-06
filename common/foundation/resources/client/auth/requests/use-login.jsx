import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
import { useAuth } from '../use-auth';
import { useCallback } from 'react';
import { setBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
export function useLogin(form) {
  const handleSuccess = useHandleLoginSuccess();
  return useMutation({
    mutationFn: login,
    onSuccess: response => {
      if (!response.two_factor) {
        handleSuccess(response);
      }
    },
    onError: r => onFormQueryError(r, form)
  });
}
export function useHandleLoginSuccess() {
  const navigate = useNavigate();
  const {
    getRedirectUri
  } = useAuth();
  return useCallback(response => {
    setBootstrapData(response.bootstrapData);
    navigate(getRedirectUri(), {
      replace: true
    });
  }, [navigate, getRedirectUri]);
}
function login(payload) {
  return apiClient.post('auth/login', payload).then(response => response.data);
}