import { useFileUploadStore } from '@common/uploads/uploader/file-upload-provider';
import { useCallback } from 'react';
import { driveState } from '../drive-store';
import { UploadedFile } from '@ui/utils/files/uploaded-file';
import { queryClient } from '@common/http/query-client';
import { DriveQueryKeys, invalidateEntryQueries } from '../drive-query-keys';
import { useStorageSummary } from '../layout/sidebar/storage-summary/storage-summary';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { useSettings } from '@ui/settings/use-settings';
import { getActiveWorkspaceId } from '@common/workspace/active-workspace-id';
const EightMB = 8388608;
export function useDriveUploadQueue() {
  const uploadMultiple = useFileUploadStore(s => s.uploadMultiple);
  const {
    data: usage
  } = useStorageSummary();
  const {
    uploads
  } = useSettings();
  const maxFileSize = uploads.max_size || EightMB;
  const allowedFileTypes = uploads.allowed_extensions;
  const blockedFileTypes = uploads.blocked_extensions;
  const uploadFiles = useCallback((files, options = {}) => {
    if (!options.metadata) {
      options.metadata = {};
    }
    options.metadata.workspaceId = getActiveWorkspaceId();
    if (!options.metadata.parentId) {
      options.metadata.parentId = driveState().activePage?.folder?.id ?? null;
    }
    files = [...files].map(file => {
      return file instanceof UploadedFile ? file : new UploadedFile(file);
    });

    // check if this upload will not put user over their allowed storage space
    if (usage) {
      const sizeOfFiles = files.reduce((sum, file) => sum + file.size, 0);
      const currentlyUsing = usage.used;
      const availableSpace = usage.available;
      if (sizeOfFiles + currentlyUsing > availableSpace) {
        toast.danger(message('You have exhausted your allowed space of :space. Delete some files or upgrade your plan.', {
          values: {
            space: usage.availableFormatted
          }
        }), {
          action: {
            action: '/pricing',
            label: message('Upgrade')
          }
        });
        return;
      }
    }
    uploadMultiple(files, {
      ...options,
      restrictions: {
        maxFileSize,
        allowedFileTypes,
        blockedFileTypes
      },
      onSuccess: (entry, file) => {
        options?.onSuccess?.(entry, file);
        invalidateEntryQueries();
        queryClient.invalidateQueries({
          queryKey: DriveQueryKeys.fetchStorageSummary
        });
      }
    });
    driveState().setUploadQueueIsOpen(true);
  }, [uploadMultiple, allowedFileTypes, blockedFileTypes, maxFileSize, usage]);
  return {
    uploadFiles
  };
}