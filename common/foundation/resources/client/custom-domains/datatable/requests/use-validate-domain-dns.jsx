import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
export function useValidateDomainDns() {
  return useMutation({
    mutationFn: props => authorize(props)
  });
}
function authorize(payload) {
  return apiClient.post('secure/custom-domain/validate/2BrM45vvfS/api', payload).then(r => r.data);
}