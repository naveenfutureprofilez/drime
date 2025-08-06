import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { channelQueryKey } from '@common/channels/requests/use-channel';
export function useAddToChannel() {
  return useMutation({
    mutationFn: payload => addToChannel(payload),
    onSuccess: async (_, payload) => {
      await queryClient.invalidateQueries({
        queryKey: channelQueryKey(payload.channelId)
      });
    },
    onError: r => showHttpErrorToast(r)
  });
}
function addToChannel({
  channelId,
  item
}) {
  return apiClient.post(`channel/${channelId}/add`, {
    itemId: item.id,
    itemType: item.model_type
  }).then(r => r.data);
}