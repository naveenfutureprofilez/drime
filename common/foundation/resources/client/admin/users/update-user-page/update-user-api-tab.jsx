import { useOutletContext } from 'react-router';
import { AccessTokenPanel } from '@common/auth/ui/account-settings/access-token-panel/access-token-panel';
export function UpdateUserApiTab() {
  const user = useOutletContext();
  return <AccessTokenPanel user={user} />;
}