import React from 'react';
import { useTrans } from '@ui/i18n/use-trans';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { SearchIcon } from '@ui/icons/material/Search';
import { AddFilterButton } from '@common/datatable/filters/add-filter-button';
import { message } from '@ui/i18n/message';

export function TransferFilesTableHeader({
  actions,
  filters,
  filtersLoading,
  searchPlaceholder = message('Search by filename, sender, or recipient...'),
  searchValue = '',
  onSearchChange
}) {
  const { trans } = useTrans();

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <TextField 
            size="sm" 
            className="w-full !shadow-none" 
            placeholder={trans(searchPlaceholder)} 
            startAdornment={<SearchIcon size="sm" />} 
            value={searchValue} 
            onChange={e => {
              onSearchChange(e.target.value);
            }} 
          />
        </div>
        <div className="flex items-center gap-3">
          {/* {filters && 
          <AddFilterButton className={'!px-3'} filters={filters} disabled={filtersLoading} />} */}
          {actions}
        </div>
      </div>
    </>
  );
}