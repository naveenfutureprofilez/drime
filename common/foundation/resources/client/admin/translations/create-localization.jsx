import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { apiClient } from '../../http/query-client';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '../../datatable/requests/paginated-resources';
import { onFormQueryError } from '../../errors/on-form-query-error';
function createLocalization(payload) {
  return apiClient.post(`localizations`, payload).then(r => r.data);
}
export function useCreateLocalization(form) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: props => createLocalization(props),
    onSuccess: () => {
      toast(message('Localization created'));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('localizations')
      });
    },
    onError: r => onFormQueryError(r, form)
  });
}