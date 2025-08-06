import { message } from '@ui/i18n/message';
export const DateRangeComparePresets = [{
  key: 0,
  label: message('Preceding period'),
  getRangeValue: range => {
    const startDate = range.start;
    const endDate = range.end;
    const diffInMilliseconds = endDate.toDate().getTime() - startDate.toDate().getTime();
    const diffInMinutes = diffInMilliseconds / (1000 * 60);
    const newStart = startDate.subtract({
      minutes: diffInMinutes
    });
    return {
      preset: 0,
      start: newStart,
      end: startDate
    };
  }
}, {
  key: 1,
  label: message('Same period last year'),
  getRangeValue: range => {
    return {
      start: range.start.subtract({
        years: 1
      }),
      end: range.end.subtract({
        years: 1
      }),
      preset: 1
    };
  }
}, {
  key: 2,
  label: message('Custom'),
  getRangeValue: range => {
    return {
      start: range.start.subtract({
        weeks: 1
      }),
      end: range.end.subtract({
        weeks: 1
      }),
      preset: 2
    };
  }
}];