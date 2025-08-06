import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
export function useBanUser(form, userId) {
  return useMutation({
    mutationFn: payload => banUser(userId, payload),
    onSuccess: async () => {
      toast(message('User suspended'));
      await queryClient.invalidateQueries({
        queryKey: ['users']
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}
function banUser(userId, payload) {
  return apiClient.post(`users/ban/${userId}`, payload).then(r => r.data);
}