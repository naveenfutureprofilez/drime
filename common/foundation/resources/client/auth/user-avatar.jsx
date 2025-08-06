import { Avatar } from '@ui/avatar/avatar';
import { useContext } from 'react';
import { SiteConfigContext } from '@common/core/settings/site-config-context';
export function UserAvatar({
  user,
  ...props
}) {
  const {
    auth
  } = useContext(SiteConfigContext);
  return <Avatar {...props} label={user?.name} src={user?.image} link={user?.id && auth.getUserProfileLink?.(user)} />;
}