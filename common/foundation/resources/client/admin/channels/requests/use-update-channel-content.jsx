import { useMutation } from '@tanstack/react-query';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient, queryClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { channelQueryKey } from '@common/channels/requests/use-channel';
export function useUpdateChannelContent(channelId) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: payload => updateChannel(channelId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: channelQueryKey(channelId)
      });
      toast(trans(message('Channel content updated')));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function updateChannel(channelId, payload) {
  return apiClient.post(`channel/${channelId}/update-content`, {
    ...payload,
    normalizeContent: true
  }).then(r => r.data);
}