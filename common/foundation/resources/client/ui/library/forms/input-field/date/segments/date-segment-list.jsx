import React, { useMemo } from 'react';
import { EditableDateSegment } from './editable-date-segment';
import { LiteralDateSegment } from './literal-segment';
import { useDateFormatter } from '@ui/i18n/use-date-formatter';
import { getSegmentLimits } from './utils/get-segment-limits';
export function DateSegmentList({
  segmentProps,
  state,
  value,
  onChange,
  isPlaceholder
}) {
  const {
    granularity
  } = state;
  const options = useMemo(() => {
    const memoOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };
    if (granularity === 'minute') {
      memoOptions.hour = 'numeric';
      memoOptions.minute = 'numeric';
    }
    return memoOptions;
  }, [granularity]);
  const formatter = useDateFormatter(options);
  const dateValue = useMemo(() => value.toDate(), [value]);
  const segments = useMemo(() => {
    return formatter.formatToParts(dateValue).map(segment => {
      const limits = getSegmentLimits(value, segment.type, formatter.resolvedOptions());
      const textValue = isPlaceholder && segment.type !== 'literal' ? limits.placeholder : segment.value;
      return {
        type: segment.type,
        text: segment.value === ', ' ? ' ' : textValue,
        ...limits,
        minLength: segment.type !== 'literal' ? String(limits.maxValue).length : 1
      };
    });
  }, [dateValue, formatter, isPlaceholder, value]);
  return <div className="flex items-center">
      {segments.map((segment, index) => {
      if (segment.type === 'literal') {
        return <LiteralDateSegment domProps={segmentProps} key={index} segment={segment} />;
      }
      return <EditableDateSegment isPlaceholder={isPlaceholder} domProps={segmentProps} state={state} value={value} onChange={onChange} segment={segment} key={index} />;
    })}
    </div>;
}