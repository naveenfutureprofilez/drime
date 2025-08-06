import { FilterControlType, FilterOperator } from './backend-filter';
import { DateRangePresets } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import { message } from '@ui/i18n/message';
import { dateRangeToAbsoluteRange } from '@ui/forms/input-field/date/date-range-picker/form-date-range-picker';
export function timestampFilter(options) {
  return {
    ...options,
    defaultOperator: FilterOperator.between,
    control: {
      type: FilterControlType.DateRangePicker,
      defaultValue: options.control?.defaultValue || dateRangeToAbsoluteRange(DateRangePresets[3].getRangeValue())
    }
  };
}
export function createdAtFilter(options) {
  return timestampFilter({
    key: 'created_at',
    label: message('Date created'),
    ...options
  });
}
export function updatedAtFilter(options) {
  return timestampFilter({
    key: 'updated_at',
    label: message('Last updated'),
    ...options
  });
}