import { parseAbsolute } from '@internationalized/date';
import { Fragment, memo } from 'react';
import { useDateFormatter } from '@ui/i18n/use-date-formatter';
import { useSettings } from '@ui/settings/use-settings';
import { shallowEqual } from '@ui/utils/shallow-equal';
import { useUserTimezone } from '@ui/i18n/use-user-timezone';
import { DateFormatPresets } from '@ui/i18n/formatted-date';
export const FormattedDateTimeRange = memo(({
  start,
  end,
  options,
  preset,
  timezone: propsTimezone
}) => {
  const {
    dates
  } = useSettings();
  const userTimezone = useUserTimezone();
  const timezone = propsTimezone || options?.timeZone || userTimezone;
  const formatter = useDateFormatter(options || DateFormatPresets[preset || dates?.format]);
  if (!start || !end) {
    return null;
  }
  let value;
  try {
    value = formatter.formatRange(castToDate(start, timezone), castToDate(end, timezone));
  } catch (e) {
    value = '';
  }
  return <Fragment>{value}</Fragment>;
}, shallowEqual);
function castToDate(date, timezone) {
  if (typeof date === 'string') {
    return parseAbsolute(date, timezone).toDate();
  }
  if ('toDate' in date) {
    return date.toDate(timezone);
  }
  return date;
}