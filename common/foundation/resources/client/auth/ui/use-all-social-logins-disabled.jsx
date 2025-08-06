import { useSettings } from '@ui/settings/use-settings';
export function useAllSocialLoginsDisabled() {
  const {
    social
  } = useSettings();
  return !social?.google?.enable && !social?.facebook?.enable && !social?.twitter?.enable && !social?.envato?.enable;
}