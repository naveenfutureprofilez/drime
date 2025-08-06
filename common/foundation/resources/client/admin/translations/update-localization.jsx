import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient, queryClient } from '../../http/query-client';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '../../datatable/requests/paginated-resources';
import { onFormQueryError } from '../../errors/on-form-query-error';
import { showHttpErrorToast } from '../../http/show-http-error-toast';
import { getLocalWithLinesQueryKey } from './use-locale-with-lines';
function UpdateLocalization({
  id,
  ...other
}) {
  return apiClient.put(`localizations/${id}`, other).then(r => r.data);
}
export function useUpdateLocalization(form) {
  return useMutation({
    mutationFn: props => UpdateLocalization(props),
    onSuccess: () => {
      toast(message('Localization updated'));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('localizations')
      });
      queryClient.invalidateQueries({
        queryKey: getLocalWithLinesQueryKey()
      });
    },
    onError: r => form ? onFormQueryError(r, form) : showHttpErrorToast(r)
  });
}