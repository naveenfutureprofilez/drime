import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useParams } from 'react-router';
const Endpoint = id => `roles/${id}`;
export function useRole() {
  const {
    roleId
  } = useParams();
  return useQuery({
    queryKey: [Endpoint(roleId)],
    queryFn: () => fetchRole(roleId)
  });
}
function fetchRole(roleId) {
  return apiClient.get(Endpoint(roleId)).then(response => response.data);
}