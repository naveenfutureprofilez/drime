import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { useNavigate } from '@common/ui/navigation/use-navigate';
export function useCreateUser(form) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: props => createUser(props),
    onSuccess: () => {
      toast(message('User created'));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('users')
      });
      navigate('/admin/users');
    },
    onError: r => onFormQueryError(r, form)
  });
}
function createUser(payload) {
  if (payload.roles) {
    payload.roles = payload.roles.map(r => r.id);
  }
  return apiClient.post('users', payload).then(r => r.data);
}