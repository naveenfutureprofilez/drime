import { useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
import { DatatableDataQueryKey } from '@common/datatable/requests/paginated-resources';
import { useNavigate } from '@common/ui/navigation/use-navigate';
import { onFormQueryError } from '@common/errors/on-form-query-error';
const Endpoint = id => `billing/products/${id}`;
export function useUpdateProduct(form) {
  const {
    trans
  } = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: payload => updateProduct(payload),
    onSuccess: response => {
      toast(trans(message('Plan updated')));
      queryClient.invalidateQueries({
        queryKey: [Endpoint(response.product.id)]
      });
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('billing/products')
      });
      navigate('/admin/plans');
    },
    onError: err => onFormQueryError(err, form)
  });
}
function updateProduct({
  id,
  ...payload
}) {
  const backendPayload = {
    ...payload,
    feature_list: payload.feature_list.map(feature => feature.value)
  };
  return apiClient.put(Endpoint(id), backendPayload).then(r => r.data);
}