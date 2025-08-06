import { FormDateRangePicker } from '@ui/forms/input-field/date/date-range-picker/form-date-range-picker';
export function DateRangeFilterPanel({
  filter
}) {
  return <FormDateRangePicker min={filter.control.min} max={filter.control.max} size="sm" name={`${filter.key}.value`} granularity="day" closeDialogOnSelection={true} />;
}