import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
const Endpoint = 'roles';
export function useCreateRole(form) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => createRole(payload),
    onSuccess: () => {
      toast(trans(message('Created new role')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('roles')
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}
function createRole({
  id,
  ...payload
}) {
  return apiClient.post(Endpoint, payload).then(r => r.data);
}