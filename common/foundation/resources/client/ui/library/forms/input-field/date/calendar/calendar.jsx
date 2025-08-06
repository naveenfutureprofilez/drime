import React, { Fragment } from 'react';
import { startOfMonth, toCalendarDate } from '@internationalized/date';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { CalendarMonth } from './calendar-month';
export function Calendar({
  state,
  visibleMonths = 1
}) {
  const isMobile = useIsMobileMediaQuery();
  if (isMobile) {
    visibleMonths = 1;
  }
  return <Fragment>
      {[...new Array(visibleMonths).keys()].map(index => {
      const startDate = toCalendarDate(startOfMonth(state.calendarDates[index]));
      const isFirst = index === 0;
      const isLast = index === visibleMonths - 1;
      return <CalendarMonth key={index} state={state} startDate={startDate} isFirst={isFirst} isLast={isLast} />;
    })}
    </Fragment>;
}