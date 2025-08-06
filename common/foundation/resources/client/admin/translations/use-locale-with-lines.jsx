import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
export const getLocalWithLinesQueryKey = localeId => {
  const key = ['getLocaleWithLines'];
  if (localeId != null) {
    key.push(localeId);
  }
  return key;
};
export function useLocaleWithLines(localeId) {
  return useQuery({
    queryKey: getLocalWithLinesQueryKey(localeId),
    queryFn: () => fetchLocaleWithLines(localeId),
    staleTime: Infinity
  });
}
function fetchLocaleWithLines(localeId) {
  return apiClient.get(`localizations/${localeId}`).then(response => response.data);
}