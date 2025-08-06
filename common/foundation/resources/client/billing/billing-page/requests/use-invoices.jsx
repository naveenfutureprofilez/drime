import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
const Endpoint = 'billing/invoices';
export function useInvoices(userId) {
  return useQuery({
    queryKey: [Endpoint],
    queryFn: () => fetchInvoices(userId)
  });
}
function fetchInvoices(userId) {
  return apiClient.get(Endpoint, {
    params: {
      userId
    }
  }).then(response => response.data);
}