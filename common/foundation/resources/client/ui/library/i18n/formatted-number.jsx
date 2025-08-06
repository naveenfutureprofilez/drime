import { Fragment, memo } from 'react';
import { useNumberFormatter } from '@ui/i18n/use-number-formatter';
import { shallowEqual } from '@ui/utils/shallow-equal';
export const FormattedNumber = memo(({
  value,
  ...options
}) => {
  const formatter = useNumberFormatter(options);
  if (isNaN(value)) {
    value = 0;
  }
  return <Fragment>{formatter.format(value)}</Fragment>;
}, shallowEqual);