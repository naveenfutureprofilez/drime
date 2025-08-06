import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { message } from '@ui/i18n/message';
export const saveAppearanceChangesMutationKey = ['appearance-editor-save'];
export function useSaveAppearanceChanges() {
  return useMutation({
    mutationKey: saveAppearanceChangesMutationKey,
    mutationFn: values => {
      return saveChanges(values);
    },
    onSuccess: async response => {
      queryClient.setQueryData(['admin/appearance/values'], response);
      toast(message('Changes saved'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function saveChanges(changes) {
  return apiClient.post(`admin/appearance`, {
    changes
  }).then(r => r.data);
}