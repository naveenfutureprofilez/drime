import { Fragment, memo } from 'react';
import { useNumberFormatter } from '@ui/i18n/use-number-formatter';
export const FormattedCurrency = memo(({
  value,
  currency
}) => {
  const formatter = useNumberFormatter({
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol'
  });
  if (isNaN(value)) {
    value = 0;
  }
  return <Fragment>{formatter.format(value)}</Fragment>;
});