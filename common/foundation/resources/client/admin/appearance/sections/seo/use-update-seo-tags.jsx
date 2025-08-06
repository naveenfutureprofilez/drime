import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
export function useUpdateSeoTags(name) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payload => updateTags(name, payload.tags),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'seo-tags', name]
      });
      toast(message('Updated SEO tags'));
    },
    onError: err => showHttpErrorToast(err)
  });
}
function updateTags(name, tags) {
  return apiClient.put(`admin/appearance/seo-tags/${name}`, {
    tags
  }).then(r => r.data);
}