import { useTrans } from '@ui/i18n/use-trans';
import { useNavigate } from '@common/ui/navigation/use-navigate';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@ui/toast/toast';
import { message } from '@ui/i18n/message';
import { apiClient, queryClient } from '@common/http/query-client';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { onFormQueryError } from '@common/errors/on-form-query-error';
const endpoint = 'billing/products';
export function useCreateProduct(form) {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: payload => createProduct(payload),
    onSuccess: () => {
      toast(trans(message('Plan created')));
      queryClient.invalidateQueries({
        queryKey: [endpoint]
      });
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('billing/products')
      });
      navigate('/admin/plans');
    },
    onError: err => onFormQueryError(err, form)
  });
}
function createProduct(payload) {
  const backendPayload = {
    ...payload,
    feature_list: payload.feature_list.map(feature => feature.value)
  };
  return apiClient.post(endpoint, backendPayload).then(r => r.data);
}