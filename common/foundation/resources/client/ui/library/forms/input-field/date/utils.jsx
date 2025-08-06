import { CalendarDate } from '@internationalized/date';
export function getDefaultGranularity(date) {
  if (date instanceof CalendarDate) {
    return 'day';
  }
  return 'minute';
}
export function dateIsInvalid(date, min, max) {
  return min != null && date.compare(min) < 0 || max != null && date.compare(max) > 0;
}