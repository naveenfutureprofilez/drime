import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { useTrans } from '@ui/i18n/use-trans';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
import { message } from '@ui/i18n/message';
import { toast } from '@ui/toast/toast';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { removeProtocol } from '@ui/utils/urls/remove-protocol';
export function useDeleteDomain() {
  const {
    trans
  } = useTrans();
  return useMutation({
    mutationFn: props => deleteDomain(props),
    onSuccess: (response, props) => {
      toast.positive(trans(message('“:domain” removed', {
        values: {
          domain: removeProtocol(props.domain.host)
        }
      })));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('custom-domain')
      });
    },
    onError: err => showHttpErrorToast(err)
  });
}
function deleteDomain({
  domain
}) {
  return apiClient.delete(`custom-domain/${domain.id}`).then(r => r.data);
}