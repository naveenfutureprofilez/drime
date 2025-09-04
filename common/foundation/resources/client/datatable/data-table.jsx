import React, { cloneElement, useRef, useState } from 'react';
import { useTrans } from '@ui/i18n/use-trans';
import { useBackendFilterUrlParams } from './filters/backend-filter-url-params';
import { useDatatableData } from './requests/paginated-resources';
import { DataTableContext } from './page/data-table-context';
import { AnimatePresence, m } from 'framer-motion';
import { ProgressBar } from '@ui/progress/progress-bar';
import { Table } from '../ui/tables/table';
import { DataTablePaginationFooter } from './data-table-pagination-footer';
import { DataTableHeader } from './data-table-header';
import { FilterList } from './filters/filter-list/filter-list';
import { SelectedStateDatatableHeader } from '@common/datatable/selected-state-datatable-header';
import clsx from 'clsx';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { BackendFiltersUrlKey } from '@common/datatable/filters/backend-filters-url-key';
import { opacityAnimation } from '@ui/animation/opacity-animation';
import { FilterListSkeleton } from '@common/datatable/filters/filter-list/filter-list-skeleton';
import { nanoid } from 'nanoid';
export function DataTable({
  filters,
  pinnedFilters,
  filtersLoading,
  columns,
  searchPlaceholder,
  queryParams,
  endpoint,
  baseQueryKey: baseQueryKeyProp,
  actions,
  selectedActions,
  emptyStateMessage,
  tableDomProps,
  onRowAction,
  enableSelection = true,
  selectionStyle = 'checkbox',
  children,
  cellHeight,
  collapseTableOnMobile = true,
  skeletonsWhileLoading,
  border
}) {
  const baseQueryKey = useRef(baseQueryKeyProp);
  const isMobile = useIsMobileMediaQuery();
  const {
    trans
  } = useTrans();
  const {
    encodedFilters
  } = useBackendFilterUrlParams(filters);
  const [params, setParams] = useState({
    perPage: 15
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const query = useDatatableData(endpoint, {
    ...params,
    ...queryParams,
    [BackendFiltersUrlKey]: encodedFilters
  }, {
    baseQueryKey: baseQueryKey.current
  }, () => setSelectedRows([]));
  const isFiltering = !!(params.query || params.filters || encodedFilters);
  const pagination = query.data?.pagination;
  const data = pagination?.data || (query.isLoading && skeletonsWhileLoading ? Array.from({
    length: skeletonsWhileLoading
  }).map(() => {
    return {
      id: nanoid(),
      isPlaceholder: true
    };
  }) : []);
  console.log("data" ,data)
  return <DataTableContext.Provider value={{
    selectedRows,
    setSelectedRows,
    endpoint,
    params,
    setParams,
    query,
    baseQueryKey: baseQueryKey.current
  }}>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {selectedRows.length ? <SelectedStateDatatableHeader selectedItemsCount={selectedRows.length} actions={selectedActions} key="selected" /> : <DataTableHeader searchPlaceholder={searchPlaceholder} searchValue={params.query} onSearchChange={query => setParams({
        ...params,
        query
      })} actions={actions} filters={filters} filtersLoading={filtersLoading} key="default" />}
      </AnimatePresence>

      {filters && <div className="mb-14">
          <AnimatePresence initial={false} mode="wait">
            {filtersLoading && (encodedFilters || pinnedFilters?.length) ? <FilterListSkeleton /> : <m.div key="filter-list" {...opacityAnimation}>
                <FilterList filters={filters} pinnedFilters={pinnedFilters} />
              </m.div>}
          </AnimatePresence>
        </div>}

      <div className={clsx('relative rounded-panel', border ? border : (!isMobile || !collapseTableOnMobile) && 'border')}>
        {query.isFetching && !skeletonsWhileLoading && <ProgressBar isIndeterminate className="absolute left-0 top-0 z-10 w-full" aria-label={trans({
        message: 'Loading'
      })} size="xs" />}

        <div className="relative overflow-x-auto md:overflow-hidden">
          <Table {...tableDomProps} columns={columns} data={data} sortDescriptor={params} onSortChange={descriptor => {
          setParams({
            ...params,
            ...descriptor
          });
        }} selectedRows={selectedRows} enableSelection={enableSelection} selectionStyle={selectionStyle} onSelectionChange={setSelectedRows} onAction={onRowAction} collapseOnMobile={collapseTableOnMobile} cellHeight={cellHeight} />
        </div>

        {(query.isFetched || query.isPlaceholderData) && !pagination?.data.length ? <div className="pt-50">
            {cloneElement(emptyStateMessage, {
          isFiltering
        })}
          </div> : undefined}

        <DataTablePaginationFooter query={query} onPageChange={page => setParams({
        ...params,
        page
      })} onPerPageChange={perPage => setParams({
        ...params,
        perPage
      })} />
      </div>
    </DataTableContext.Provider>;
}