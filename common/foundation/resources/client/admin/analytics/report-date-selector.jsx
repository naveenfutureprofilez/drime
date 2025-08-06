import { useDateRangePickerState } from '@ui/forms/input-field/date/date-range-picker/use-date-range-picker-state';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { Button } from '@ui/buttons/button';
import { DateRangeIcon } from '@ui/icons/material/DateRange';
import { FormattedDateTimeRange } from '@ui/i18n/formatted-date-time-range';
import { DateRangeDialog } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-dialog';
import React from 'react';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { DateFormatPresets } from '@ui/i18n/formatted-date';
import { DateRangeComparePresets } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-compare-presets';
const monthDayFormat = {
  month: 'short',
  day: '2-digit'
};
export function ReportDateSelector({
  value,
  onChange,
  disabled,
  compactOnMobile = true,
  enableCompare = false,
  granularity = 'minute'
}) {
  const isMobile = useIsMobileMediaQuery();
  return <DialogTrigger type="popover" onClose={value => {
    if (value) {
      onChange(value);
    }
  }}>
      <Button variant="outline" color="chip" endIcon={<DateRangeIcon />} disabled={disabled}>
        <FormattedDateTimeRange start={value.start} end={value.end} options={isMobile && compactOnMobile ? monthDayFormat : DateFormatPresets.short} />
      </Button>
      <DateSelectorDialog value={value} enableCompare={enableCompare} granularity={granularity} />
    </DialogTrigger>;
}
function DateSelectorDialog({
  value,
  enableCompare,
  granularity
}) {
  const isMobile = useIsMobileMediaQuery();
  const state = useDateRangePickerState({
    granularity,
    defaultValue: {
      start: value.start,
      end: value.end,
      preset: value.preset
    },
    closeDialogOnSelection: false
  });
  const compareHasInitialValue = !!value.compareStart && !!value.compareEnd;
  const compareState = useDateRangePickerState({
    granularity,
    defaultValue: compareHasInitialValue ? {
      start: value.compareStart,
      end: value.compareEnd,
      preset: value.comparePreset
    } : DateRangeComparePresets[0].getRangeValue(state.selectedValue)
  });
  return <DateRangeDialog state={state} compareState={enableCompare ? compareState : undefined} compareVisibleDefault={compareHasInitialValue} showInlineDatePickerField={!isMobile} />;
}