import { useMutation } from '@tanstack/react-query';
import { useTrans } from '@ui/i18n/use-trans';
import { useNavigate } from '@common/ui/navigation/use-navigate';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient, queryClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
const Endpoint = id => `channel/${id}`;
export function useUpdateChannel(form) {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: payload => updateChannel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('channel')
      });
      toast(trans(message('Channel updated')));
      navigate('/admin/channels');
    },
    onError: err => onFormQueryError(err, form)
  });
}
function updateChannel({
  id,
  content,
  // don't need to send content to the server
  ...payload
}) {
  return apiClient.put(Endpoint(id), payload).then(r => r.data);
}