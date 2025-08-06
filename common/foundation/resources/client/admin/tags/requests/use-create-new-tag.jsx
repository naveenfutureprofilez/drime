import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
import { slugifyString } from '@ui/utils/string/slugify-string';
export function useCreateNewTag(form) {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => createNewTag(props),
    onSuccess: () => {
      toast(trans(message('Tag created')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('tags')
      });
    },
    onError: err => onFormQueryError(err, form)
  });
}
function createNewTag(payload) {
  payload.name = slugifyString(payload.name);
  return apiClient.post('tags', payload).then(r => r.data);
}