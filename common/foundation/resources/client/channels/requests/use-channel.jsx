import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { useParams } from 'react-router';
import { useChannelQueryParams } from '@common/channels/use-channel-query-params';
import { isSsr } from '@ui/utils/dom/is-ssr';
import { getBootstrapData } from '@ui/bootstrap-data/bootstrap-data-store';
export function useChannel(slugOrId, loader, userParams) {
  const params = useParams();
  const channelId = slugOrId || params.slugOrId;
  const queryParams = useChannelQueryParams(undefined, userParams);
  return useQuery({
    // only refetch when channel ID or restriction changes and not query params.
    // content will be re-fetched in channel content components
    // on SSR use query params as well, to avoid caching wrong data when query params change
    queryKey: isSsr() ? channelQueryKey(channelId, queryParams) : channelQueryKey(channelId, {
      restriction: queryParams.restriction
    }),
    queryFn: () => fetchChannel(channelId, {
      ...queryParams,
      loader
    }),
    initialData: () => {
      // @ts-ignore
      const data = getBootstrapData().loaders?.[loader];
      const isSameChannel = data?.channel.id == channelId || data?.channel.slug == channelId;
      const isSameRestriction = !queryParams.restriction || data?.channel.restriction?.name === queryParams.restriction;
      if (isSameChannel && isSameRestriction) {
        return data;
      }
    }
  });
}
export function channelQueryKey(slugOrId, params) {
  const key = ['channel', `${slugOrId}`];
  if (params) {
    key.push(params);
  }
  return key;
}
export function channelEndpoint(slugOrId) {
  return `channel/${slugOrId}`;
}
function fetchChannel(slugOrId, params = {}) {
  return apiClient.get(channelEndpoint(slugOrId), {
    params
  }).then(response => response.data);
}