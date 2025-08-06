import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { slugifyString } from '@ui/utils/string/slugify-string';
export function useUpdateTag(form) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => updateTag(props),
    onSuccess: () => {
      toast(trans(message('Tag updated')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('tags')
      });
    },
    onError: err => onFormQueryError(err, form)
  });
}
function updateTag({
  id,
  ...payload
}) {
  if (payload.name) {
    payload.name = slugifyString(payload.name);
  }
  return apiClient.put(`tags/${id}`, payload).then(r => r.data);
}