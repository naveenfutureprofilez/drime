import { hashKey, keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { hasNextPage } from '@common/http/backend-response/pagination-response';
import { useMemo, useRef, useState } from 'react';
function buildQueryKey({
  queryKey,
  preserveQueryKey,
  defaultOrderDir,
  defaultOrderBy,
  queryParams
}, sortDescriptor, searchQuery = '') {
  if (preserveQueryKey) {
    return queryKey;
  }

  // make sure to always set default order dir and col so query keys are consistent
  if (!sortDescriptor.orderBy) {
    sortDescriptor.orderBy = defaultOrderBy;
  }
  if (!sortDescriptor.orderDir) {
    sortDescriptor.orderDir = defaultOrderDir;
  }
  return [...queryKey, sortDescriptor, searchQuery, queryParams];
}
export function useInfiniteData(props) {
  const {
    initialPage,
    endpoint,
    defaultOrderBy,
    defaultOrderDir,
    queryParams,
    paginate,
    transformResponse,
    willSortOrFilter = false,
    reverse = false,
    disabled = false,
    prefetchOnly = false
  } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState({
    orderBy: defaultOrderBy,
    orderDir: defaultOrderDir
  });
  const queryKey = buildQueryKey(props, sortDescriptor, searchQuery);
  const initialQueryKey = useRef(hashKey(queryKey)).current;
  const query = useInfiniteQuery({
    enabled: !disabled,
    notifyOnChangeProps: prefetchOnly ? [] : undefined,
    placeholderData: willSortOrFilter ? keepPreviousData : undefined,
    queryKey,
    queryFn: ({
      pageParam,
      signal
    }) => {
      const params = {
        ...queryParams,
        perPage: initialPage?.per_page || queryParams?.perPage,
        query: queryParams?.query ?? searchQuery,
        paginate,
        ...sortDescriptor
      };
      if (paginate === 'cursor') {
        params.cursor = pageParam;
      } else {
        params.page = pageParam || 1;
      }
      return fetchData(endpoint, params, transformResponse, signal);
    },
    initialPageParam: paginate === 'cursor' ? '' : 1,
    getNextPageParam: lastResponse => {
      if (!hasNextPage(lastResponse.pagination)) {
        return null;
      }
      if ('next_cursor' in lastResponse.pagination) {
        return lastResponse.pagination.next_cursor;
      }
      return lastResponse.pagination.current_page + 1;
    },
    initialData: () => {
      // initial data will be for initial query key only, remove
      // initial data if query key changes, so query is reset
      if (!initialPage || hashKey(queryKey) !== initialQueryKey) {
        return undefined;
      }
      return {
        pageParams: [undefined, 1],
        pages: [{
          pagination: initialPage
        }]
      };
    },
    select: reverse ? data => {
      return {
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse()
      };
    } : undefined
  });
  const items = useMemo(() => {
    return query.data?.pages.flatMap(p => p.pagination.data) || [];
  }, [query.data?.pages]);
  const firstPage = query.data?.pages[0].pagination;
  const totalItems = firstPage && 'total' in firstPage && firstPage.total ? firstPage.total : null;
  return {
    ...query,
    items,
    totalItems,
    noResults: query.data?.pages?.[0].pagination.data.length === 0,
    // can't use "isRefetching", it's true for some reason when changing sorting or filters
    isReloading: query.isFetching && !query.isFetchingNextPage && query.isPlaceholderData,
    sortDescriptor,
    setSortDescriptor,
    searchQuery,
    setSearchQuery
  };
}
async function fetchData(endpoint, params, transformResponse, signal) {
  if (params.query) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return apiClient.get(endpoint, {
    params,
    signal: params.query ? signal : undefined
  }).then(r => {
    if (transformResponse) {
      return transformResponse(r.data);
    }
    return r.data;
  });
}