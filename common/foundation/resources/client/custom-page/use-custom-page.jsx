import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../http/query-client';
import { useParams } from 'react-router';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
const endpoint = slugOrId => `custom-pages/${slugOrId}`;
export function useCustomPage(pageId) {
  const params = useParams();
  if (!pageId) {
    pageId = params.pageId;
  }
  return useQuery({
    queryKey: [endpoint(pageId)],
    queryFn: () => fetchCustomPage(pageId),
    initialData: () => {
      const data = getBootstrapData().loaders?.customPage;
      if (data?.page && (data.page.id == pageId || data.page.slug == pageId)) {
        return data;
      }
    }
  });
}
function fetchCustomPage(slugOrId) {
  return apiClient.get(endpoint(slugOrId)).then(response => response.data);
}