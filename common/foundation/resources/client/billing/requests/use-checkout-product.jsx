import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { useParams } from 'react-router';
const endpoint = productId => `billing/products/${productId}`;
export function useCheckoutProduct() {
  const {
    productId,
    priceId
  } = useParams();
  const query = useQuery({
    queryKey: [endpoint(productId)],
    queryFn: () => fetchProduct(productId),
    placeholderData: keepPreviousData,
    enabled: productId != null && priceId != null
  });
  const product = query.data?.product;
  const price = product?.prices.find(p => p.id === parseInt(priceId)) || product?.prices[0];
  return {
    status: query.status,
    product,
    price
  };
}
function fetchProduct(productId) {
  return apiClient.get(endpoint(productId)).then(response => response.data);
}