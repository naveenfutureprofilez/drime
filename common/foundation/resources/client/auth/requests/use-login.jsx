import { useMutation } from '@tanstack/react-query';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { useNavigate } from '../../ui/navigation/use-navigate';
import { apiClient } from '../../http/query-client';
import { useAuth } from '../use-auth';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router';
import { setBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
import { getFromLocalStorage } from '@ui/utils/hooks/local-storage';
export function useLogin(form) {
  const handleSuccess = useHandleLoginSuccess();
  const location = useLocation();
  
  return useMutation({
    mutationFn: login,
    onSuccess: response => {
      // Store the login path at the moment of successful login attempt
      // This ensures it's captured before any navigation happens
      if (location.pathname === '/admin/login' || location.pathname === '/login') {
        console.log('Storing login path during login success:', location.pathname);
        localStorage.setItem('loginPath', location.pathname);
      }
      
      if (!response.two_factor) {
        console.log('No 2FA required, proceeding to handleSuccess');
        handleSuccess(response);
      } else {
        console.log('2FA required, stored login path:', localStorage.getItem('loginPath'));
      }
      // If two_factor is true, the user will be redirected to 2FA page
      // but the loginPath is already stored
    },
    onError: r => onFormQueryError(r, form)
  });
}
export function useHandleLoginSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getRedirectUri } = useAuth();
  
  // Store the current path for later use
  React.useEffect(() => {
    if (location.pathname === '/admin/login' || location.pathname === '/login') {
      localStorage.setItem('loginPath', location.pathname);
    }
    // Don't clear the stored path during 2FA challenge
    // The 2FA challenge page should preserve the original login context
  }, [location.pathname]);
  
  return useCallback(response => {
    setBootstrapData(response.bootstrapData);
    
    // Check for onboarding flow first
    const onboarding = getFromLocalStorage('be.onboarding.selected');
    if (onboarding) {
      navigate(`/checkout/${onboarding.productId}/${onboarding.priceId}`, {
        replace: true
      });
      return;
    }
    
    // Clean up stored login path
    localStorage.removeItem('loginPath');
    
    // Use the auth system's getRedirectUri method which checks admin permissions
    const redirectUri = getRedirectUri();
    
    console.log('Login redirect - Using auth system redirect URI:', redirectUri);
    
    navigate(redirectUri, {
      replace: true
    });
  }, [navigate, location, getRedirectUri]);
}
function login(payload) {
  return apiClient.post('auth/login', payload).then(response => response.data);
}