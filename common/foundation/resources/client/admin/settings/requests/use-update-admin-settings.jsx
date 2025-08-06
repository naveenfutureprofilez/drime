import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
export function useUpdateAdminSettings(form) {
  return useMutation({
    mutationFn: props => updateAdminSettings(props),
    onSuccess: response => {
      toast(message('Settings updated'), {
        position: 'bottom-right'
      });
      return queryClient.setQueryData(['fetchAdminSettings'], response);
    },
    onError: r => onFormQueryError(r, form)
  });
}
function updateAdminSettings({
  client,
  server,
  files
}) {
  const formData = new FormData();
  if (client) {
    formData.set('client', JSON.stringify(client));
  }
  if (server) {
    formData.set('server', JSON.stringify(server));
  }
  Object.entries(files || {}).forEach(([key, file]) => {
    formData.set(key, file);
  });
  return apiClient.post('settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(r => r.data);
}