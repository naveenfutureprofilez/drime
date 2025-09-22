import React from 'react';
import { DataTablePaginationFooter } from '@common/datatable/data-table-pagination-footer';

export function TransferFilesPagination({ query, onPerPageChange, onPageChange, className }) {
  return (
    <DataTablePaginationFooter
      query={query}
      onPerPageChange={onPerPageChange}
      onPageChange={onPageChange}
      className={className}
    />
  );
}