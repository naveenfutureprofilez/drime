import { useOutletContext } from 'react-router';
import { LocalizationPanel } from '@common/auth/ui/account-settings/localization-panel';
export function UpdateUserDatetimeTab() {
  const user = useOutletContext();
  return <LocalizationPanel user={user} />;
}