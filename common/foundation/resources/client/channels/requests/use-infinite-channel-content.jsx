import { useInfiniteData } from '@common/ui/infinite-scroll/use-infinite-data';
import { channelEndpoint, channelQueryKey } from '@common/channels/requests/use-channel';
import { useChannelQueryParams } from '@common/channels/use-channel-query-params';
export function useInfiniteChannelContent(channel) {
  const queryParams = useChannelQueryParams(channel);
  return useInfiniteData({
    willSortOrFilter: true,
    initialPage: channel.content,
    queryKey: channelQueryKey(channel.id),
    endpoint: channelEndpoint(channel.id),
    queryParams: {
      returnContentOnly: 'true',
      ...queryParams
    }
  });
}