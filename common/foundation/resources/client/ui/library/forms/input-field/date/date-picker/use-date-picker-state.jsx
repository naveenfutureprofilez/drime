import { useControlledState } from '@react-stately/utils';
import { useCallback, useState } from 'react';
import { isSameDay, toCalendarDate } from '@internationalized/date';
import { useBaseDatePickerState } from '../use-base-date-picker-state';
import { useCurrentDateTime } from '@ui/i18n/use-current-date-time';
import { toSafeZoned } from '@ui/i18n/to-safe-zoned';
export function useDatePickerState(props) {
  const now = useCurrentDateTime();
  const [isPlaceholder, setIsPlaceholder] = useState(!props.value && !props.defaultValue);

  // if user clears the date, we will want to still keep an
  // instance internally, but return null via "onChange" callback
  const setStateValue = props.onChange;
  const [internalValue, setInternalValue] = useControlledState(props.value || now, props.defaultValue || now, value => {
    setIsPlaceholder(false);
    setStateValue?.(value);
  });
  const {
    min,
    max,
    granularity,
    timezone,
    calendarIsOpen,
    setCalendarIsOpen,
    closeDialogOnSelection
  } = useBaseDatePickerState(internalValue, props);
  const clear = useCallback(() => {
    setIsPlaceholder(true);
    setInternalValue(now);
    setStateValue?.(null);
    setCalendarIsOpen(false);
  }, [now, setInternalValue, setStateValue, setCalendarIsOpen]);
  const [calendarDates, setCalendarDates] = useState(() => {
    return [toCalendarDate(internalValue)];
  });
  const setSelectedValue = useCallback(newValue => {
    if (min && newValue.compare(min) < 0) {
      newValue = min;
    } else if (max && newValue.compare(max) > 0) {
      newValue = max;
    }

    // preserve time
    const value = internalValue ? internalValue.set(newValue) : toSafeZoned(newValue, timezone);
    setInternalValue(value);
    setCalendarDates([toCalendarDate(value)]);
    setIsPlaceholder(false);
  }, [setInternalValue, min, max, internalValue, timezone]);
  const dayIsActive = useCallback(day => !isPlaceholder && isSameDay(internalValue, day), [internalValue, isPlaceholder]);
  const getCellProps = useCallback(date => {
    return {
      onClick: () => {
        setSelectedValue?.(date);
        if (closeDialogOnSelection) {
          setCalendarIsOpen?.(false);
        }
      }
    };
  }, [setSelectedValue, setCalendarIsOpen, closeDialogOnSelection]);
  return {
    selectedValue: internalValue,
    setSelectedValue: setInternalValue,
    calendarIsOpen,
    setCalendarIsOpen,
    dayIsActive,
    dayIsHighlighted: () => false,
    dayIsRangeStart: () => false,
    dayIsRangeEnd: () => false,
    getCellProps,
    calendarDates,
    setCalendarDates,
    isPlaceholder,
    clear,
    setIsPlaceholder,
    min,
    max,
    granularity,
    timezone,
    closeDialogOnSelection
  };
}