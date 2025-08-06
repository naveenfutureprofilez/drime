import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient, queryClient } from './query-client';
export function useValueLists(names, params, options = {}) {
  return useQuery({
    queryKey: ['value-lists', names, params],
    queryFn: () => fetchValueLists(names, params),
    // if there are params, make sure we update lists when they change
    staleTime: !params ? Infinity : undefined,
    placeholderData: keepPreviousData,
    enabled: !options.disabled,
    initialData: () => {
      // check if we have already fetched value lists for all specified names previously,
      // if so, return cached response for this query, as there's no need to fetch it again
      const previousData = queryClient.getQueriesData({
        queryKey: ['ValueLists']
      }).find(([, response]) => {
        if (response && names.every(n => response[n])) {
          return response;
        }
        return null;
      });
      if (previousData) {
        return previousData[1];
      }
    }
  });
}
export function prefetchValueLists(names, params) {
  return queryClient.ensureQueryData({
    queryKey: ['value-lists', names, params],
    queryFn: () => fetchValueLists(names, params)
  });
}
function fetchValueLists(names, params) {
  return apiClient.get(`value-lists/${names}`, {
    params
  }).then(response => response.data);
}