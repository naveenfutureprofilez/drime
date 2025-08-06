import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../http/query-client';
export const DatatableDataQueryKey = (endpoint, params, baseQueryKey) => {
  // split endpoint by slash, so we can clear cache from the root later,
  // for example, 'link-group' will clear 'link-group/1/links' endpoint
  const key = baseQueryKey ? [...baseQueryKey] : endpoint.split('/');
  if (params) {
    key.push(params);
  }
  return key;
};
export function useDatatableData(endpoint, params, options, onLoad) {
  if (!params.paginate) {
    params.paginate = 'preferLengthAware';
  }
  // having queryKey in option will cause unnecessary re-fetching
  const optionsQueryKey = options?.baseQueryKey;
  delete options?.baseQueryKey;
  return useQuery({
    ...options,
    queryKey: DatatableDataQueryKey(endpoint, params, optionsQueryKey),
    queryFn: ({
      signal
    }) => paginate(endpoint, params, onLoad, signal),
    placeholderData: keepPreviousData
  });
}
async function paginate(endpoint, params, onLoad, signal) {
  if (params.query) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  const response = await apiClient.get(endpoint, {
    params,
    signal: params.query ? signal : undefined
  }).then(response => response.data);
  onLoad?.(response);
  return response;
}