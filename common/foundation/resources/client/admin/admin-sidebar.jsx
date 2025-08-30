import React, { Fragment, useContext } from 'react';
import { Trans } from '@ui/i18n/trans';
import { useSettings } from '@ui/settings/use-settings';
import { DashboardLeftSidebar, DashboardLeftSidebarItem } from '@common/ui/dashboard-layout/dashboard-left-sidebar';
import { useAuth } from '@common/auth/use-auth';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { NotificationsIcon } from '@ui/icons/material/Notifications';
import { Badge } from '@ui/badge/badge';
import { NotificationsDialog } from '@common/notifications/dialog/notification-dialog-trigger';
import { NavbarAuthMenu } from '@common/ui/navigation/navbar/navbar-auth-menu';
import { UserAvatar } from '@common/auth/user-avatar';
import { KeyboardArrowUpIcon } from '@ui/icons/material/KeyboardArrowUp';

export function AdminSidebar(props) {
  const isCompactMode = false;
  return <DashboardLeftSidebar 
    {...props} 
    matchDescendants={to => to === '/admin'} 
    menuName="admin-sidebar" 
    bottomContent={<AdminSidebarAuthUserItem isCompact={isCompactMode} />}
    />;
}
// export function AdminSidebarNotificationsItem({
//   isCompact
// }) {
//   const {
//     user
//   } = useAuth();
//   const hasUnread = !!user?.unread_notifications_count;
//   return <DialogTrigger type="popover" placement="top">
//       <DashboardLeftSidebarItem isCompact={isCompact} className="relative">
//         <NotificationsIcon />
//         <Trans message="Notifications" />
//         {hasUnread ? <Badge>{user?.unread_notifications_count}</Badge> : undefined}
//       </DashboardLeftSidebarItem>
//       <NotificationsDialog />
//     </DialogTrigger>;
// }

export function AdminSidebarAuthUserItem({
  isCompact,
  avatar: propsAvatar
}) {
  const {
    user
  } = useAuth();
  if (!user) return null;
  const ItemAvatar = propsAvatar || UserAvatar;
  const avatar = <ItemAvatar user={user} size="w-32 h-32" />;
  return <NavbarAuthMenu placement="top">
      {isCompact ? <button aria-label="toggle authentication menu" className="flex h-48 w-48 items-center justify-center rounded-button hover:bg-hover">
          {avatar}
        </button> : <button className="flex w-full items-center rounded-button px-12 py-8 hover:bg-hover">
          {avatar}
          <span className="ml-8 block min-w-0 overflow-x-hidden overflow-ellipsis whitespace-nowrap text-sm">
            {user.name}
          </span>
          <KeyboardArrowUpIcon size="xs" className="ml-auto block" />
        </button>}
    </NavbarAuthMenu>;
}
