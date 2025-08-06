import { Link } from 'react-router';
import clsx from 'clsx';
import React, { useContext, useMemo } from 'react';
import { SiteConfigContext } from '@common/core/settings/site-config-context';
export function UserProfileLink({
  user,
  className,
  ...linkProps
}) {
  const {
    auth
  } = useContext(SiteConfigContext);
  const finalUri = useMemo(() => {
    return auth.getUserProfileLink(user);
  }, [auth, user]);
  return <Link {...linkProps} className={clsx('hover:underline', className)} to={finalUri}>
      {user.name}
    </Link>;
}