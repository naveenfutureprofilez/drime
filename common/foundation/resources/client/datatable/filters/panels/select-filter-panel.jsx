import { FormSelect } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { Trans } from '@ui/i18n/trans';
import { useTrans } from '@ui/i18n/use-trans';
export function SelectFilterPanel({
  filter
}) {
  const {
    trans
  } = useTrans();
  return <FormSelect size="sm" name={`${filter.key}.value`} selectionMode="single" showSearchField={filter.control.showSearchField} placeholder={filter.control.placeholder ? trans(filter.control.placeholder) : undefined} searchPlaceholder={filter.control.searchPlaceholder ? trans(filter.control.searchPlaceholder) : undefined}>
      {filter.control.options.map(option => <Item key={option.key} value={option.key}>
          {typeof option.label === 'string' ? option.label : <Trans {...option.label} />}
        </Item>)}
    </FormSelect>;
}