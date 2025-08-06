import { useState } from 'react';
import { getDefaultGranularity } from './utils';
import { useUserTimezone } from '@ui/i18n/use-user-timezone';
import { toSafeZoned } from '@ui/i18n/to-safe-zoned';
export function useBaseDatePickerState(selectedDate, props) {
  const timezone = useUserTimezone();
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);
  const closeDialogOnSelection = props.closeDialogOnSelection ?? true;
  const granularity = props.granularity || getDefaultGranularity(selectedDate);
  const min = props.min ? toSafeZoned(props.min, timezone) : undefined;
  const max = props.max ? toSafeZoned(props.max, timezone) : undefined;
  return {
    timezone,
    granularity,
    min,
    max,
    calendarIsOpen,
    setCalendarIsOpen,
    closeDialogOnSelection
  };
}