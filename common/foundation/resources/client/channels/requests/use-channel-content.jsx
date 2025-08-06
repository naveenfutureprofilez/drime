import { hashKey, keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { channelEndpoint, channelQueryKey } from '@common/channels/requests/use-channel';
import { useRef } from 'react';
import { useChannelQueryParams } from '@common/channels/use-channel-query-params';
import { useSearchParams } from 'react-router';
export function useChannelContent(channel, params, options) {
  const [searchParams] = useSearchParams();
  const queryParams = useChannelQueryParams(channel, params);
  if (!options?.isNested) {
    queryParams.page = searchParams.get('page') || '1';
  } else {
    queryParams.perPage = 15;
  }
  const queryKey = channelQueryKey(channel.id, queryParams);
  const initialQueryKey = useRef(hashKey(queryKey)).current;
  const query = useQuery({
    queryKey: channelQueryKey(channel.id, queryParams),
    queryFn: () => fetchChannelContent(channel, queryParams),
    placeholderData: keepPreviousData,
    initialData: () => {
      if (hashKey(queryKey) === initialQueryKey) {
        return channel.content;
      }
      return undefined;
    },
    staleTime: options?.isNested ? Infinity : undefined
  });
  return {
    ...query,
    queryKey
  };
}
function fetchChannelContent(channel, params) {
  return apiClient.get(channelEndpoint(channel.id), {
    params: {
      ...params,
      paginate: channel.config.paginationType === 'lengthAware' ? 'lengthAware' : 'simple',
      returnContentOnly: 'true'
    }
  }).then(response => response.data.pagination);
}