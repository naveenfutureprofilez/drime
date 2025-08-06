import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { invalidateTaggableTagsQuery } from '@common/tags/use-taggable-tags';
export function useDetachTagFromTaggables() {
  return useMutation({
    mutationFn: payload => detachTag(payload),
    onSuccess: (_, payload) => {
      invalidateTaggableTagsQuery(payload);
    },
    onError: err => showHttpErrorToast(err)
  });
}
function detachTag(payload) {
  return apiClient.post(`taggable/detach-tag`, payload).then(r => r.data);
}