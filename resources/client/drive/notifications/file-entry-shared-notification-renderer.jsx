import { NotificationListItem } from '@common/notifications/notification-list';
import { FileTypeIcon } from '@common/uploads/components/file-type-icon/file-type-icon';
export function FileEntrySharedNotificationRenderer(props) {
  return <NotificationListItem lineIconRenderer={IconRenderer} {...props} />;
}
function IconRenderer({
  icon
}) {
  return <FileTypeIcon className="h-16 w-16" type={icon} />;
}