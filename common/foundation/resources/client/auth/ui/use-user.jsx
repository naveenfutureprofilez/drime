import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
const queryKey = (id, params) => {
  const key = ['users', `${id}`];
  if (params) {
    key.push(params);
  }
  return key;
};
export function useUser(id, params) {
  return useQuery({
    queryKey: queryKey(id, params),
    queryFn: () => fetchUser(id, params)
  });
}
function fetchUser(id, params) {
  return apiClient.get(`users/${id}`, {
    params
  }).then(response => response.data);
}