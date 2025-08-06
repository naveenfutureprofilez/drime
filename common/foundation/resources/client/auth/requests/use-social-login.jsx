import { useCallback, useState } from 'react';
import { toast } from '@ui/toast/toast';
import { useDisconnectSocial } from './disconnect-social';
import { useTrans } from '@ui/i18n/use-trans';
import { getBootstrapData, setBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
export function useSocialLogin() {
  const {
    trans
  } = useTrans();
  const disconnectSocial = useDisconnectSocial();
  const [requestingPassword, setIsRequestingPassword] = useState(false);
  const handleSocialLoginCallback = useCallback(e => {
    const {
      status,
      callbackData
    } = e;
    if (!status) return;
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        if (callbackData?.bootstrapData) {
          setBootstrapData(callbackData.bootstrapData);
        }
        return e;
      case 'REQUEST_PASSWORD':
        setIsRequestingPassword(true);
        return e;
      case 'ERROR':
        const message = callbackData?.errorMessage || trans({
          message: 'An error occurred. Please try again later'
        });
        toast.danger(message);
        return e;
      default:
        return e;
    }
  }, [trans, setBootstrapData]);
  return {
    requestingPassword,
    setIsRequestingPassword,
    loginWithSocial: async serviceName => {
      const event = await openNewSocialAuthWindow(`secure/auth/social/${serviceName}/login`);
      return handleSocialLoginCallback(event);
    },
    connectSocial: async serviceNameOrUrl => {
      const url = serviceNameOrUrl.includes('/') ? serviceNameOrUrl : `secure/auth/social/${serviceNameOrUrl}/connect`;
      const event = await openNewSocialAuthWindow(url);
      return handleSocialLoginCallback(event);
    },
    disconnectSocial
  };
}
const windowHeight = 550;
const windowWidth = 650;
let win;
function openNewSocialAuthWindow(url) {
  const left = window.screen.width / 2 - windowWidth / 2;
  const top = window.screen.height / 2 - windowHeight / 2;
  return new Promise(resolve => {
    win = window.open(url, 'Authenticate Account', `menubar=0, location=0, toolbar=0, titlebar=0, status=0, scrollbars=1, width=${windowWidth}, height=${windowHeight}, left=${left}, top=${top}`);
    const messageListener = e => {
      const baseUrl = getBootstrapData().settings.base_url;
      if (e.data.type === 'social-auth' && baseUrl.indexOf(e.origin) > -1) {
        resolve(e.data);
        window.removeEventListener('message', messageListener);
      }
    };
    window.addEventListener('message', messageListener);

    // if user closes social login callback without interacting with it, remove message event listener
    const timer = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(timer);
        resolve({});
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  });
}