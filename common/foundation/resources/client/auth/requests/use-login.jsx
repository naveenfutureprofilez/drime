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
  const location = useLocation();
  
  // Store the current path for later use
  React.useEffect(() => {
    if (location.pathname === '/admin/login' || location.pathname === '/login') {
      localStorage.setItem('loginPath', location.pathname);
    }
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
    
    // Get the login path from localStorage
    const loginPath = localStorage.getItem('loginPath') || '/login';
    localStorage.removeItem('loginPath'); // Clean up
    
    // Determine redirect URI based on login route used
    let redirectUri = '/drive'; // default redirect for /login
    
    // Debug: log the stored login path
    console.log('Login redirect - Stored login path:', loginPath);
    console.log('Login redirect - Current pathname:', location.pathname);
    
    // Only redirect to /admin if user came from /admin/login
    if (loginPath === '/admin/login') {
      console.log('Admin login detected, redirecting to /admin');
      redirectUri = '/admin';
    } else {
      console.log('Regular login, redirecting to /drive');
    }
    
    navigate(redirectUri, {
      replace: true
    });
  }, [navigate, location]);
}
function login(payload) {
  return apiClient.post('auth/login', payload).then(response => response.data);
}