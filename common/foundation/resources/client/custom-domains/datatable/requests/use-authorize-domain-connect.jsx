import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { onFormQueryError } from '@common/errors/on-form-query-error';
// check if is this host is not connected already and if user has permissions to connect domains
export function useAuthorizeDomainConnect(form) {
  return useMutation({
    mutationFn: props => authorize(props),
    onError: err => onFormQueryError(err, form)
  });
}
function authorize(payload) {
  return apiClient.post('secure/custom-domain/authorize/store', payload).then(r => r.data);
}