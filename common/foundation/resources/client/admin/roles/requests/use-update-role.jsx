import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { useNavigate } from '@common/ui/navigation/use-navigate';
const Endpoint = id => `roles/${id}`;
export function useUpdateRole() {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: payload => updateRole(payload),
    onSuccess: response => {
      toast(trans(message('Role updated')));
      queryClient.invalidateQueries({
        queryKey: [Endpoint(response.role.id)]
      });
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('roles')
      });
      navigate('/admin/roles');
    },
    onError: err => showHttpErrorToast(err)
  });
}
function updateRole({
  id,
  ...payload
}) {
  return apiClient.put(Endpoint(id), payload).then(r => r.data);
}