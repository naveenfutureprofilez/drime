import { useFormContext } from 'react-hook-form';
import { useTrans } from '@ui/i18n/use-trans';
import React, { useState } from 'react';
import { useAddableContent } from '@common/admin/channels/requests/use-addable-content';
import { ComboBox } from '@ui/forms/combobox/combobox';
import { message } from '@ui/i18n/message';
import { SearchIcon } from '@ui/icons/material/Search';
import { Item } from '@ui/forms/listbox/item';
export function ChannelContentSearchField({
  onResultSelected,
  imgRenderer
}) {
  const {
    watch
  } = useFormContext();
  const contentModel = watch('config.contentModel');
  const {
    trans
  } = useTrans();
  const [query, setQuery] = useState('');
  const {
    isFetching,
    data
  } = useAddableContent({
    query,
    modelType: contentModel,
    limit: 20
  });
  return <ComboBox isAsync placeholder={trans(message('Search for content to add...'))} isLoading={isFetching} inputValue={query} onInputValueChange={setQuery} clearInputOnItemSelection blurReferenceOnItemSelection selectionMode="none" openMenuOnFocus floatingMaxHeight={670} startAdornment={<SearchIcon />} hideEndAdornment>
      {data?.results.map(result => <Item key={result.id} value={result.id} onSelected={() => onResultSelected?.(result)} startIcon={imgRenderer ? imgRenderer(result) : null} description={result.description} textLabel={result.name}>
          {result.name}
        </Item>)}
    </ComboBox>;
}