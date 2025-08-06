import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { invalidateTaggableTagsQuery } from '@common/tags/use-taggable-tags';
export function useSyncTaggableTags() {
  return useMutation({
    mutationFn: payload => attachTag(payload),
    onSuccess: async (_, payload) => {
      invalidateTaggableTagsQuery(payload);
    },
    onError: err => showHttpErrorToast(err)
  });
}
function attachTag(payload) {
  return apiClient.post(`taggable/sync-tags`, payload).then(r => r.data);
}