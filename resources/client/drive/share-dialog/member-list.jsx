import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import clsx from 'clsx';
import { getPermissionItemForUser, PermissionSelector } from './permission-selector';
import { IconButton } from '@ui/buttons/icon-button';
import { CloseIcon } from '@ui/icons/material/Close';
import { useChangePermission } from './queries/use-change-permission';
import { useUnshareEntries } from './queries/use-unshare-entries';
import { Trans } from '@ui/i18n/trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { UserAvatar } from '@common/auth/user-avatar';
export function MemberList({
  className,
  entry
}) {
  if (!entry) return null;
  const users = entry.users;
  return <div className={clsx(className, 'overflow-hidden')}>
      <div className="mb-14 text-sm">
        <Trans message="Who has access" />
      </div>
      <AnimatePresence initial={false}>
        {users.map(user => <MemberListItem key={user.id} user={user} entry={entry} />)}
      </AnimatePresence>
    </div>;
}
function MemberListItem({
  user,
  entry
}) {
  return <m.div initial={{
    x: '-100%',
    opacity: 0
  }} animate={{
    x: 0,
    opacity: 1
  }} exit={{
    x: '100%',
    opacity: 0
  }} transition={{
    type: 'tween',
    duration: 0.125
  }} className="mb-20 flex items-center gap-14 text-sm" key={user.id}>
      <UserAvatar user={user} circle size="w-44 h-44" />
      <div>
        <div>{user.name}</div>
        <div className="text-muted">{user.email}</div>
      </div>
      <div className="ml-auto">
        {user.owns_entry ? <span className="text-muted">
            <Trans message="Owner" />
          </span> : <ActionButtons user={user} entry={entry} />}
      </div>
    </m.div>;
}
function ActionButtons({
  user,
  entry
}) {
  const changePermissions = useChangePermission();
  const unshareEntry = useUnshareEntries();
  const [activePermission, setActivePermission] = useState(() => {
    return getPermissionItemForUser(user);
  });
  return <div className="flex items-center gap-10">
      <PermissionSelector isDisabled={changePermissions.isPending} onChange={item => {
      changePermissions.mutate({
        userId: user.id,
        permissions: item.value,
        entryId: entry.id
      });
      setActivePermission(item);
    }} value={activePermission} />
      <IconButton disabled={unshareEntry.isPending} onClick={() => {
      unshareEntry.mutate({
        userId: user.id,
        entryIds: [entry.id]
      }, {
        onSuccess: () => {
          toast(message('Member removed'));
        },
        onError: err => showHttpErrorToast(err, message('Could not remove member'))
      });
    }}>
        <CloseIcon />
      </IconButton>
    </div>;
}