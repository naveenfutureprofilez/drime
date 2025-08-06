import { FormSelect, OptionGroup } from '@ui/forms/select/select';
import { message } from '@ui/i18n/message';
import { Option } from '@ui/forms/combobox/combobox';
import { useTrans } from '@ui/i18n/use-trans';
export function TimezoneSelect({
  name,
  size,
  timezones,
  label,
  ...selectProps
}) {
  const {
    trans
  } = useTrans();
  return <FormSelect selectionMode="single" name={name} size={size} label={label} showSearchField searchPlaceholder={trans(message('Search timezones'))} {...selectProps}>
      {Object.entries(timezones).map(([sectionName, sectionItems]) => <OptionGroup label={sectionName} key={sectionName}>
          {sectionItems.map(timezone => <Option key={timezone.value} value={timezone.value}>
              {timezone.text}
            </Option>)}
        </OptionGroup>)}
    </FormSelect>;
}