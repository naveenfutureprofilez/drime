import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useParams } from 'react-router';
const Endpoint = id => `billing/products/${id}`;
export function useProduct() {
  const {
    productId
  } = useParams();
  return useQuery({
    queryKey: [Endpoint(productId)],
    queryFn: () => fetchProduct(productId)
  });
}
function fetchProduct(productId) {
  return apiClient.get(Endpoint(productId)).then(response => response.data);
}