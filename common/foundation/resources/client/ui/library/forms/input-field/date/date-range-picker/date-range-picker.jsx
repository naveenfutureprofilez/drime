import React, { Fragment, useRef } from 'react';
import { DateRangeIcon } from '@ui/icons/material/DateRange';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { DatePickerField } from './date-picker-field';
import { useDateRangePickerState } from './use-date-range-picker-state';
import { ArrowRightAltIcon } from '@ui/icons/material/ArrowRightAlt';
import { DateSegmentList } from '../segments/date-segment-list';
import { DateRangeDialog } from './dialog/date-range-dialog';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
export function DateRangePicker(props) {
  const {
    granularity,
    closeDialogOnSelection,
    ...fieldProps
  } = props;
  const state = useDateRangePickerState(props);
  const inputRef = useRef(null);
  const isMobile = useIsMobileMediaQuery();
  const hideCalendarIcon = isMobile && granularity !== 'day';
  const dialog = <DialogTrigger offset={8} placement="bottom-start" isOpen={state.calendarIsOpen} onOpenChange={state.setCalendarIsOpen} type="popover" triggerRef={inputRef} returnFocusToTrigger={false} moveFocusToDialog={false}>
      <DateRangeDialog state={state} />
    </DialogTrigger>;
  const openOnClick = {
    onClick: e => {
      e.stopPropagation();
      e.preventDefault();
      if (!isHourSegment(e)) {
        state.setCalendarIsOpen(true);
      } else {
        state.setCalendarIsOpen(false);
      }
    }
  };
  const value = state.selectedValue;
  const onChange = state.setSelectedValue;
  return <Fragment>
      <DatePickerField ref={inputRef} wrapperProps={openOnClick} endAdornment={!hideCalendarIcon ? <DateRangeIcon /> : undefined} {...fieldProps}>
        <DateSegmentList isPlaceholder={state.isPlaceholder?.start} state={state} segmentProps={openOnClick} value={value.start} onChange={newValue => {
        onChange({
          start: newValue,
          end: value.end
        });
      }} />
        <ArrowRightAltIcon className="block flex-shrink-0 text-muted" size="md" />
        <DateSegmentList isPlaceholder={state.isPlaceholder?.end} state={state} segmentProps={openOnClick} value={value.end} onChange={newValue => {
        onChange({
          start: value.start,
          end: newValue
        });
      }} />
      </DatePickerField>
      {dialog}
    </Fragment>;
}
function isHourSegment(e) {
  return ['hour', 'minute', 'dayPeriod'].includes(e.currentTarget.ariaLabel || '');
}