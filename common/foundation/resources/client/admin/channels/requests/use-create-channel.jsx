import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { useTrans } from '@ui/i18n/use-trans';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { message } from '@ui/i18n/message';
import { useNavigate } from '@common/ui/navigation/use-navigate';
const endpoint = 'channel';
export function useCreateChannel(form) {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payload => createChannel(payload),
    onSuccess: async response => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint)
      });
      toast(trans(message('Channel created')));
      navigate(`/admin/channels/${response.channel.id}/edit`, {
        replace: true
      });
    },
    onError: err => onFormQueryError(err, form)
  });
}
function createChannel(payload) {
  return apiClient.post(endpoint, payload).then(r => r.data);
}