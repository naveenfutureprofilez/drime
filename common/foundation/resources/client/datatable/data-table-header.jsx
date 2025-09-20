import React from 'react';
import { useTrans } from '@ui/i18n/use-trans';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { SearchIcon } from '@ui/icons/material/Search';
import { AddFilterButton } from './filters/add-filter-button';
import { message } from '@ui/i18n/message';
export function DataTableHeader({
  actions,
  filters,
  filtersLoading,
  searchPlaceholder = message('Type to search...'),
  searchValue = '',
  onSearchChange
}) {
  const {
    trans
  } = useTrans();
  return <HeaderLayout>
      <TextField size="sm" className="mr-auto min-w-180 max-w-440 flex-auto" inputWrapperClassName="mr-24 md:mr-0" placeholder={trans(searchPlaceholder)} startAdornment={<SearchIcon size="sm" />} value={searchValue} onChange={e => {
      onSearchChange(e.target.value);
    }} />
      {filters && <AddFilterButton filters={filters} disabled={filtersLoading} />}
      {actions}
    </HeaderLayout>;
}
export function HeaderLayout({
  children,
  ...domProps
}) {
  return <div className="hidden-scrollbar relative mb-4 md:mb-6 flex flex-wrap items-center gap-4 overflow-x-auto text-muted md:gap-12" {...domProps}>
      {children}
    </div>;
}