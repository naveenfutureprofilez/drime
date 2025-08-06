import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
function fetchMaxServerUploadSize() {
  return apiClient.get('uploads/server-max-file-size').then(response => response.data);
}
export function useMaxServerUploadSize() {
  return useQuery({
    queryKey: ['MaxServerUploadSize'],
    queryFn: () => fetchMaxServerUploadSize()
  });
}