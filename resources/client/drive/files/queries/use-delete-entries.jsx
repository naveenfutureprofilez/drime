import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { DriveQueryKeys, invalidateEntryQueries } from '../../drive-query-keys';
import { message } from '@ui/i18n/message';
import { getAxiosErrorMessage } from '@common/http/get-axios-error-message';
function deleteEntries(payload) {
  return apiClient.post('file-entries/delete', payload).then(response => response.data);
}
export function useDeleteEntries() {
  return useMutation({
    mutationFn: payload => {
      toast.loading(getLoaderMessage(payload), {
        disableExitAnimation: true
      });
      return deleteEntries(payload);
    },
    onSuccess: (r, {
      entryIds,
      emptyTrash,
      deleteForever
    }) => {
      invalidateEntryQueries();
      queryClient.invalidateQueries({
        queryKey: DriveQueryKeys.fetchStorageSummary
      });
      if (emptyTrash) {
        toast(message('Emptied trash'), {
          disableEnterAnimation: true
        });
      } else if (deleteForever) {
        toast(message('Permanently deleted [one 1 item|other :count items]', {
          values: {
            count: entryIds.length
          }
        }), {
          disableEnterAnimation: true
        });
      } else {
        toast(message('Moved [one 1 item|other :count items] to trash', {
          values: {
            count: entryIds.length
          }
        }), {
          disableEnterAnimation: true
        });
      }
    },
    onError: (err, {
      emptyTrash
    }) => {
      const backendError = getAxiosErrorMessage(err);
      if (backendError) {
        toast.danger(backendError, {
          disableEnterAnimation: true
        });
      } else if (emptyTrash) {
        toast.danger('could not empty trash', {
          disableEnterAnimation: true
        });
      } else {
        toast.danger('Could not delete items', {
          disableEnterAnimation: true
        });
      }
    }
  });
}
function getLoaderMessage(payload) {
  if (payload.emptyTrash) {
    return message('Emptying trash...');
  } else if (payload.deleteForever) {
    return message('Deleting files...');
  } else {
    return message('Moving to trash...');
  }
}