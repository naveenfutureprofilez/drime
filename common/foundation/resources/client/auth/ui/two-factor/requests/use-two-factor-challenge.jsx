import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { useHandleLoginSuccess } from '@common/auth/requests/use-login';
import { useLocation } from 'react-router';

export function useTwoFactorChallenge(form) {
  const handleSuccess = useHandleLoginSuccess();
  const location = useLocation();
  
  return useMutation({
    mutationFn: payload => completeChallenge(payload),
    onSuccess: response => {
      // Ensure the loginPath is preserved for 2FA success
      const storedPath = localStorage.getItem('loginPath');
      console.log('2FA Challenge success - Retrieved login path:', storedPath);
      console.log('2FA Challenge success - Current pathname:', location.pathname);
      
      // If no stored path but we're in 2FA flow, try to determine original intent
      if (!storedPath && location.pathname.includes('admin')) {
        console.log('2FA from admin context, setting admin path');
        localStorage.setItem('loginPath', '/admin/login');
      }
      
      handleSuccess(response);
    },
    onError: r => onFormQueryError(r, form)
  });
}
function completeChallenge(payload) {
  return apiClient.post('auth/two-factor-challenge', payload).then(response => response.data);
}