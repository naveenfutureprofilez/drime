import { useSelectedLocale } from '@ui/i18n/selected-locale';
import { Fragment, memo } from 'react';
export const FormattedCountryName = memo(({
  code: countryCode
}) => {
  const {
    localeCode
  } = useSelectedLocale();
  const regionNames = new Intl.DisplayNames([localeCode], {
    type: 'region'
  });
  let formattedName;
  try {
    formattedName = regionNames.of(countryCode.toUpperCase());
  } catch (e) {}
  return <Fragment>{formattedName}</Fragment>;
});