import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function useReorderChannelContent() {
  return useMutation({
    mutationFn: payload => reorderContent(payload),
    onError: err => showHttpErrorToast(err)
  });
}
function reorderContent({
  channelId,
  ids,
  modelType
}) {
  return apiClient.post(`channel/${channelId}/reorder-content`, {
    modelType,
    ids
  }).then(r => r.data);
}