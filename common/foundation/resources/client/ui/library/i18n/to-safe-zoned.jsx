import { toZoned } from '@internationalized/date';
export function toSafeZoned(date, timeZone, disambiguation) {
  try {
    return toZoned(date, timeZone, disambiguation);
  } catch (e) {
    return toZoned(date, 'UTC', disambiguation);
  }
}