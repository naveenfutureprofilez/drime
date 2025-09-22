import React from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { DataTableContext } from '@common/datatable/page/data-table-context';
import { ProgressBar } from '@ui/progress/progress-bar';
import { FilterList } from '@common/datatable/filters/filter-list/filter-list';
import { FilterListSkeleton } from '@common/datatable/filters/filter-list/filter-list-skeleton';
import { opacityAnimation } from '@ui/animation/opacity-animation';
import { useTrans } from '@ui/i18n/use-trans';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import clsx from 'clsx';

import { TransferFilesTableHeader } from './transfer-files-table-header';
import { TransferFilesSelectedHeader } from './transfer-files-selected-header';
import { TransferFilesTable } from './transfer-files-table';
import { TransferFilesPagination } from './transfer-files-pagination';
import { TransferFilesEmptyState } from './transfer-files-empty-state';

export function TransferFilesCustomTable({
  filters,
  pinnedFilters,
  filtersLoading,
  columns,
  searchPlaceholder,
  actions,
  selectedActions,
  emptyStateMessage,
  contextValue,
  query,
  data,
  pagination,
  isFiltering,
  params,
  setParams,
  selectedRows,
  setSelectedRows,
  encodedFilters,
  enableSelection = true,
  collapseTableOnMobile = true,
  border
}) {
  const { trans } = useTrans();
  const isMobile = useIsMobileMediaQuery();

  const handleSearchChange = (searchQuery) => {
    setParams({
      ...params,
      query: searchQuery
    });
  };

  const handleSortChange = (descriptor) => {
    setParams({
      ...params,
      ...descriptor
    });
  };

  const handlePageChange = (page) => {
    setParams({
      ...params,
      page
    });
  };

  const handlePerPageChange = (perPage) => {
    setParams({
      ...params,
      perPage
    });
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <AnimatePresence initial={false} mode="wait">
        {selectedRows.length ? (
          <TransferFilesSelectedHeader
            key="selected"
            selectedItemsCount={selectedRows.length}
            actions={selectedActions}
          />
        ) : (
          <TransferFilesTableHeader
            key="default"
            searchPlaceholder={searchPlaceholder}
            searchValue={params.query}
            onSearchChange={handleSearchChange}
            actions={actions}
            filters={filters}
            filtersLoading={filtersLoading}
          />
        )}
      </AnimatePresence>

      {filters && (
        <div className="mb-6">
          <AnimatePresence initial={false} mode="wait">
            {filtersLoading && (encodedFilters || pinnedFilters?.length) ? (
              <FilterListSkeleton />
            ) : (
              <m.div key="filter-list" {...opacityAnimation}>
                <FilterList filters={filters} pinnedFilters={pinnedFilters} />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="relative">
        {query.isFetching && (
          <ProgressBar 
            isIndeterminate 
            className="absolute left-0 top-0 z-10 w-full" 
            aria-label={trans({ message: 'Loading' })} 
            size="xs" 
          />
        )}

        <TransferFilesTable
          columns={columns}
          data={data}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          sortDescriptor={params}
          onSortChange={handleSortChange}
          enableSelection={enableSelection}
        />

        {(query.isFetched || query.isPlaceholderData) && !pagination?.data.length ? (
          <TransferFilesEmptyState
            emptyStateMessage={emptyStateMessage}
            isFiltering={isFiltering}
          />
        ) : null}

        <TransferFilesPagination
          query={query}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </div>
    </DataTableContext.Provider>
  );
}