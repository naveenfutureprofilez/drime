import { useMoveEntries } from './queries/use-move-entries';
import { useDriveUploadQueue } from '../uploading/use-drive-upload-queue';
import { canMoveEntriesInto } from './utils/can-move-entries-into';
import { driveState } from '@app/drive/drive-store';
export function useFolderDropAction(folder) {
  const moveEntries = useMoveEntries();
  const {
    uploadFiles
  } = useDriveUploadQueue();
  const onDrop = async target => {
    if (folder.type !== 'folder') return;
    if (target.type === 'nativeFile') {
      uploadFiles(await target.getData(), {
        metadata: {
          parentId: folder.id
        }
      });
    } else if (target.type === 'fileEntry') {
      const entries = target.getData();
      if (entries?.length && canMoveEntriesInto(entries, folder)) {
        moveEntries.mutate({
          destinationId: folder.id,
          entryIds: entries.map(e => e.id)
        });
        driveState().deselectEntries('all');
      }
    }
  };
  return {
    onDrop
  };
}
export function folderAcceptsDrop(target, destination) {
  if (target.type === 'fileEntry') {
    const entries = target.getData();
    return canMoveEntriesInto(entries, destination);
  }
  return true;
}