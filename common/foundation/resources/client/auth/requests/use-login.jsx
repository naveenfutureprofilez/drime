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
    
    // Get the login path from localStorage
    const loginPath = localStorage.getItem('loginPath') || '/login';
    localStorage.removeItem('loginPath'); // Clean up
    
    // Determine redirect URI based on login route used or current context
    let redirectUri = '/'; // default redirect for /login (home page)
    
    // Debug: log the stored login path
    console.log('Login redirect - Stored login path:', loginPath);
    console.log('Login redirect - Current pathname:', location.pathname);
    console.log('Login redirect - Current URL:', window.location.href);
    
    // Check multiple ways to determine if this should redirect to admin
    const shouldRedirectToAdmin = loginPath === '/admin/login' || 
                                 location.pathname.includes('/admin') || 
                                 window.location.href.includes('/admin');
    
    if (shouldRedirectToAdmin) {
      console.log('Admin login detected, redirecting to /admin');
      redirectUri = '/admin';
    } else {
      console.log('Regular login, redirecting to home page');
    }
    
    navigate(redirectUri, {
      replace: true
    });
  }, [navigate, location]);
}
function login(payload) {
  return apiClient.post('auth/login', payload).then(response => response.data);
}