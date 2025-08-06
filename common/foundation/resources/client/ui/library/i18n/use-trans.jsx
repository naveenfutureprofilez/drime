import { useCallback } from 'react';
import memoize from 'nano-memoize';
import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { handlePluralMessage } from '@ui/i18n/handle-plural-message';
import { shallowEqual } from '@ui/utils/shallow-equal';
export function useTrans() {
  const {
    lines,
    localeCode
  } = useSelectedLocale();
  const trans = useCallback(props => {
    return translate({
      ...props,
      lines,
      localeCode
    });
  }, [lines, localeCode]);
  return {
    trans
  };
}
const translate = memoize(props => {
  let {
    lines,
    message,
    values,
    localeCode
  } = props;
  if (message == null) {
    return '';
  }
  message = lines?.[message] || lines?.[message.toLowerCase()] || message;
  if (!values) {
    return message;
  }
  message = handlePluralMessage(localeCode, props);
  Object.entries(values).forEach(([key, value]) => {
    message = message.replace(`:${key}`, `${value}`);
  });
  return message;
}, {
  equals: shallowEqual,
  callTimeout: 0
});