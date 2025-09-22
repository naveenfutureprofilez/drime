import React, { useState, useRef } from 'react';
import { useBackendFilterUrlParams } from '@common/datatable/filters/backend-filter-url-params';
import { useDatatableData } from '@common/datatable/requests/paginated-resources';
import { BackendFiltersUrlKey } from '@common/datatable/filters/backend-filters-url-key';
import { nanoid } from 'nanoid';

export function useTransferFilesTable(filters = [], queryParams = {}, baseQueryKey = null) {
  const endpoint = 'admin/transfer-files';
  const baseQueryKeyRef = useRef(baseQueryKey);
  
  const { encodedFilters } = useBackendFilterUrlParams(filters);
  
  const [params, setParams] = useState({
    perPage: 15
  });
  
  const [selectedRows, setSelectedRows] = useState([]);
  
  const query = useDatatableData(
    endpoint,
    {
      ...params,
      ...queryParams,
      [BackendFiltersUrlKey]: encodedFilters
    },
    {
      baseQueryKey: baseQueryKeyRef.current
    },
    () => setSelectedRows([])
  );
  
  const isFiltering = !!(params.query || params.filters || encodedFilters);
  const pagination = query.data?.pagination;
  const data = pagination?.data || [];
  
  // Context value matching DataTableContext
  const contextValue = {
    selectedRows,
    setSelectedRows,
    endpoint,
    params,
    setParams,
    query,
    baseQueryKey: baseQueryKeyRef.current
  };
  
  return {
    contextValue,
    query,
    data,
    pagination,
    isFiltering,
    params,
    setParams,
    selectedRows,
    setSelectedRows,
    encodedFilters
  };
}