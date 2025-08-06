import { useTrans } from '@ui/i18n/use-trans';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
import { SearchIcon } from '@ui/icons/material/Search';
import { message } from '@ui/i18n/message';
import { Select } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { Trans } from '@ui/i18n/trans';
import React from 'react';
export function FontSelectorFilters({
  state: {
    filters,
    setFilters
  }
}) {
  const {
    trans
  } = useTrans();
  return <div className="mb-24 items-center gap-24 @xs:flex">
      <TextField className="mb-12 flex-auto @xs:mb-0" value={filters.query} onChange={e => {
      setFilters({
        ...filters,
        query: e.target.value
      });
    }} startAdornment={<SearchIcon />} placeholder={trans(message('Search fonts'))} />
      <Select className="flex-auto" selectionMode="single" selectedValue={filters.category} onSelectionChange={value => {
      setFilters({
        ...filters,
        category: value
      });
    }}>
        <Item value="">
          <Trans message="All categories" />
        </Item>
        <Item value="serif">
          <Trans message="Serif" />
        </Item>
        <Item value="sans-serif">
          <Trans message="Sans serif" />
        </Item>
        <Item value="display">
          <Trans message="Display" />
        </Item>
        <Item value="handwriting">
          <Trans message="Handwriting" />
        </Item>
        <Item value="monospace">
          <Trans message="Monospace" />
        </Item>
      </Select>
    </div>;
}