import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { useNavigate } from '@common/ui/navigation/use-navigate';
export function useUpdateUser(userId, form) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: payload => updateUser(userId, payload),
    onSuccess: (response, props) => {
      toast(message('User updated'));
      queryClient.invalidateQueries({
        queryKey: ['users']
      });
      navigate('/admin/users');
    },
    onError: r => onFormQueryError(r, form)
  });
}
function updateUser(userId, payload) {
  if (payload.roles) {
    payload.roles = payload.roles.map(r => r.id);
  }
  return apiClient.put(`users/${userId}`, payload).then(r => r.data);
}