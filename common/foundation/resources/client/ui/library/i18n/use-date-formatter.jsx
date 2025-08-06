import { DateFormatter } from '@internationalized/date';
import { useMemo, useRef } from 'react';
import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { shallowEqual } from '@ui/utils/shallow-equal';
export function useDateFormatter(options) {
  // Reuse last options object if it is shallowly equal, which allows the useMemo result to also be reused.
  const lastOptions = useRef(null);
  if (options && lastOptions.current && shallowEqual(options, lastOptions.current)) {
    options = lastOptions.current;
  }
  lastOptions.current = options;
  const {
    localeCode
  } = useSelectedLocale();
  return useMemo(() => new DateFormatter(localeCode, options), [localeCode, options]);
}