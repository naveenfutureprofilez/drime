import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
const endpoint = 'billing/products';
export function useProducts(loader) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => fetchProducts(),
    initialData: () => {
      if (loader) {
        // @ts-ignore
        return getBootstrapData().loaders?.[loader];
      }
    }
  });
}
function fetchProducts() {
  return apiClient.get(endpoint).then(response => {
    return {
      products: response.data.pagination.data
    };
  });
}