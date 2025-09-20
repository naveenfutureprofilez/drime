import React from 'react';
import { DateRangePicker } from '@ui/forms/input-field/date/date-range-picker/date-range-picker';
import { DateRangePresets } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';

export function BaseMetricDateRangePicker({ 
  value, 
  onChange, 
  granularity = 'day',
  closeDialogOnSelection = true,
  ...props 
}) {
  return (
    <DateRangePicker
      value={value}
      onChange={onChange}
      granularity={granularity}
      closeDialogOnSelection={closeDialogOnSelection}
      presets={DateRangePresets}
      {...props}
    />
  );
}