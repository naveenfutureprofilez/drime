import { parseAbsoluteToLocal } from '@internationalized/date';
import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
import { DateRangePicker } from './date-range-picker';
export function FormDateRangePicker(props) {
  const {
    field: {
      onChange,
      onBlur,
      value,
      ref
    },
    fieldState: {
      invalid,
      error
    }
  } = useController({
    name: props.name
  });
  const formProps = {
    onChange: e => {
      onChange(e ? dateRangeToAbsoluteRange(e) : null);
    },
    onBlur,
    value: absoluteRangeToDateRange(value),
    invalid,
    errorMessage: error?.message,
    inputRef: ref
  };
  return <DateRangePicker {...mergeProps(formProps, props)} />;
}
export function absoluteRangeToDateRange(props) {
  const {
    start,
    end,
    preset
  } = props || {};
  const dateRange = {
    preset
  };
  try {
    if (start) {
      dateRange.start = typeof start === 'string' ? parseAbsoluteToLocal(start) : start;
    }
    if (end) {
      dateRange.end = typeof end === 'string' ? parseAbsoluteToLocal(end) : end;
    }
  } catch (e) {
    // ignore
  }
  return dateRange;
}
export function dateRangeToAbsoluteRange({
  start,
  end,
  preset
} = {}) {
  const absoluteRange = {
    preset
  };
  if (start) {
    absoluteRange.start = start.toAbsoluteString();
  }
  if (end) {
    absoluteRange.end = end.toAbsoluteString();
  }
  return absoluteRange;
}