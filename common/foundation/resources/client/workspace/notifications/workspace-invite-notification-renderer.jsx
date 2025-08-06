import { useJoinWorkspace } from '@common/workspace/requests/join-workspace';
import { NotificationListItem } from '@common/notifications/notification-list';
import { useDeleteInvite } from '@common/workspace/requests/delete-invite';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
export function WorkspaceInviteNotificationRenderer(props) {
  const {
    notification
  } = props;
  const joinWorkspace = useJoinWorkspace();
  const deleteInvite = useDeleteInvite();
  const dialogContextValue = useDialogContext();
  return <NotificationListItem {...props} onActionButtonClick={(e, {
    action
  }) => {
    const data = notification.data;
    if (action === 'join') {
      joinWorkspace.mutate({
        inviteId: data.inviteId
      });
    }
    if (action === 'decline') {
      deleteInvite.mutate({
        inviteId: data.inviteId
      });
    }
    dialogContextValue?.close();
  }} />;
}